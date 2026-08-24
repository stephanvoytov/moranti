/**
 * import-reviews.mjs — единоразовый импорт отзывов с Wildberries и Ozon.
 *
 * WB:   публичный API feedbacks (feedbacks1/2.wb.ru/feedbacks/v1/{imtId}),
 *       отзывы группируются по imtId модели, к товару привязываются по nmId.
 * Ozon: composer-api через headless Chromium (ozon-browser.mjs),
 *       страница /product/{sku}/reviews с пагинацией.
 *
 * Идемпотентно: уникальный индекс Review(source, externalId) — повторный
 * запуск не создаёт дублей (createMany skipDuplicates).
 *
 * Использование:
 *   ENV_FILE=vercel-preview.env node scripts/import-reviews.mjs            # импорт в БД
 *   ENV_FILE=... DRY=1 node scripts/import-reviews.mjs                     # dry-run, без записи
 *   SKIP_OZON=1 / SKIP_WB=1                                                # только один источник
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config({ path: process.env.ENV_FILE || ".env.local" });

const DRY = process.env.DRY === "1";
const SKIP_WB = process.env.SKIP_WB === "1";
const SKIP_OZON = process.env.SKIP_OZON === "1";
const OZON_DELAY_MS = Number(process.env.OZON_DELAY_MS || 800);

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL || "" }),
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ============================================================
// Wildberries
// ============================================================

/**
 * Тянет все отзывы модели (imtId) с публичного feedbacks API WB.
 * Возвращает [] при недоступности обоих хостов.
 */
async function fetchWbFeedbacks(imtId) {
  for (const host of ["feedbacks1.wb.ru", "feedbacks2.wb.ru"]) {
    try {
      const res = await fetch(`https://${host}/feedbacks/v1/${imtId}`);
      if (!res.ok) continue;
      const data = await res.json();
      return Array.isArray(data.feedbacks) ? data.feedbacks : [];
    } catch {
      // пробуем следующий хост
    }
  }
  return [];
}

async function importWbReviews(products) {
  // Группируем товары по imtId модели → один запрос на модель, а не на товар
  const byImt = new Map(); // imtId -> [{ productId, wbArticle }]
  for (const p of products) {
    if (!p.wbArticle || !p.model?.imtId) continue;
    const key = String(p.model.imtId);
    if (!byImt.has(key)) byImt.set(key, []);
    byImt.get(key).push({ productId: p.id, wbArticle: String(p.wbArticle) });
  }
  console.log(`[WB] моделей с imtId: ${byImt.size}, товаров: ${[...byImt.values()].flat().length}`);

  const rows = []; // { productId, externalId, author, rating, text, pros, cons, reviewedAt }
  let models = 0;
  for (const [imtId, items] of byImt) {
    const feedbacks = await fetchWbFeedbacks(imtId);
    models++;
    if (models % 10 === 0) console.log(`[WB] ${models}/${byImt.size} моделей…`);
    await sleep(300);

    const nmToProduct = new Map(items.map((i) => [i.wbArticle, i.productId]));
    for (const f of feedbacks) {
      const productId = nmToProduct.get(String(f.nmId));
      if (!productId) continue; // отзыв про другой цвет модели
      rows.push({
        productId,
        source: "wb",
        externalId: String(f.id),
        author: f.userName || null,
        rating: typeof f.productValuation === "number" ? f.productValuation : null,
        text: (f.text || "").trim(),
        pros: f.pros ? String(f.pros).trim() : null,
        cons: f.cons ? String(f.cons).trim() : null,
        reviewedAt: f.createdDate ? new Date(f.createdDate) : null,
      });
    }
  }
  console.log(`[WB] собрано отзывов: ${rows.length}`);
  return rows;
}

// ============================================================
// Ozon
// ============================================================

/**
 * Парсит виджет webListReviews из composer-ответа страницы отзывов.
 */
function parseOzonReviewPage(page) {
  const ws = page?.widgetStates || {};
  const key = Object.keys(ws).find((k) => String(k).split("-")[0] === "webListReviews");
  if (!key) return { reviews: [], paging: null };
  try {
    const w = JSON.parse(ws[key]);
    return {
      reviews: Array.isArray(w.reviews) ? w.reviews : [],
      paging: w.paging || null,
    };
  } catch {
    return { reviews: [], paging: null };
  }
}

/**
 * Тянет все отзывы товара Ozon (с пагинацией до конца списка).
 * fetchJson передаётся сверху — один браузер на весь импорт.
 */
async function fetchOzonReviews(fetchJson, sku) {
  const all = [];
  let expectedTotal = null;
  const maxPages = 20; // страховка от бесконечной пагинации

  for (let page = 1; page <= maxPages; page++) {
    const path = `/product/${sku}/reviews${page > 1 ? `?page=${page}` : ""}`;
    const body = await fetchJson(path);
    const { reviews, paging } = parseOzonReviewPage(body);
    all.push(...reviews);
    if (paging?.total != null) expectedTotal = paging.total;
    const done =
      reviews.length === 0 || // пустая страница — конец
      (expectedTotal != null && all.length >= expectedTotal) || // собрали всё
      !paging?.links?.some((l) => l.urlParams && l.urlParams.includes("page")); // нет следующей страницы
    if (done) break;
    await sleep(OZON_DELAY_MS);
  }

  // Дедуп по uuid (пересечения страниц)
  const seen = new Set();
  return all.filter((r) => (seen.has(r.uuid) ? false : (seen.add(r.uuid), true)));
}

async function importOzonReviews(products) {
  const { fetchJson, isEnabled, shutdown } = await import("./sync-modules/ozon-browser.mjs");
  const skus = products.filter((p) => p.ozonArticle).map((p) => String(p.ozonArticle));
  console.log(`[Ozon] товаров с артикулом: ${skus.length}`);
  if (skus.length === 0 || !isEnabled()) return [];

  // Карта всех артикулов Ozon → productId (включая архив): отзыв приходит
  // на странице любого цвета модели, а его itemId указывает на конкретный вариант
  const allProducts = await prisma.product.findMany({
    where: { ozonArticle: { not: null } },
    select: { id: true, ozonArticle: true },
  });
  const articleToProduct = new Map(allProducts.map((p) => [String(p.ozonArticle), p.id]));
  const skuToProduct = new Map(
    products.filter((p) => p.ozonArticle).map((p) => [String(p.ozonArticle), p.id])
  );

  const rows = [];
  try {
    for (let i = 0; i < skus.length; i++) {
      const sku = skus[i];
      try {
        const raw = await fetchOzonReviews(fetchJson, sku);
        for (const r of raw) {
          const text = String(r.content?.comment || "").trim();
          const rating = typeof r.content?.score === "number" ? r.content.score : null;
          if (!text && !rating) continue;
          // Атрибуция по itemId отзыва (SKU конкретного цвета), fallback — запрошенный SKU
          const owner =
            (r.itemId != null && articleToProduct.get(String(r.itemId))) ||
            skuToProduct.get(sku);
          if (!owner) continue;
          rows.push({
            productId: owner,
            source: "ozon",
            externalId: String(r.uuid || `${sku}-${r.createdAt}-${i}`),
            author: r.author?.firstName || r.author?.fio || null,
            rating,
            text,
            pros: r.content?.positive ? String(r.content.positive).trim() : null,
            cons: r.content?.negative ? String(r.content.negative).trim() : null,
            reviewedAt: r.createdAt ? new Date(r.createdAt * 1000) : null,
          });
        }
        console.log(`[Ozon] ${i + 1}/${skus.length} SKU ${sku}: отзывов ${raw.length}`);
      } catch (e) {
        console.error(`[Ozon] ${i + 1}/${skus.length} SKU ${sku}: ошибка — ${e.message}`);
      }
      if (i < skus.length - 1) await sleep(OZON_DELAY_MS);
    }
  } finally {
    // Один запуск браузера на весь импорт — закрываем в конце
    await shutdown();
  }
  console.log(`[Ozon] собрано отзывов: ${rows.length}`);
  return rows;
}

// ============================================================
// Main
// ============================================================

async function main() {
  const products = await prisma.product.findMany({
    where: { archivedAt: null },
    select: {
      id: true,
      name: true,
      wbArticle: true,
      ozonArticle: true,
      model: { select: { imtId: true } },
    },
  });
  console.log(`Товаров в БД: ${products.length} (DRY=${DRY})`);

  let rows = [];
  if (!SKIP_WB) rows.push(...(await importWbReviews(products)));
  if (!SKIP_OZON) rows.push(...(await importOzonReviews(products)));

  // Дедуп внутри батча: один отзыв может прийти и из модели WB, и повторно
  const seen = new Set();
  rows = rows.filter((r) => {
    const k = `${r.source}:${r.externalId}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  const withText = rows.filter((r) => r.text).length;
  console.log(`Итого уникальных отзывов: ${rows.length} (с текстом: ${withText})`);

  if (DRY) {
    const bySource = {};
    for (const r of rows) bySource[r.source] = (bySource[r.source] || 0) + 1;
    console.log("DRY-режим — ничего не записано.", bySource);
    return;
  }

  // createMany + skipDuplicates — идемпотентность по (source, externalId)
  let inserted = 0;
  const CHUNK = 200;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const res = await prisma.review.createMany({ data: chunk, skipDuplicates: true });
    inserted += res.count;
  }
  console.log(`Записано новых отзывов: ${inserted} (пропущено дублей: ${rows.length - inserted})`);

  const total = await prisma.review.count();
  const productsCovered = await prisma.review.groupBy({
    by: ["productId"],
    _count: { id: true },
  });
  console.log(`Всего в БД: ${total} отзывов на ${productsCovered.length} товаров`);
}

main()
  .catch((e) => {
    console.error("FATAL:", e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
