#!/usr/bin/env node
try {
  const { default: dotenv } = await import("dotenv");
  dotenv.config({ path: ".env" });
  dotenv.config({ path: ".env.local" });
} catch {
  // dotenv не установлен (Vercel) — env vars уже в process.env
}
/**
 * sync-all.mjs — Единый скрипт синхронизации Moranti.
 *
 * Использует стабильные официальные API:
 *   Wildberries: Content API + public search API
 *   Ozon:        Seller API (v3 + v4)
 *
 * Использование:
 *   node scripts/sync-all.mjs                        # полный прогон
 *   node scripts/sync-all.mjs --dry                  # пробный
 *   node scripts/sync-all.mjs --wb-only              # только WB
 *   node scripts/sync-all.mjs --ozon-only            # только Ozon
 *   node scripts/sync-all.mjs --from-phase wb-prices # рестарт с фазы
 *
 * Модули:
 *   sync-modules/transform.mjs   — трансформация данных (чистые функции)
 *   sync-modules/merge.mjs       — слияние WB+Ozon данных
 *   sync-modules/models.mjs      — управление моделями и архивация
 */

import { writeFileSync, existsSync, readFileSync, mkdirSync } from "fs";
import { PrismaClient } from "@prisma/client";

// --- Imports из модулей ---
import {
  cdnImageUrl,
  cdnImageUrls,
  extractPhotoCount,
  extractDescription,
  resolveCategory,
  makeSlug,
  toBigInt,
  ozonExtractCategory,
  ozonExtractComposition,
  ozonExtractDescription,
  ozonExtractColor,
} from "./sync-modules/transform.mjs";
import { mergeProductSources } from "./sync-modules/merge.mjs";
import { syncModels, syncOzonModels, archiveGoneProducts } from "./sync-modules/models.mjs";

// --- CommonJS зависимости ---
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { wbToCategory, CATEGORY_RU } = require("./wb-categories.js");
const { generateName } = require("./name-generator.js");

// ============================================================
// Config
// ============================================================

const WB_CONTENT_API = "https://content-api.wildberries.ru";
const WB_SEARCH_API = "https://search.wb.ru/exactmatch/ru/common/v18/search";
const OZON_API = "https://api-seller.ozon.ru";
const SUPPLIER_ID = Number(process.env.WB_SUPPLIER_ID) || 312222;

const ITEMS_PER_WB_CARDS = 100;
const ITEMS_PER_OZON_BATCH = 100;
const FETCH_TIMEOUT = 30000;

const flags = {
  dry: process.argv.includes("--dry"),
  wbOnly: process.argv.includes("--wb-only"),
  ozonOnly: process.argv.includes("--ozon-only"),
  fromPhase: null,
};

// Парсим --from-phase <phase>
const fromIdx = process.argv.indexOf("--from-phase");
if (fromIdx !== -1 && fromIdx + 1 < process.argv.length) {
  flags.fromPhase = process.argv[fromIdx + 1];
}

const SKIP_PHASE = flags.fromPhase ? new Set() : null;

// ============================================================
// Фазы синхронизации (для --from-phase)
// ============================================================

const PHASES = [
  "wb-cards",
  "wb-prices",
  "wb-process",
  "ozon-list",
  "ozon-info",
  "ozon-attrs",
  "ozon-ratings",
  "ozon-process",
  "wb-models",
  "ozon-models",
  "archive",
];

/**
 * Проверяет, нужно ли выполнять фазу (с учётом --from-phase).
 * @param {string} phase
 * @returns {boolean}
 */
function shouldRun(phase) {
  if (!flags.fromPhase) return true;
  const idx = PHASES.indexOf(phase);
  const fromIdx = PHASES.indexOf(flags.fromPhase);
  if (fromIdx === -1) return true; // неизвестная фаза — выполняем
  return idx >= fromIdx;
}

// ============================================================
// Logger
// ============================================================

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

  progress(phase, current, total) {
    const msg = JSON.stringify({ type: "progress", phase, current, total });
    console.log(`[PROGRESS] ${msg}`);
    this.lines.push(msg + "\n");
  },

  detail(action, productId, name, changes) {
    const msg = JSON.stringify({ type: "detail", action, product: productId, name, changes });
    console.log(`[DETAIL] ${msg}`);
    this.lines.push(msg + "\n");
  },
};

// ============================================================
// Generic fetch with auth
// ============================================================

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
    const delay = Math.min(retryAfter * 1000, 30000);
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
    const delay = Math.min(1000 * Math.pow(2, attempt) * attempt, 30000);
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

// ============================================================
// Fetch functions
// ============================================================

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
      settings: { cursor, filter: { withPhoto: -1 } },
    };

    const data = await wbFetch(WB_CONTENT_API, endpoint, { method: "POST", apiKey, body });
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

async function wbFetchPublicPrices(nmIDs) {
  if (!nmIDs || nmIDs.length === 0) return new Map();
  const priceMap = new Map();

  log.write(`  Fetching WB prices (search API) for ${nmIDs.length} cards:`);

  async function searchFetch(url, attempt = 1) {
    const resp = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT) });
    if (resp.status === 429 && attempt <= 3) {
      const delay = Math.min(1000 * Math.pow(2, attempt), 8000);
      log.write(` 429 (retry ${attempt} in ${delay}ms)`);
      await new Promise((r) => setTimeout(r, delay));
      return searchFetch(url, attempt + 1);
    }
    if (!resp.ok) {
      log.line(`\n  search API ${resp.status} (after ${attempt} attempts)`);
      return null;
    }
    return resp.json();
  }

  try {
    const result = await searchFetch(
      `${WB_SEARCH_API}?appType=1&curr=rub&dest=-1257786&query=moranti&resultset=catalog&sort=popular&limit=100`
    );
    if (!result || !result.products) return priceMap;
    const products = result.products;

    for (const p of products) {
      if (p.supplierId !== SUPPLIER_ID) continue;
      const s = p.sizes?.[0];
      const price = s?.price?.product;
      const basic = s?.price?.basic;
      const stockQty = s?.stock?.qty != null ? Number(s.stock.qty) : null;
      if (price != null) {
        priceMap.set(p.id, {
          price: (basic ?? price) / 100,
          discountedPrice: price / 100,
          stock: stockQty,
        });
      }
    }

    log.line(` — ${priceMap.size} products from search API`);

    if (products.length >= 100) {
      const result2 = await searchFetch(
        `${WB_SEARCH_API}?appType=1&curr=rub&dest=-1257786&query=moranti&resultset=catalog&sort=popular&limit=100&page=2`
      );
      if (result2) {
        const products2 = result2.products || [];
        for (const p of products2) {
          if (p.supplierId !== SUPPLIER_ID) continue;
          const s = p.sizes?.[0];
          const price = s?.price?.product;
          const basic = s?.price?.basic;
          const stockQty = s?.stock?.qty != null ? Number(s.stock.qty) : null;
          if (price != null) {
            priceMap.set(p.id, {
              price: (basic ?? price) / 100,
              discountedPrice: price / 100,
              stock: stockQty,
            });
          }
        }
        log.line(`  → ${priceMap.size} total (after page 2)`);
      }
    }
  } catch (err) {
    log.line(`\n  search API error: ${err.message}`);
  }

  return priceMap;
}

async function ozonFetchAllProducts(clientId, apiKey) {
  log.write("  Fetching Ozon product list:");
  let lastId = null;
  const allItems = [];

  while (true) {
    const body = { filter: { visibility: "ALL" }, limit: 1000 };
    if (lastId) body.last_id = lastId;
    const data = await ozonFetch("/v3/product/list", body, clientId, apiKey);
    const items = data?.result?.items || [];

    for (const item of items) {
      allItems.push({
        offerId: String(item.offer_id || ""),
        productId: Number(item.product_id || 0),
        productSku: Number(item.sku) || 0,
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
  for (const item of results) infoMap.set(String(item.offer_id), item);
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
  for (const item of results) attrMap.set(String(item.offer_id), item);
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
      rating: item.rating != null ? item.rating / 20 : null,
    });
  }
  log.line(`  Ratings: ${ratingMap.size} products`);
  return ratingMap;
}

// ============================================================
// DB operations
// ============================================================

async function getExistingProducts(prisma) {
  const all = await prisma.product.findMany({ orderBy: { id: "asc" } });
  return {
    byWbArticle: new Map(all.filter((p) => p.wbArticle).map((p) => [Number(p.wbArticle), p])),
    byOzonArticle: new Map(all.filter((p) => p.ozonArticle).map((p) => [Number(p.ozonArticle), p])),
    byId: new Map(all.map((p) => [p.id, p])),
    bySku: new Map(all.filter((p) => p.sku).map((p) => [p.sku, p])),
    all,
  };
}

async function generateId(prisma) {
  const last = await prisma.product.findFirst({
    orderBy: { id: "desc" },
    select: { id: true },
  });
  const num = last ? parseInt(last.id.replace("mor-", ""), 10) + 1 : 1;
  return "mor-" + String(num).padStart(3, "0");
}

async function createProduct(prisma, data) {
  const id = await generateId(prisma);
  const sku = data.sku || null;
  const slug = sku ? makeSlug(sku) : id;

  await prisma.product.create({
    data: {
      id,
      slug,
      sku,
      name: data.name || "",
      price: data.price || 0,
      originalPrice: data.originalPrice || 0,
      currency: "₽",
      category: data.category || "crossbody",
      description: data.description || "",
      image: data.image || "",
      images: data.images || [],
      wbArticle: toBigInt(data.wbArticle),
      ozonArticle: toBigInt(data.ozonArticle),
      wbPrice: data.wbPrice ?? null,
      wbOriginalPrice: data.wbOriginalPrice ?? null,
      ozonPrice: data.ozonPrice ?? null,
      ozonOriginalPrice: data.ozonOriginalPrice ?? null,
      rating: data.rating ?? null,
      reviewsCount: data.reviewsCount ?? null,
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

async function updateProduct(prisma, id, data) {
  const updateData = {};
  const fields = [
    "name", "price", "originalPrice", "wbPrice", "wbOriginalPrice",
    "ozonPrice", "ozonOriginalPrice", "category", "description",
    "image", "images", "rating", "reviewsCount", "colorName", "composition",
    "inStock", "photoCount", "wbStock", "ozonStock",
    "ozonImage", "ozonImages", "characteristics",
    "nameAutoGenerated", "descAutoGenerated",
    "wbCreatedAt", "wbUpdatedAt", "archivedAt", "sku", "ozonArticle",
  ];

  for (const f of fields) {
    if (data[f] !== undefined) updateData[f] = data[f];
  }

  if (Object.keys(updateData).length === 0) return false;

  if (!flags.dry) {
    await prisma.product.update({ where: { id }, data: updateData });
  }
  return true;
}

// ============================================================
// Main
// ============================================================

async function main() {
  const startTime = Date.now();
  log.line("=== sync-all.mjs ===\n");

  if (flags.dry) log.line("  [DRY RUN — no writes]\n");
  if (flags.fromPhase) log.line(`  Resuming from phase: ${flags.fromPhase}\n`);

  // ─── Проверка ключей ───
  const wbApiKey = process.env.WB_API_KEY;
  const ozonClientId = process.env.OZON_CLIENT_ID;
  const ozonApiKey = process.env.OZON_API_KEY;

  if (!wbApiKey && !flags.ozonOnly) {
    console.error("ERROR: WB_API_KEY не задан.");
    console.error("  Локально: добавь WB_API_KEY=... в .env.local");
    console.error("  Vercel:   добавь WB_API_KEY в Settings → Environment Variables");
    process.exit(1);
  }
  if ((!ozonClientId || !ozonApiKey) && !flags.wbOnly) {
    console.error("ERROR: OZON_CLIENT_ID и OZON_API_KEY не заданы.");
    console.error("  Локально: добавь в .env.local");
    console.error("  Vercel:   добавь в Settings → Environment Variables");
    process.exit(1);
  }

  const prisma = new PrismaClient();

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /** Ретрай на случай если БД временно недоступна */
  async function prismaRetry(fn) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        return await fn();
      } catch (e) {
        if (attempt < 3) {
          console.log(`  DB retry ${attempt}/3 after ${attempt}s...`);
          await sleep(attempt * 1000);
        } else {
          throw e;
        }
      }
    }
  }

  try {
    // ─── Load existing products from DB ───
    log.line("Loading existing products from DB...");
    const existing = await prismaRetry(() => getExistingProducts(prisma));
    log.line(`  ${existing.all.length} products in DB\n`);

    const stats = {
      wbCreated: 0, wbUpdated: 0, wbSkipped: 0,
      ozonCreated: 0, ozonUpdated: 0, ozonSkipped: 0,
      archived: 0, outOfStock: 0, errors: 0,
    };

    let wbArticles = [];
    let ozonArticles = [];
    let ozonItems = [];
    let trashArticles = [];
    let wbCards = [];
    let wbTrashCards = [];
    let wbPriceMap = new Map();
    let infoMap, attrMap, ratingMap;

    // ═══════════════════════════════════════════
    // PHASE 1: Wildberries
    // ═══════════════════════════════════════════

    if (!flags.ozonOnly) {
      if (shouldRun("wb-cards")) {
        log.progress("wb-cards", 0, 1);
        log.line("[1/2] Fetching WB Content API (active cards)...");
        wbCards = await wbFetchAllCards(wbApiKey, false);
        wbArticles = wbCards.map((c) => c.nmID);
        log.line(`  ${wbCards.length} active cards\n`);
        log.progress("wb-cards", 1, 1);

        log.progress("wb-trash", 0, 1);
        log.line("[2/2] Fetching WB Content API (trash cards)...");
        wbTrashCards = await wbFetchAllCards(wbApiKey, true);
        trashArticles = wbTrashCards.map((c) => c.nmID);
        log.line(`  ${wbTrashCards.length} trash cards\n`);
        log.progress("wb-trash", 1, 1);
      }

      if (shouldRun("wb-prices")) {
        log.progress("wb-prices", 0, 1);
        log.line("Fetching WB prices (search API)...");
        wbPriceMap = await wbFetchPublicPrices(wbArticles);
        log.progress("wb-prices", 1, 1);

        // Определяем inStock из search API
        for (const [nmId, priceData] of wbPriceMap) {
          const db = existing.byWbArticle.get(nmId);
          const inTrash = trashArticles.includes(nmId);
          let newInStock;

          if (inTrash) {
            newInStock = false;
          } else if (priceData?.stock !== undefined && priceData?.stock !== null) {
            newInStock = priceData.stock > 0;
          } else if (priceData?.discountedPrice != null) {
            newInStock = true;
          } else {
            continue;
          }

          if (db && newInStock !== db.inStock) {
            await updateProduct(prisma, db.id, { inStock: newInStock });
            db.inStock = newInStock;
          }
        }
      }

      if (shouldRun("wb-process")) {
        // Строим индекс vendorCode → nmID
        const wbVendorToNm = new Map();
        for (const card of wbCards) {
          const vc = card.vendorCode?.trim();
          if (vc) wbVendorToNm.set(vc, card.nmID);
        }

        log.line("Processing WB cards...");
        log.progress("wb-process", 0, wbCards.length);
        for (let i = 0; i < wbCards.length; i++) {
          const card = wbCards[i];
          const article = card.nmID;
          const vendorCode = (card.vendorCode || "").trim();

          let db = vendorCode ? existing.bySku.get(vendorCode) : null;
          if (!db) db = existing.byWbArticle.get(article);

          const wbPrices = wbPriceMap.get(article) || null;
          const wbRating = card.rating != null
            ? { rating: card.rating, feedbacks: card.feedbacks ?? 0 }
            : null;

          if (db) {
            const ensureFields = {};
            if (article && !db.wbArticle) ensureFields.wbArticle = toBigInt(article);

            const updates = mergeProductSources(card, wbPrices, wbRating, null, null, null, db);
            const allUpdates = { ...ensureFields, ...updates };
            if (Object.keys(allUpdates).length > 0) {
              const ok = await updateProduct(prisma, db.id, allUpdates);
              if (ok) {
                stats.wbUpdated++;
                log.detail("updated", db.id, db.name, Object.keys(allUpdates));
              }
            } else {
              stats.wbSkipped++;
            }
          } else {
            const inTrash = trashArticles.includes(article);
            const searchStock = wbPrices?.stock;
            const defaultInStock = inTrash ? false : (searchStock != null ? searchStock > 0 : true);
            const updates = mergeProductSources(card, wbPrices, wbRating, null, null, null, null);
            const id = await createProduct(prisma, {
              ...updates,
              sku: vendorCode || null,
              inStock: defaultInStock,
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
            log.line(`  Created: ${id} sku=${vendorCode} article=${article}`);
            log.detail("created", id, updates.name || card.title || "", []);
            stats.wbCreated++;
          }

          if ((i + 1) % 10 === 0 || i === wbCards.length - 1) {
            log.progress("wb-process", i + 1, wbCards.length);
          }
        }

        log.line(`  WB: ${stats.wbCreated} created, ${stats.wbUpdated} updated\n`);
      }
    }

    // ═══════════════════════════════════════════
    // PHASE 2: Ozon
    // ═══════════════════════════════════════════

    if (!flags.wbOnly) {
      if (shouldRun("ozon-list")) {
        log.progress("ozon-list", 0, 1);
        log.line("[Ozon] Fetching product list...");
        ozonItems = await ozonFetchAllProducts(ozonClientId, ozonApiKey);
        ozonArticles = ozonItems.map((i) => i.productId).filter((id) => id > 0);
        log.line(`  ${ozonItems.length} Ozon products\n`);
        log.progress("ozon-list", 1, 1);
      }

      const offerIdList = ozonItems.map((i) => i.offerId).filter(Boolean);

      // Ozon info + attrs + ratings — параллельно
      if (shouldRun("ozon-info") || shouldRun("ozon-attrs") || shouldRun("ozon-ratings")) {
        log.line("[Ozon] Fetching product details (parallel)...");

        const fetches = [];
        if (shouldRun("ozon-info")) {
          log.progress("ozon-info", 0, 1);
          fetches.push(
            ozonFetchProductInfo(ozonClientId, ozonApiKey, offerIdList)
              .then((r) => { infoMap = r; log.progress("ozon-info", 1, 1); return r; })
          );
        }
        if (shouldRun("ozon-attrs")) {
          log.progress("ozon-attrs", 0, 1);
          fetches.push(
            ozonFetchProductAttributes(ozonClientId, ozonApiKey, offerIdList)
              .then((r) => { attrMap = r; log.progress("ozon-attrs", 1, 1); return r; })
          );
        }
        if (shouldRun("ozon-ratings")) {
          log.progress("ozon-ratings", 0, 1);
          fetches.push(
            ozonFetchRatings(ozonClientId, ozonApiKey, ozonArticles)
              .then((r) => { ratingMap = r; log.progress("ozon-ratings", 1, 1); return r; })
          );
        }

        await Promise.all(fetches);
        log.line("");
      }

      if (shouldRun("ozon-process")) {
        log.line("Processing Ozon products...");

        const ozonLocks = new Map();
        for (const p of existing.all) {
          if (p.ozonArticle) ozonLocks.set(Number(p.ozonArticle), p.id);
        }
        const skippedOzonFixes = [];

        const totalOzonItems = ozonItems.filter((i) => i.offerId || i.productId).length;
        log.progress("ozon-process", 0, totalOzonItems);
        let ozonProcessed = 0;

        for (const { offerId, productId, productSku } of ozonItems) {
          if (!offerId && !productId) continue;
          const info = infoMap?.get(offerId);
          const attrs = attrMap?.get(offerId);
          const rating = ratingMap?.get(productId);

          const publicSku = productSku || info?.sources?.[0]?.sku || 0;

          let db = offerId ? existing.bySku.get(offerId) : null;
          if (!db && publicSku) db = existing.byOzonArticle.get(Number(publicSku));
          if (!db) db = existing.byOzonArticle.get(productId);

          if (!info) continue;

          if (db) {
            const ensureFields = {};
            if (publicSku && (!db.ozonArticle || Number(db.ozonArticle) !== Number(publicSku))) {
              const newVal = Number(publicSku);
              const oldVal = db.ozonArticle ? Number(db.ozonArticle) : 0;

              if (oldVal !== newVal) {
                if (oldVal) ozonLocks.delete(oldVal);

                if (ozonLocks.has(newVal)) {
                  skippedOzonFixes.push({ db, newVal, oldVal });
                } else {
                  ozonLocks.set(newVal, db.id);
                  ensureFields.ozonArticle = toBigInt(newVal);
                }
              }
            }

            const updates = mergeProductSources(null, null, null, info, attrs, rating, db);
            const allUpdates = { ...ensureFields, ...updates };
            if (Object.keys(allUpdates).length > 0) {
              const ok = await updateProduct(prisma, db.id, allUpdates);
              if (ok) {
                stats.ozonUpdated++;
                log.detail("updated", db.id, db.name, Object.keys(allUpdates));
              }
            } else {
              stats.ozonSkipped++;
            }
          } else {
            const ozonPrice = info.price != null ? Number(info.price) : null;
            const ozonOrigPrice = info.old_price != null ? Number(info.old_price) : null;
            const ozonCat = ozonExtractCategory(info, attrs);
            const ozonComp = ozonExtractComposition(attrs);

            const id = await createProduct(prisma, {
              sku: offerId || null,
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
              ozonArticle: publicSku || productId,
              photoCount: info.images?.length || 1,
              colorName: ozonExtractColor(info, attrs),
              composition: ozonComp,
              rating: rating?.rating ?? null,
              inStock: info.stocks?.stocks?.some(
                (s) => (s.present || 0) - (s.reserved || 0) > 0
              ) ?? true,
              nameAutoGenerated: true,
              descAutoGenerated: true,
            });
            log.line(`  Created (Ozon): ${id} offer=${offerId} sku=${publicSku || productId}`);
            log.detail("created", id, info.name || "", []);
            stats.ozonCreated++;
          }

          ozonProcessed++;
          if (ozonProcessed % 10 === 0 || ozonProcessed === totalOzonItems) {
            log.progress("ozon-process", ozonProcessed, totalOzonItems);
          }
        }

        // Второй проход: фиксы ozonArticle
        if (skippedOzonFixes.length > 0) {
          log.line(`  Second pass: retrying ${skippedOzonFixes.length} skipped ozonArticle fixes...`);
          for (const { db, newVal, oldVal } of skippedOzonFixes) {
            if (ozonLocks.has(newVal)) {
              log.line(`    Still skipped ${db.id}: ${newVal} held by ${ozonLocks.get(newVal)}`);
            } else {
              ozonLocks.set(newVal, db.id);
              const ok = await updateProduct(prisma, db.id, { ozonArticle: toBigInt(newVal) });
              if (ok) {
                log.line(`    Fix ozonArticle for ${db.id}: ${oldVal} → ${newVal} (2nd pass)`);
                stats.ozonUpdated++;
              }
            }
          }
        }

        log.line(`  Ozon: ${stats.ozonUpdated} updated\n`);
      }
    }

    // ═══════════════════════════════════════════
    // PHASE 3: Models
    // ═══════════════════════════════════════════

    if (shouldRun("ozon-models") && !flags.wbOnly) {
      log.progress("ozon-models", 0, 1);
      const ozonModelResult = await syncOzonModels(prisma, attrMap || new Map(), log);
      if (ozonModelResult.created > 0 || ozonModelResult.assigned > 0) {
        log.line(`  Ozon models: ${ozonModelResult.created} created, ${ozonModelResult.assigned} assigned`);
      }
      log.progress("ozon-models", 1, 1);
    }

    if (shouldRun("wb-models") && !flags.ozonOnly && wbCards.length > 0) {
      log.progress("wb-models", 0, 1);
      log.line("Syncing models from WB imtId...");
      const modelResult = await syncModels(prisma, wbCards, resolveCategory, log, flags);
      log.line(`  WB models: ${modelResult.created} created, ${modelResult.assigned} assigned\n`);
      log.progress("wb-models", 1, 1);
    }

    // ═══════════════════════════════════════════
    // PHASE 4: Archive
    // ═══════════════════════════════════════════

    if (shouldRun("archive")) {
      log.progress("archive", 0, 1);
      log.line("Archiving removed products...");
      const archiveResult = await archiveGoneProducts(
        prisma, existing.all, wbArticles, ozonItems, trashArticles,
        !flags.ozonOnly, !flags.wbOnly, log, flags,
      );
      stats.archived = archiveResult.archived;
      stats.outOfStock = archiveResult.markedOutOfStock;
      log.progress("archive", 1, 1);
    }

    // ═══════════════════════════════════════════
    // Summary
    // ═══════════════════════════════════════════

    log.progress("done", 1, 1);
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    log.line("\n=== SUMMARY ===");
    log.line(`  WB created:      ${stats.wbCreated}`);
    log.line(`  WB updated:      ${stats.wbUpdated}`);
    log.line(`  WB skipped:      ${stats.wbSkipped}`);
    log.line(`  Ozon created:    ${stats.ozonCreated}`);
    log.line(`  Ozon updated:    ${stats.ozonUpdated}`);
    log.line(`  Ozon skipped:    ${stats.ozonSkipped}`);
    log.line(`  Archived:        ${stats.archived}`);
    log.line(`  Out of stock:    ${stats.outOfStock}`);
    log.line(`  Errors:          ${stats.errors}`);
    log.line(`  Duration:        ${duration}s`);
    log.line(`  Mode:            ${flags.dry ? "DRY" : "live"}`);

    const skipped = stats.wbSkipped + stats.ozonSkipped;
    const summary = {
      created: stats.wbCreated + stats.ozonCreated,
      updated: stats.wbUpdated + stats.ozonUpdated,
      skipped,
      archived: stats.archived,
      outOfStock: stats.outOfStock,
      errors: stats.errors,
      total: stats.wbCreated + stats.ozonCreated + stats.wbUpdated + stats.ozonUpdated + skipped,
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
