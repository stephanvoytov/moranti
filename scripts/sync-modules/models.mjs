/**
 * models.mjs — управление моделями (Model) и архивацией.
 *
 * Зависит от Prisma, поэтому не является чистой функцией.
 * Импортируется из sync-all.mjs.
 *
 * @module sync-modules/models
 */

import { toBigInt } from "./transform.mjs";
import { deriveModelName } from "./model-naming.mjs";

/**
 * Создаёт/обновляет Model из WB imtId групп.
 * Одиночные товары (1 шт.) модель не получают — остаются нераспределёнными.
 * Название модели формируется из префикса SKU товаров.
 *
 * @param {import("@prisma/client").PrismaClient} prisma
 * @param {Array} wbCards
 * @param {Function} resolveCategory — из transform.mjs
 * @param {object} log — логгер
 * @param {{ dry: boolean }} flags
 * @returns {Promise<{ created: number, assigned: number }>}
 */
export async function syncModels(prisma, wbCards, resolveCategory, log, flags) {
  const imtGroups = new Map();
  for (const card of wbCards) {
    const imtId = card.imtID ?? card.imt_id;
    if (!imtId) continue;
    if (!imtGroups.has(imtId)) {
      imtGroups.set(imtId, { nmIDs: new Set(), category: resolveCategory(card) });
    }
    const g = imtGroups.get(imtId);
    g.nmIDs.add(card.nmID);
  }

  if (imtGroups.size === 0) {
    log.line("  No imtId groups found in WB cards");
    return { created: 0, assigned: 0 };
  }

  // Собираем все nmID и достаём товары из БД одним массивом
  const allNmIds = [...new Set([...imtGroups.values()].flatMap(g => [...g.nmIDs]))];
  const dbProducts = await prisma.product.findMany({
    where: { wbArticle: { in: allNmIds }, archivedAt: null },
    select: { id: true, wbArticle: true, sku: true, name: true, modelId: true },
  });

  // Индекс: wbArticle → product
  const productByArticle = new Map();
  for (const p of dbProducts) {
    const art = Number(p.wbArticle);
    if (art) productByArticle.set(art, p);
  }

  let created = 0;
  let assigned = 0;
  let skipped = 0;

  for (const [imtId, group] of imtGroups) {
    const bigIntId = toBigInt(imtId);
    const variantProducts = [...group.nmIDs].map(n => productByArticle.get(n)).filter(Boolean);

    // Если модель уже существует — работаем с ней (не трогаем одиночные legacy)
    let model = await prisma.model.findFirst({ where: { imtId: bigIntId } });

    // Категория модели — мажоритарная от товаров в группе (не от первого)
    const catCounts = new Map();
    for (const p of variantProducts) {
      catCounts.set(p.category, (catCounts.get(p.category) || 0) + 1);
    }
    let majorityCat = group.category || "crossbody";
    let maxCount = 0;
    for (const [cat, count] of catCounts) {
      if (count > maxCount) { maxCount = count; majorityCat = cat; }
    }

    if (model) {
      // Существующая модель: обновляем имя + категорию
      const skus = variantProducts.map(p => p.sku).filter(Boolean);
      const names = [...new Set(variantProducts.map(p => p.name).filter(Boolean))];
      const newName = deriveModelName(skus, names, majorityCat);
      const updates = {};
      if (newName !== model.name) updates.name = newName;
      if (majorityCat !== model.category) updates.category = majorityCat;
      if (Object.keys(updates).length > 0) {
        if (!flags.dry) {
          await prisma.model.update({ where: { id: model.id }, data: updates });
          if (updates.name) log.line(`  Renamed: ${model.id} → "${newName}"`);
          if (updates.category) log.line(`  Re-categorized: ${model.id} → "${majorityCat}"`);
        }
      }
    } else {
      // Новая модель: создаём только если ≥2 товаров в БД
      if (variantProducts.length < 2) {
        skipped++;
        continue;
      }

      const skus = variantProducts.map(p => p.sku).filter(Boolean);
      const names = [...new Set(variantProducts.map(p => p.name).filter(Boolean))];
      const modelName = deriveModelName(skus, names, majorityCat);
      const slug = `model-wb-${imtId}`;

      if (!flags.dry) {
        model = await prisma.model.create({
          data: {
            id: slug,
            name: modelName,
            slug,
            category: majorityCat,
            description: "",
            imtId: bigIntId,
          },
        });
        created++;
        log.line(`  Created model: ${model.id} ("${modelName}")`);
      } else {
        created++;
        log.line(`  Would create: ${slug} ("${modelName}")`);
      }
    }

    // Assign: привязываем товары к модели
    if (model) {
      for (const p of variantProducts) {
        if (p.modelId !== model.id) {
          if (!flags.dry) {
            await prisma.product.update({
              where: { id: p.id },
              data: { modelId: model.id },
            });
          }
          assigned++;
          log.line(`  Assigned ${p.id} → ${model.id}`);
        }
      }
    }
  }

  if (skipped > 0) {
    log.line(`  Skipped (single variant): ${skipped} groups`);
  }

  return { created, assigned };
}

/**
 * Группирует Ozon товары по атрибуту 9048 (модель) и привязывает к модели.
 * Одиночные товары (1 шт.) модель не получают.
 *
 * @param {import("@prisma/client").PrismaClient} prisma
 * @param {Map} attrMap — offerId → attrs
 * @param {object} log — логгер
 * @returns {Promise<{ created: number, assigned: number }>}
 */
export async function syncOzonModels(prisma, attrMap, log) {
  const groups = new Map();

  for (const [offerId, attrs] of attrMap) {
    if (!attrs?.attributes) continue;
    const modelAttr = attrs.attributes.find((a) => a.id === 9048);
    if (!modelAttr?.values?.length) continue;
    const vals = modelAttr.values.map((v) => v.value).filter(Boolean);
    if (vals.length === 0) continue;
    const key = vals.join(" ");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(offerId);
  }

  let created = 0;
  let assigned = 0;
  let skipped = 0;

  for (const [ozonModelName, offerIds] of groups) {
    const products = await prisma.product.findMany({
      where: { sku: { in: offerIds } },
      select: { id: true, sku: true, name: true, modelId: true, category: true },
    });
    if (products.length === 0) continue;

    const existingModelId = products.find((p) => p.modelId)?.modelId;

    if (existingModelId) {
      for (const p of products) {
        if (p.modelId !== existingModelId) {
          await prisma.product.update({ where: { id: p.id }, data: { modelId: existingModelId } });
          assigned++;
          log.line(`  Assigned ${p.id} → ${existingModelId} (Ozon)`);
        }
      }
    } else {
      // Создаём только если ≥2 товаров
      if (products.length < 2) {
        skipped++;
        continue;
      }

      // Мажоритарная категория
      const catCounts = new Map();
      for (const p of products) catCounts.set(p.category, (catCounts.get(p.category) || 0) + 1);
      let majorityCat = products[0].category || "crossbody";
      let maxCount = 0;
      for (const [cat, c] of catCounts) { if (c > maxCount) { maxCount = c; majorityCat = cat; } }

      const skus = products.map(p => p.sku).filter(Boolean);
      const names = [...new Set(products.map(p => p.name).filter(Boolean))];
      const modelName = deriveModelName(skus, names, majorityCat);
      const slug = "model-ozon-" + modelName
        .toLowerCase().replace(/[/\s]+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");

      let model = await prisma.model.findFirst({ where: { slug } });
      if (!model) {
        model = await prisma.model.create({
          data: { id: slug, name: modelName, slug, category: majorityCat, description: "" },
        });
        created++;
        log.line(`  Created Ozon model: ${model.id} ("${modelName}")`);
      }
      for (const p of products) {
        if (p.modelId !== model.id) {
          await prisma.product.update({ where: { id: p.id }, data: { modelId: model.id } });
          assigned++;
          log.line(`  Assigned ${p.id} → ${model.id} (Ozon)`);
        }
      }
    }
  }

  if (skipped > 0) {
    log.line(`  Skipped Ozon (single variant): ${skipped} groups`);
  }

  return { created, assigned };
}

/**
 * Архивирует товары, которых нет ни в WB, ни в Ozon.
 *
 * @param {import("@prisma/client").PrismaClient} prisma
 * @param {Array} dbProducts — все товары из БД
 * @param {number[]} wbArticles — активные nmID
 * @param {Array} ozonItems — [{ productId, productSku }]
 * @param {number[]} trashArticles — nmID из корзины WB
 * @param {boolean} wbChecked — true если WB фаза запускалась
 * @param {boolean} ozonChecked — true если Ozon фаза запускалась
 * @param {object} log — логгер
 * @param {{ dry: boolean }} flags
 * @returns {Promise<{ archived: number, markedOutOfStock: number }>}
 */
export async function archiveGoneProducts(
  prisma, dbProducts, wbArticles, ozonItems, trashArticles,
  wbChecked = true, ozonChecked = true, log, flags
) {
  const wbSet = new Set(wbArticles);
  const trashSet = new Set(trashArticles);
  const ozonProductIdSet = new Set((ozonItems || []).map((i) => i.productId).filter(Boolean));
  const ozonSkuSet = new Set((ozonItems || []).map((i) => i.productSku).filter(Boolean));
  let archived = 0;
  let markedOutOfStock = 0;

  for (const db of dbProducts) {
    const wbArt = db.wbArticle ? Number(db.wbArticle) : null;
    const ozonArt = db.ozonArticle ? Number(db.ozonArticle) : null;

    if (!ozonChecked && ozonArt) continue;
    if (!wbChecked && wbArt) continue;

    const onWb = wbChecked && wbArt && wbSet.has(wbArt);
    const onOzon = ozonChecked && ozonArt && (ozonSkuSet.has(ozonArt) || ozonProductIdSet.has(ozonArt));
    const inWbTrash = wbArt && trashSet.has(wbArt);

    if (onWb || onOzon) {
      if (db.archivedAt) {
        if (!flags.dry) {
          await prisma.product.update({
            where: { id: db.id },
            data: { archivedAt: null, inStock: true },
          });
        }
        log.line(`  Restored: ${db.id} article=${wbArt || ozonArt} ${db.name}`);
      }
      continue;
    }

    // Не на маркетплейсе и уже архивирован — пропускаем
    if (db.archivedAt) continue;

    if (!flags.dry) {
      await prisma.product.update({
        where: { id: db.id },
        data: { archivedAt: new Date(), inStock: false },
      });
    }
    archived++;
    const reason = inWbTrash ? "WB trash" : "not on marketplace";
    log.line(`  Archived (${reason}): ${db.id} article=${wbArt || ozonArt} ${db.name}`);
  }

  return { archived, markedOutOfStock };
}
