#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });
/**
 * sync-all.mjs — Единый скрипт синхронизации Moranti.
 *
 * Использует ТОЛЬКО стабильные официальные API:
 *   Wildberries: Content API
 *   Ozon:        Seller API (v3 + v4)
 *
 * Без ключей (WB_API_KEY / OZON_*) — падает с ошибкой.
 *
 * Использование:
 *   node scripts/sync-all.mjs              # полный прогон
 *   node scripts/sync-all.mjs --dry        # пробный (только чтение)
 *   node scripts/sync-all.mjs --wb-only    # только Wildberries
 *   node scripts/sync-all.mjs --ozon-only  # только Ozon
 */

import { writeFileSync, existsSync, readFileSync, mkdirSync } from "fs";
import { PrismaClient } from "@prisma/client";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { wbToCategory, CATEGORY_RU } = require("./wb-categories.js");
const { generateName } = require("./name-generator.js");

/* =============================================
   Config
   ============================================= */

const WB_CONTENT_API = "https://content-api.wildberries.ru";
const WB_PRICES_API = "https://discounts-prices-api.wildberries.ru";
const OZON_API = "https://api-seller.ozon.ru";
const SUPPLIER_ID = 312222;

const ITEMS_PER_WB_CARDS = 100;
const ITEMS_PER_OZON_BATCH = 100;
const FETCH_TIMEOUT = 30000;
const RATE_LIMIT_PAUSE = 600;

const flags = {
  dry: process.argv.includes("--dry"),
  wbOnly: process.argv.includes("--wb-only"),
  ozonOnly: process.argv.includes("--ozon-only"),
};

/* =============================================
   Logger
   ============================================= */

const log = {
  lines: [],

  write(msg) {
    process.stdout.write(msg);
    this.lines.push(msg);
  },

  line(msg) {
    console.log(msg);
    this.lines.push(msg + "\n");
  },
};

/* =============================================
   CDN helpers (vol/part → URLs, adapted from wb-utils.mjs)
   ============================================= */

function getVolPart(article) {
  return {
    vol: Math.floor(article / 100000),
    part: Math.floor(article / 1000),
  };
}

function cdnImageUrl(article, index = 1, size = "big") {
  const { vol, part } = getVolPart(article);
  return `https://kgd-basket-cdn-01bl.geobasket.ru/vol${vol}/part${part}/${article}/images/${size}/${index}.webp`;
}

function cdnImageUrls(article, photoCount) {
  const urls = [];
  for (let i = 1; i <= photoCount && i <= 30; i++) {
    urls.push(cdnImageUrl(article, i));
  }
  return urls;
}

/* =============================================
   Generic fetch with auth
   ============================================= */

async function wbFetch(baseUrl, path, options = {}, attempt = 1) {
  const headers = {
    Authorization: options.apiKey,
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const url = baseUrl + path;
  const resp = await fetch(url, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: AbortSignal.timeout(FETCH_TIMEOUT),
  });

  if (resp.status === 429 && attempt <= 3) {
    const retryAfter = parseInt(resp.headers.get("Retry-After") || "1", 10);
    const delay = Math.min(retryAfter * 1000, 30000); // не дольше 30с
    log.line(`  429 (attempt ${attempt}): retry ${delay}ms`);
    await new Promise((r) => setTimeout(r, delay));
    return wbFetch(baseUrl, path, options, attempt + 1);
  }

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`WB API ${resp.status} — ${url}\n${text.slice(0, 300)}`);
  }

  return resp.json();
}

async function ozonFetch(path, body, clientId, apiKey, attempt = 1) {
  const url = OZON_API + path;
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Client-Id": clientId,
      "Api-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(FETCH_TIMEOUT),
  });

  if (resp.status === 429 && attempt <= 3) {
    const retryAfter = parseInt(resp.headers.get("Retry-After") || "2", 10);
    const delay = Math.min(retryAfter * 1000 * attempt, 30000); // экспонента × номер попытки
    log.line(`  429 (attempt ${attempt}): retry ${delay}ms`);
    await new Promise((r) => setTimeout(r, delay));
    return ozonFetch(path, body, clientId, apiKey, attempt + 1);
  }

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`Ozon API ${resp.status} — ${url}\n${text.slice(0, 300)}`);
  }

  return resp.json();
}

/* =============================================
   Pipeline 1: WB Content API — все активные карточки
   ============================================= */

async function wbFetchAllCards(apiKey, trash = false) {
  const endpoint = trash
    ? "/content/v2/get/cards/trash"
    : "/content/v2/get/cards/list";

  const allCards = [];
  let cursor = { limit: ITEMS_PER_WB_CARDS };
  let total = Infinity;

  log.write(`  Fetching ${trash ? "trash" : "active"} cards:`);

  while (allCards.length < total) {
    const body = {
      settings: {
        cursor,
        filter: { withPhoto: -1 },
      },
    };

    const data = await wbFetch(WB_CONTENT_API, endpoint, {
      method: "POST",
      apiKey,
      body,
    });

    const cards = data.cards || [];
    allCards.push(...cards);
    total = data.total || allCards.length;

    log.write(` ${allCards.length}/${total}`);

    if (data.cursor && cards.length === ITEMS_PER_WB_CARDS) {
      cursor = data.cursor;
      await new Promise((r) => setTimeout(r, 200));
    } else {
      break;
    }
  }

  log.line(` — ${allCards.length} cards`);
  return allCards;
}

/* =============================================
    Pipeline 1b: WB Pricing API — цены
    ============================================= */

async function wbFetchPrices(apiKey, nmIDs) {
  if (!nmIDs || nmIDs.length === 0) return new Map();
  const priceMap = new Map();
  const BATCH = 100;

  log.write(`  Fetching WB prices for ${nmIDs.length} cards:`);

  for (let i = 0; i < nmIDs.length; i += BATCH) {
    const batch = nmIDs.slice(i, i + BATCH);
    try {
      const data = await wbFetch(WB_PRICES_API, "/api/v2/list/goods/filter", {
        method: "POST",
        apiKey,
        body: { nmIDs: batch },
      });
      const goods = data?.data?.listGoods || [];
      for (const g of goods) {
        priceMap.set(g.nmID, {
          price: g.price,
          discountedPrice: g.discountedPrice,
        });
      }
      log.write(` ${priceMap.size}/${nmIDs.length}`);
    } catch (err) {
      log.line(`\n  Price fetch error (batch ${i}): ${err.message}`);
    }

    // Rate limit: не более 3 запросов в секунду
    if (i + BATCH < nmIDs.length) {
      await new Promise((r) => setTimeout(r, 350));
    }
  }

  log.line(` — ${priceMap.size} priced`);
  return priceMap;
}

/* =============================================
    Pipeline 2: Ozon API — все товары
   ============================================= */

async function ozonFetchAllProducts(clientId, apiKey) {
  log.write("  Fetching Ozon product list:");

  let lastId = null;
  const allItems = [];

  while (true) {
    const body = { filter: { visibility: "ALL" }, limit: 1000 };
    if (lastId) body.last_id = lastId;
    const data = await ozonFetch(
      "/v3/product/list",
      body,
      clientId,
      apiKey,
    );

    const items = data?.result?.items || [];
    for (const item of items) {
      allItems.push({
        offerId: String(item.offer_id || ""),
        productId: Number(item.product_id || 0),
      });
    }
    log.write(` ${allItems.length}`);

    lastId = data?.result?.last_id;
    if (!lastId || items.length < 1000) break;
    await new Promise((r) => setTimeout(r, 200));
  }

  log.line(` — ${allItems.length} products`);
  return allItems;
}

async function ozonFetchProductInfo(clientId, apiKey, offerIds) {
  if (offerIds.length === 0) return new Map();

  const results = [];

  for (let i = 0; i < offerIds.length; i += ITEMS_PER_OZON_BATCH) {
    const chunk = offerIds.slice(i, i + ITEMS_PER_OZON_BATCH);

    const data = await ozonFetch(
      "/v3/product/info/list",
      { offer_id: chunk, visibility: "ALL" },
      clientId,
      apiKey,
    );

    results.push(...(data.items || []));
    await new Promise((r) => setTimeout(r, 100));
  }

  const infoMap = new Map();
  for (const item of results) {
    infoMap.set(String(item.offer_id), item);
  }
  log.line(`  Info: ${infoMap.size} products`);
  return infoMap;
}

async function ozonFetchProductAttributes(clientId, apiKey, offerIds) {
  if (offerIds.length === 0) return new Map();

  const results = [];

  for (let i = 0; i < offerIds.length; i += ITEMS_PER_OZON_BATCH) {
    const chunk = offerIds.slice(i, i + ITEMS_PER_OZON_BATCH);

    const data = await ozonFetch(
      "/v4/product/info/attributes",
      { filter: { offer_id: chunk }, limit: 100 },
      clientId,
      apiKey,
    );

    results.push(...(data.result || []));
    await new Promise((r) => setTimeout(r, 100));
  }

  const attrMap = new Map();
  for (const item of results) {
    attrMap.set(String(item.offer_id), item);
  }
  log.line(`  Attributes: ${attrMap.size} products`);
  return attrMap;
}

async function ozonFetchRatings(clientId, apiKey, productIds) {
  if (productIds.length === 0) return new Map();

  const results = [];

  for (let i = 0; i < productIds.length; i += 100) {
    const chunk = productIds.slice(i, i + 100);

    const data = await ozonFetch(
      "/v1/product/rating-by-sku",
      { skus: chunk.map(String) },
      clientId,
      apiKey,
    );

    results.push(...(data.products || []));
    await new Promise((r) => setTimeout(r, 100));
  }

  const ratingMap = new Map();
  for (const item of results) {
    ratingMap.set(Number(item.sku), {
      rating: item.rating != null ? item.rating / 20 : null, // 0–100 → 0–5
    });
  }
  log.line(`  Ratings: ${ratingMap.size} products`);
  return ratingMap;
}

/* =============================================
   Data transformation: extract fields from API responses
   ============================================= */

/**
 * Извлекает цвет из card.json-подобной структуры WB Content API.
 */
function extractColorName(card) {
  const colors = card.colors || [];
  if (colors.length > 0) {
    return colors.map((c) => c.name).filter(Boolean).join(", ");
  }
  // Fallback: из характеристик
  const chars = card.characteristics || [];
  for (const c of chars) {
    if (c.name === "Цвет" || c.name === "Цвет товара") {
      const vals = Array.isArray(c.value) ? c.value : [c.value];
      return vals.filter(Boolean).join(", ");
    }
  }
  return null;
}

/**
 * Извлекает состав из card.json-подобной структуры WB Content API.
 */
function extractComposition(card) {
  const comps = card.compositions || [];
  if (comps.length > 0) {
    return comps.map((c) => c.name).filter(Boolean).join("; ");
  }
  const chars = card.characteristics || [];
  for (const c of chars) {
    if (c.name === "Состав") {
      const vals = Array.isArray(c.value) ? c.value : [c.value];
      return vals.filter(Boolean).join(", ");
    }
  }
  return null;
}

/**
 * Извлекает описание из WB Content API card.
 */
function extractDescription(card) {
  if (card.description) return card.description;

  // Может быть в текстовых характеристиках
  const chars = card.characteristics || [];
  for (const c of chars) {
    if (c.name === "Описание" || c.name === "Полное описание") {
      const vals = Array.isArray(c.value) ? c.value : [c.value];
      return vals.filter(Boolean).join("\n");
    }
  }
  return "";
}

/**
 * Извлекает photo_count из WB Content API card.
 */
function extractPhotoCount(card) {
  const media = card.media || {};
  if (media.photo_count) return media.photo_count;

  const photos = card.photos || [];
  if (photos.length > 0) return photos.length;

  return 1;
}

/**
 * Нормализует категорию из WB Content API card.
 * Content API возвращает subjectID — прямой ключ для CATEGORY_MAP (1,2,3,5,6,7,8,25).
 */
function resolveCategory(card) {
  const subjId = card.subjectID || card.subject_id || null;
  const subjName = card.subjectName || card.subject_name || null;
  const objectId = card.objectID || card.object_id || null;
  // subjectID из Content API — точный subjId для CATEGORY_MAP
  return wbToCategory(objectId, subjName, subjId);
}

/* =============================================
   Ozon data extraction helpers
   ============================================= */

function ozonExtractColor(info, attrs) {
  // Из атрибутов
  if (attrs?.attributes) {
    for (const a of attrs.attributes) {
      if (a.attribute_name === "Цвет" || a.attribute_name === "Цвет товара") {
        const vals = Array.isArray(a.value) ? a.value : [a.value];
        return vals.filter(Boolean).join(", ");
      }
    }
  }
  // Fallback: color_image (только строка)
  if (info?.color_image && typeof info.color_image === "string") return info.color_image;
  return null;
}

function ozonExtractComposition(attrs) {
  if (!attrs?.attributes) return null;
  for (const a of attrs.attributes) {
    if (a.attribute_name === "Состав" || a.attribute_name === "Материал") {
      const vals = Array.isArray(a.value) ? a.value : [a.value];
      return vals.filter(Boolean).join(", ");
    }
  }
  return null;
}

function ozonExtractDescription(attrs) {
  if (attrs?.description) return attrs.description;
  return "";
}

function ozonExtractCharacteristics(attrs) {
  if (!attrs?.attributes) return [];
  return attrs.attributes.map((a) => ({
    name: a.attribute_name,
    value: Array.isArray(a.value) ? a.value.join(", ") : String(a.value || ""),
  }));
}

function ozonExtractCategory(info, attrs) {
  // Приоритет: атрибут id=20259 (назначение/тип сумки)
  if (attrs?.attributes) {
    const typeAttr = attrs.attributes.find(a => a.id === 20259);
    if (typeAttr?.values?.length) {
      const vals = typeAttr.values.map(v => String(v.value).toLowerCase());

      if (vals.some(v => v === "шоппер" || v === "шопер")) return "tote";
      if (vals.some(v => v.includes("рюкзак"))) return "backpack";
      if (vals.some(v => v.includes("седл"))) return "saddle";
      if (vals.some(v => v.includes("багет"))) return "baguette";
      if (vals.some(v => v.includes("на плечо") || v.includes("тоут"))) return "na-plecho";
      if (vals.some(v => v.includes("кросс-боди") || v.includes("кроссбоди"))) return "crossbody";
      if (vals.some(v => v.includes("клатч"))) return "crossbody";

      logger.warn("ozonExtractCategory: unhandled type values", {
        offer_id: attrs.offer_id || info?.offer_id,
        values: vals,
      });
    }

    // Дополнительно: атрибут 9048 (модель) — для товаров без 20259 (напр. Sedlo)
    const modelAttr = attrs.attributes.find(a => a.id === 9048);
    if (modelAttr?.values?.length) {
      const modelVals = modelAttr.values.map(v => String(v.value).toLowerCase());
      if (modelVals.some(v => v.includes("sedlo") || v.includes("седл") || v.includes("saddle"))) return "saddle";
    }
  }

  // Fallback: из названия товара
  const text = [
    info?.category,
    info?.name,
    info?.offer_id,
  ].filter(Boolean).join(" ").toLowerCase();

  if (!text) return null;

  if (text.includes("шоппер") || text.includes("шопер") || text.includes("shopp")) return "tote";
  if (text.includes("рюкзак") || text.includes("backpack") || text.includes("rucksack")) return "backpack";
  // "седл" ДО "через плечо" — Sedlo содержит оба слова, седло важнее
  if (text.includes("седл") || text.includes("седло") || text.includes("saddle") || text.includes("sedlo")) return "saddle";
  if (text.includes("через плечо") || text.includes("na plecho") || text.includes("na-plecho")) return "na-plecho";
  if (text.includes("багет") || text.includes("baguette")) return "baguette";
  if (text.includes("кросс") || text.includes("crossbody") || text.includes("клатч") || text.includes("clutch")) return "crossbody";
  if (text.includes("плеч") || text.includes("наплеч")) return "na-plecho";

  return null;
}

/* =============================================
   DB operations
   ============================================= */

async function getExistingProducts(prisma) {
  const all = await prisma.product.findMany({ orderBy: { id: "asc" } });
  return {
    byWbArticle: new Map(all.filter((p) => p.wbArticle).map((p) => [Number(p.wbArticle), p])),
    byOzonArticle: new Map(all.filter((p) => p.ozonArticle).map((p) => [Number(p.ozonArticle), p])),
    byId: new Map(all.map((p) => [p.id, p])),
    all,
  };
}

async function getNextId(prisma) {
  const max = await prisma.product.findFirst({
    orderBy: { id: "desc" },
    select: { id: true },
  });
  const num = max ? parseInt(max.id.replace("mor-", ""), 10) + 1 : 1;
  const id = "mor-" + String(num).padStart(3, "0");
  return { id, slug: `product-mor-${String(num).padStart(3, "0")}`, num };
}

/**
 * Создаёт новый товар в БД.
 */
async function createProduct(prisma, data) {
  const { id, slug } = await getNextId(prisma);

  await prisma.product.create({
    data: {
      id,
      slug,
      name: data.name || "",
      price: data.price || 0,
      originalPrice: data.originalPrice || 0,
      currency: "₽",
      category: data.category || "crossbody",
      description: data.description || "",
      image: data.image || "",
      images: data.images || [],
      wbArticle: data.wbArticle ? BigInt(data.wbArticle) : null,
      ozonArticle: data.ozonArticle ? BigInt(data.ozonArticle) : null,
      wbPrice: data.wbPrice ?? null,
      wbOriginalPrice: data.wbOriginalPrice ?? null,
      ozonPrice: data.ozonPrice ?? null,
      ozonOriginalPrice: data.ozonOriginalPrice ?? null,
      rating: data.rating ?? null,
      reviewsCount: data.reviewsCount ?? null,
      imtId: data.imtId ?? null,
      colorName: data.colorName ?? null,
      composition: data.composition ?? null,
      inStock: data.inStock ?? true,
      photoCount: data.photoCount || 1,
      characteristics: data.characteristics ?? null,
      nameAutoGenerated: data.nameAutoGenerated ?? true,
      descAutoGenerated: data.descAutoGenerated ?? true,
      wbCreatedAt: data.wbCreatedAt ?? null,
      wbUpdatedAt: data.wbUpdatedAt ?? null,
      archivedAt: data.archivedAt ?? null,
    },
  });

  return id;
}

/**
 * Обновляет существующий товар в БД.
 */
async function updateProduct(prisma, id, data) {
  const updateData = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.price !== undefined) updateData.price = data.price;
  if (data.originalPrice !== undefined) updateData.originalPrice = data.originalPrice;
  if (data.wbPrice !== undefined) updateData.wbPrice = data.wbPrice;
  if (data.wbOriginalPrice !== undefined) updateData.wbOriginalPrice = data.wbOriginalPrice;
  if (data.ozonPrice !== undefined) updateData.ozonPrice = data.ozonPrice;
  if (data.ozonOriginalPrice !== undefined) updateData.ozonOriginalPrice = data.ozonOriginalPrice;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.image !== undefined) updateData.image = data.image;
  if (data.images !== undefined) updateData.images = data.images;
  if (data.rating !== undefined) updateData.rating = data.rating;
  if (data.reviewsCount !== undefined) updateData.reviewsCount = data.reviewsCount;
  if (data.imtId !== undefined) updateData.imtId = data.imtId;
  if (data.colorName !== undefined) updateData.colorName = data.colorName;
  if (data.composition !== undefined) updateData.composition = data.composition;
  if (data.inStock !== undefined) updateData.inStock = data.inStock;
  if (data.photoCount !== undefined) updateData.photoCount = data.photoCount;
  if (data.ozonImage !== undefined) updateData.ozonImage = data.ozonImage;
  if (data.ozonImages !== undefined) updateData.ozonImages = data.ozonImages;
  if (data.characteristics !== undefined) updateData.characteristics = data.characteristics;
  if (data.nameAutoGenerated !== undefined) updateData.nameAutoGenerated = data.nameAutoGenerated;
  if (data.descAutoGenerated !== undefined) updateData.descAutoGenerated = data.descAutoGenerated;
  if (data.wbCreatedAt !== undefined) updateData.wbCreatedAt = data.wbCreatedAt;
  if (data.wbUpdatedAt !== undefined) updateData.wbUpdatedAt = data.wbUpdatedAt;
  if (data.archivedAt !== undefined) updateData.archivedAt = data.archivedAt;

  if (Object.keys(updateData).length === 0) return false;

  if (!flags.dry) {
    await prisma.product.update({ where: { id }, data: updateData });
  }
  return true;
}

/* =============================================
   Merge: WB + Ozon → final product data
   ============================================= */

/**
 * Собирает финальные данные товара из WB и Ozon источников.
 * Приоритет: WB (контент, фото) + min цена + weighted avg рейтинг.
 */
function mergeProductSources(wbCard, wbPrices, wbRating, ozonInfo, ozonAttrs, ozonRating, db) {
  const data = {};

  // ─── Цены ───
  const wbPrice = wbPrices?.discountedPrice ?? db?.wbPrice ?? null;
  const wbOrigPrice = wbPrices?.price ?? db?.wbOriginalPrice ?? null;
  const ozonPriceVal = ozonInfo?.price != null ? Number(ozonInfo.price) : db?.ozonPrice ?? null;
  const ozonOrigPriceVal = ozonInfo?.old_price != null ? Number(ozonInfo.old_price) : db?.ozonOriginalPrice ?? null;

  if (wbPrice !== (db?.wbPrice ?? null)) data.wbPrice = wbPrice;
  if (wbOrigPrice !== (db?.wbOriginalPrice ?? null)) data.wbOriginalPrice = wbOrigPrice;
  if (ozonPriceVal !== (db?.ozonPrice ?? null)) data.ozonPrice = ozonPriceVal;
  if (ozonOrigPriceVal !== (db?.ozonOriginalPrice ?? null)) data.ozonOriginalPrice = ozonOrigPriceVal;

  // Display price = min across available
  const prices = [wbPrice, ozonPriceVal].filter((p) => p != null);
  const origPrices = [wbOrigPrice, ozonOrigPriceVal].filter((p) => p != null);
  if (prices.length > 0) data.price = Math.min(...prices);
  if (origPrices.length > 0) data.originalPrice = Math.min(...origPrices);

  // ─── Наличие ───
  const ozonStockQty = ozonInfo?.stocks?.stocks
    ? ozonInfo.stocks.stocks.reduce((s, st) => s + Math.max(0, (st.present || 0) - (st.reserved || 0)), 0)
    : 0;
  const inStock = ozonStockQty > 0 || db?.inStock === true || db?.inStock === null || db?.inStock === undefined;
  if (inStock !== (db?.inStock ?? true)) data.inStock = inStock;

  // ─── Фото ───
  // Основные фото (для витрины): приоритет WB
  if (wbCard) {
    const photoCount = extractPhotoCount(wbCard);
    const article = wbCard.nmID;
    data.photoCount = photoCount;
    data.image = cdnImageUrl(article, 1);
    data.images = cdnImageUrls(article, photoCount);
  } else if (ozonInfo?.images?.length && !db?.ozonImage && !db?.ozonImages?.length) {
    // Ozon-only товары (без сохранённых Ozon-фото): первичная запись
    data.photoCount = ozonInfo.images.length;
    data.image = ozonInfo.images[0];
    data.images = ozonInfo.images;
  }

  // ─── Ozon-фото (для админки, отдельно) ───
  if (ozonInfo?.images?.length) {
    const firstOzon = ozonInfo.images[0];
    if (firstOzon !== db?.ozonImage) data.ozonImage = firstOzon;
    const allOzon = ozonInfo.images;
    if (JSON.stringify(allOzon) !== JSON.stringify(db?.ozonImages || [])) data.ozonImages = allOzon;
  }

  // ─── Категория (приоритет WB) ───
  const wbCat = wbCard ? resolveCategory(wbCard) : null;
  const ozonCat = ozonInfo ? ozonExtractCategory(ozonInfo, ozonAttrs) : null;
  data.category = wbCat || ozonCat || db?.category || "crossbody";

  // ─── Состав и цвет (любой не null) ───
  const wbComp = wbCard ? extractComposition(wbCard) : null;
  const ozonComp = ozonInfo ? ozonExtractComposition(ozonAttrs) : null;
  data.composition = wbComp || ozonComp || db?.composition || null;

  const wbColor = wbCard ? extractColorName(wbCard) : null;
  const ozonColor = ozonInfo ? ozonExtractColor(ozonInfo, ozonAttrs) : null;
  data.colorName = wbColor || ozonColor || db?.colorName || null;

  // ─── Рейтинг (weighted avg) ───
  const wbRatingVal = wbRating?.rating ?? db?.rating ?? null;
  const wbFeedbacks = wbRating?.feedbacks ?? db?.reviewsCount ?? 0;
  const ozonRatingVal = ozonRating?.rating ?? null;
  const ozonReviewsCount = ozonInfo?.reviews_count != null ? Number(ozonInfo.reviews_count) : 0;

  if (wbRatingVal != null || ozonRatingVal != null) {
    let combRat, combRC;

    if (wbRatingVal != null && ozonRatingVal != null && wbFeedbacks > 0 && ozonReviewsCount > 0) {
      const total = wbFeedbacks + ozonReviewsCount;
      combRat = (wbRatingVal * wbFeedbacks + ozonRatingVal * ozonReviewsCount) / total;
      combRC = total;
    } else if (wbRatingVal != null) {
      combRat = wbRatingVal;
      combRC = wbFeedbacks;
    } else if (ozonRatingVal != null) {
      combRat = ozonRatingVal;
      combRC = ozonReviewsCount;
    }

    if (combRat != null) {
      combRat = Math.round(combRat * 10) / 10;
      if (combRat !== db?.rating) data.rating = combRat;
      if (combRC !== db?.reviewsCount) data.reviewsCount = combRC;
    }
  }

  // ─── Название ───
  if (wbCard && (db?.nameAutoGenerated !== false)) {
    const newName = generateName({
      category: data.category || db?.category,
      composition: data.composition || db?.composition || null,
      wbName: wbCard.title || wbCard.imt_name || null,
    });
    if (newName !== (db?.name || "")) {
      data.name = newName;
      data.nameAutoGenerated = true;
    }
  }

  // ─── Описание ───
  if (wbCard && (db?.descAutoGenerated !== false)) {
    const desc = extractDescription(wbCard) || ozonExtractDescription(ozonAttrs) || "";
    if (desc && desc !== (db?.description || "")) {
      data.description = desc;
      data.descAutoGenerated = true;
    }
  }

  // ─── imtId ───
  if (wbCard?.imtID && wbCard.imtID !== db?.imtId) {
    data.imtId = wbCard.imtID;
  }

  // ─── Характеристики ───
  const wbChars = wbCard?.characteristics || [];
  const ozonChars = ozonExtractCharacteristics(ozonAttrs);
  if (wbChars.length > 0 || ozonChars.length > 0) {
    const merged = [];
    if (wbChars.length > 0) {
      merged.push({ group_name: "Wildberries", options: wbChars.map((c) => ({
        name: c.name || String(c.id || ""),
        value: Array.isArray(c.value) ? c.value.join(", ") : String(c.value || ""),
      }))});
    }
    if (ozonChars.length > 0) {
      merged.push({ group_name: "Ozon", options: ozonChars });
    }
    data.characteristics = merged;
  }

  return data;
}

/* =============================================
   Archive logic
   ============================================= */

/**
 * Архивирует товары, которых нет ни в WB (активных или trash),
 * ни в Ozon (любой видимости).
 */
async function archiveGoneProducts(prisma, dbProducts, wbArticles, ozonArticles, trashArticles) {
  const wbSet = new Set(wbArticles);
  const trashSet = new Set(trashArticles);
  const ozonSet = new Set(ozonArticles);
  let archived = 0;
  let markedOutOfStock = 0;

  for (const db of dbProducts) {
    // Пропускаем уже архивные
    if (db.archivedAt) continue;

    const wbArt = db.wbArticle ? Number(db.wbArticle) : null;
    const ozonArt = db.ozonArticle ? Number(db.ozonArticle) : null;

    const onWb = wbArt && wbSet.has(wbArt);
    const onOzon = ozonArt && ozonSet.has(ozonArt);
    const inWbTrash = wbArt && trashSet.has(wbArt);

    if (onWb || onOzon) continue;

    if (inWbTrash) {
      // В корзине WB → архивируем
      if (!flags.dry) {
        await prisma.product.update({
          where: { id: db.id },
          data: { archivedAt: new Date() },
        });
      }
      archived++;
      log.line(`  Archived (WB trash): ${db.id} article=${wbArt} ${db.name}`);
    } else {
      // Нет нигде → out of stock (временно)
      if (db.inStock !== false) {
        if (!flags.dry) {
          await prisma.product.update({
            where: { id: db.id },
            data: { inStock: false },
          });
        }
        markedOutOfStock++;
        log.line(`  Out of stock: ${db.id} article=${wbArt || ozonArt} ${db.name}`);
      }
    }
  }

  return { archived, markedOutOfStock };
}

/* =============================================
   Main orchestration
   ============================================= */

async function main() {
  const startTime = Date.now();
  log.line("=== sync-all.mjs ===\n");

  if (flags.dry) log.line("  [DRY RUN — no writes]\n");

  // ─── Проверка ключей ───
  const wbApiKey = process.env.WB_API_KEY;
  const ozonClientId = process.env.OZON_CLIENT_ID;
  const ozonApiKey = process.env.OZON_API_KEY;

  if (!wbApiKey && !flags.ozonOnly) {
    console.error("ERROR: WB_API_KEY not set in .env");
    process.exit(1);
  }
  if ((!ozonClientId || !ozonApiKey) && !flags.wbOnly) {
    console.error("ERROR: OZON_CLIENT_ID and OZON_API_KEY must be set in .env");
    process.exit(1);
  }

  const prisma = new PrismaClient();

  try {
    // ─── Load existing products from DB ───
    log.line("Loading existing products from DB...");
    const existing = await getExistingProducts(prisma);
    log.line(`  ${existing.all.length} products in DB\n`);

    const stats = {
      wbCreated: 0,
      wbUpdated: 0,
      ozonUpdated: 0,
      archived: 0,
      outOfStock: 0,
      errors: 0,
    };

    let wbArticles = [];
    let ozonArticles = [];
    let trashArticles = [];
    let wbCards = [];
    let wbTrashCards = [];

    // ═══════════════════════════════════════════
    // PHASE 1: Wildberries
    // ═══════════════════════════════════════════

    if (!flags.ozonOnly) {
      log.line("[1/2] Fetching WB Content API (active cards)...");
      wbCards = await wbFetchAllCards(wbApiKey, false);
      wbArticles = wbCards.map((c) => c.nmID);
      log.line(`  ${wbCards.length} active cards\n`);

      log.line("[2/2] Fetching WB Content API (trash cards)...");
      wbTrashCards = await wbFetchAllCards(wbApiKey, true);
      trashArticles = wbTrashCards.map((c) => c.nmID);
      log.line(`  ${wbTrashCards.length} trash cards\n`);

      // ─── Fetch WB prices ───
      log.line("Fetching WB prices...");
      const wbPriceMap = await wbFetchPrices(wbApiKey, wbArticles);

      // ─── Process WB cards ───
      log.line("Processing WB cards...");
      for (const card of wbCards) {
        const article = card.nmID;
        const db = existing.byWbArticle.get(article);
        const wbPrices = wbPriceMap.get(article) || null;

        if (db) {
          // Update existing
          const updates = mergeProductSources(card, wbPrices, null, null, null, null, db);
          if (Object.keys(updates).length > 0) {
            const ok = await updateProduct(prisma, db.id, updates);
            if (ok) stats.wbUpdated++;
          }
        } else {
          // Create new
          const updates = mergeProductSources(card, wbPrices, null, null, null, null, null);
          const id = await createProduct(prisma, {
            ...updates,
            wbArticle: article,
            name: updates.name || generateName({
              category: updates.category || resolveCategory(card),
              wbName: card.title || card.imt_name || null,
            }),
            description: updates.description || extractDescription(card),
            image: updates.image || cdnImageUrl(article, 1),
            images: updates.images || cdnImageUrls(article, extractPhotoCount(card)),
            photoCount: updates.photoCount || extractPhotoCount(card),
            wbCreatedAt: card.createdAt ? new Date(card.createdAt) : null,
            wbUpdatedAt: card.updatedAt ? new Date(card.updatedAt) : null,
          });
          log.line(`  Created: ${id} article=${article}`);
          stats.wbCreated++;
        }
      }

      log.line(`  WB: ${stats.wbCreated} created, ${stats.wbUpdated} updated\n`);
    }

    // ═══════════════════════════════════════════
    // PHASE 2: Ozon
    // ═══════════════════════════════════════════

    if (!flags.wbOnly) {
      log.line("[Ozon] Fetching product list...");
      const ozonItems = await ozonFetchAllProducts(ozonClientId, ozonApiKey);
      ozonArticles = ozonItems.map((i) => i.productId).filter((id) => id > 0);
      log.line(`  ${ozonItems.length} Ozon products\n`);

      const offerIdList = ozonItems.map((i) => i.offerId).filter(Boolean);

      log.line("[Ozon] Fetching product info...");
      const infoMap = await ozonFetchProductInfo(ozonClientId, ozonApiKey, offerIdList);
      log.line("");

      log.line("[Ozon] Fetching product attributes...");
      const attrMap = await ozonFetchProductAttributes(ozonClientId, ozonApiKey, offerIdList);
      log.line("");

      log.line("[Ozon] Fetching ratings...");
      const ratingMap = await ozonFetchRatings(ozonClientId, ozonApiKey, ozonArticles);
      log.line("");

      // ─── Process Ozon products ───
      log.line("Processing Ozon products...");
      for (const { offerId, productId } of ozonItems) {
        if (!offerId && !productId) continue;
        const info = infoMap.get(offerId);
        const attrs = attrMap.get(offerId);
        const rating = ratingMap.get(productId);
        const db = existing.byOzonArticle.get(productId);

        if (!info) continue;

        if (db) {
          // Update existing — merge Ozon data into existing product
          const updates = mergeProductSources(null, null, null, info, attrs, rating, db);
          if (Object.keys(updates).length > 0) {
            const ok = await updateProduct(prisma, db.id, updates);
            if (ok) stats.ozonUpdated++;
          }
        } else {
          // New product from Ozon (no WB card)
          const ozonPrice = info.price != null ? Number(info.price) : null;
          const ozonOrigPrice = info.old_price != null ? Number(info.old_price) : null;
          const ozonCat = ozonExtractCategory(info, attrs);
          const ozonComp = ozonExtractComposition(attrs);

          const id = await createProduct(prisma, {
            name: info.name || "",
            price: ozonPrice || 0,
            originalPrice: ozonOrigPrice || 0,
            ozonPrice,
            ozonOriginalPrice: ozonOrigPrice,
            category: ozonCat || "crossbody",
            description: ozonExtractDescription(attrs),
            image: info.images?.[0] || "",
            images: info.images || [],
            ozonImage: info.images?.[0] || null,
            ozonImages: info.images || [],
            ozonArticle: productId,
            photoCount: info.images?.length || 1,
            colorName: ozonExtractColor(info, attrs),
            composition: ozonComp,
            rating: rating?.rating ?? null,
            inStock: info.stocks?.stocks?.some((s) => (s.present || 0) - (s.reserved || 0) > 0) ?? true,
            nameAutoGenerated: true,
            descAutoGenerated: true,
          });
          log.line(`  Created (Ozon): ${id} article=${productId}`);
          stats.wbCreated++; // treat Ozon-only products as "created"
        }
      }

      log.line(`  Ozon: ${stats.ozonUpdated} updated\n`);
    }

    // ═══════════════════════════════════════════
    // PHASE 3: Archive & Restock
    // ═══════════════════════════════════════════

    log.line("Archiving removed products...");
    const archiveResult = await archiveGoneProducts(
      prisma,
      existing.all,
      wbArticles,
      ozonArticles,
      trashArticles,
    );
    stats.archived = archiveResult.archived;
    stats.outOfStock = archiveResult.markedOutOfStock;

    // ═══════════════════════════════════════════
    // Summary
    // ═══════════════════════════════════════════

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    log.line("\n=== SUMMARY ===");
    log.line(`  WB created:      ${stats.wbCreated}`);
    log.line(`  WB updated:      ${stats.wbUpdated}`);
    log.line(`  Ozon updated:    ${stats.ozonUpdated}`);
    log.line(`  Archived:        ${stats.archived}`);
    log.line(`  Out of stock:    ${stats.outOfStock}`);
    log.line(`  Duration:        ${duration}s`);
    log.line(`  Mode:            ${flags.dry ? "DRY" : "live"}`);

    // JSON summary for wrapper scripts (last line)
    const summary = {
      created: stats.wbCreated,
      updated: stats.wbUpdated + stats.ozonUpdated,
      archived: stats.archived,
      outOfStock: stats.outOfStock,
      errors: stats.errors,
      total: stats.wbCreated + stats.wbUpdated + stats.ozonUpdated + stats.archived,
      duration: parseFloat(duration),
    };
    console.log(JSON.stringify(summary));

  } catch (err) {
    console.error("\nFATAL:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
