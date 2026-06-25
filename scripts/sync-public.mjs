#!/usr/bin/env node
/**
 * sync-public.mjs — Единый скрипт синхронизации с WB (публичные API, без токена).
 *
 * Заменяет enrich-scrape.mjs + update-db-from-scrape.mjs.
 * Пишет напрямую в Prisma, без JSON-посредника.
 * Инкрементальный по умолчанию — card.json только для новых/изменившихся товаров.
 *
 * Использование:
 *   node scripts/sync-public.mjs              # цены всегда, card.json если нужно
 *   node scripts/sync-public.mjs --full       # полный прогон (все card.json)
 *   node scripts/sync-public.mjs --sync-json  # + обновить data/products.json
 *   node scripts/sync-public.mjs --save-json  # + сохранить wb-scrape-result.json (отладка)
 *   node scripts/sync-public.mjs --dry        # только показать, что будет сделано
 *
 * Фазы:
 *   1. search.wb.ru — цены, рейтинги, остатки (всегда)
 *   2. card.json — характеристики, даты (инкрементально)
 *   3. Prisma: обновить цены, создать новые, архивировать удалённые
 *   4. Лог + опционально products.json / debug JSON
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { PrismaClient } from "@prisma/client";
import { createRequire } from "module";
import {
  SUPPLIER_ID,
  sleep,
  fetchWithRetry,
  batchFetchCardJson,
  cardCdnUrl,
  cardCdnUrls,
  parseWbDate,
} from "./wb-utils.mjs";

const require = createRequire(import.meta.url);
const { wbToCategory } = require("./wb-categories.js");
const { generateName } = require("./name-generator.js");

/* =============================================
   Category map (WB filter API data + manual)
   ============================================= */

let categoryByArticle = null;

function loadCategoryMap() {
  if (categoryByArticle) return categoryByArticle;
  const raw = JSON.parse(readFileSync("scripts/wb-model-map.json", "utf-8"));
  categoryByArticle = new Map();
  for (const [cat, articles] of Object.entries(raw)) {
    if (cat.startsWith("_")) continue; // skip _comment, _source
    for (const a of articles) categoryByArticle.set(a, cat);
  }
  return categoryByArticle;
}

/**
 * Определяет категорию по артикулу WB.
 * Приоритет: wb-model-map.json (filter API) → wb-categories.js (subj_id/name).
 */
function getCategory(article, subjName, subjId) {
  const map = loadCategoryMap();
  if (map.has(article)) return map.get(article);
  return wbToCategory(null, subjName, subjId);
}

const prisma = new PrismaClient();
const DELAY_MS = 300;
const CARD_STALE_MS = 24 * 60 * 60 * 1000; // 24h
const SYNC_LOG_PATH = "data/sync-log.json";
const PRODUCTS_JSON_PATH = "data/products.json";
const CARD_DUMP_PATH = "data/wb-scrape-result.json";

/* =============================================
   CLI
   ============================================= */

const flags = {
  full: process.argv.includes("--full"),
  syncJson: process.argv.includes("--sync-json"),
  saveJson: process.argv.includes("--save-json"),
  dry: process.argv.includes("--dry"),
};

/* =============================================
   Sync log helpers
   ============================================= */

function loadSyncLog() {
  try {
    return JSON.parse(readFileSync(SYNC_LOG_PATH, "utf-8"));
  } catch {
    return { lastRunAt: null, lastCardFetchAt: null, stats: {} };
  }
}

function saveSyncLog(log) {
  writeFileSync(SYNC_LOG_PATH, JSON.stringify(log, null, 2), "utf-8");
}

/* =============================================
   Step 1: search.wb.ru → Map<article, searchData>
   ============================================= */

async function fetchSearchProducts() {
  const baseUrl =
    "https://search.wb.ru/exactmatch/ru/common/v4/search" +
    "?appType=1&curr=rub&dest=-1257786&lang=ru&locale=ru" +
    "&query=Moranti&resultset=catalog&spp=30";

  let page = 1;
  const allProducts = [];
  let totalPages = 1;

  while (page <= totalPages) {
    const url = baseUrl + "&page=" + page;
    process.stdout.write(`  Search page ${page}... `);

    const r = await fetchWithRetry(url);
    if (!r) {
      console.log("FAILED after retries");
      break;
    }
    const data = await r.json();
    const products = (data.products || []).filter(
      (p) => p.supplierId === SUPPLIER_ID
    );
    allProducts.push(...products);

    const total = data.total || 0;
    totalPages = Math.ceil(total / 100) || 1;
    console.log(`${products.length} Moranti products (total ${total})`);
    page++;
    if (page <= totalPages) await sleep(DELAY_MS * 3);
  }

  // Build map: article → normalized price data
  const map = new Map();
  for (const p of allProducts) {
    const size = p.sizes && p.sizes[0];
    map.set(p.id, {
      priceBasic: size?.price?.basic ? size.price.basic / 100 : null,
      priceProduct: size?.price?.product ? size.price.product / 100 : null,
      discount:
        size?.price?.basic && size?.price?.product
          ? Math.round((1 - size.price.product / size.price.basic) * 100)
          : null,
      rating: p.rating ?? null,
      feedbacks: p.feedbacks ?? null,
      totalQuantity: p.totalQuantity ?? null,
      supplierRating: p.supplierRating ?? null,
      pics: p.pics ?? null,
      name: p.name ?? null,
      colors: p.colors || [],
    });
  }

  return map;
}

/* =============================================
   Step 2: Card.json — какие артикулы нужно обновить
   ============================================= */

function needsCardFetch(dbProduct, syncLog, isFull) {
  if (isFull) return true;
  // Никогда не фетчили характеристики
  if (!dbProduct.characteristics) return true;
  // Никогда не фетчили даты
  if (!dbProduct.wbCreatedAt && !dbProduct.wbUpdatedAt) return true;
  // Stale: последний fetch был > 24h назад
  if (syncLog.lastCardFetchAt) {
    const age = Date.now() - new Date(syncLog.lastCardFetchAt).getTime();
    if (age > CARD_STALE_MS) return true;
  }
  return false;
}

/* =============================================
   Step 3: Prisma — обновить / создать / архивировать
   ============================================= */

async function syncToDb(searchMap, cardMap, dbProducts, syncLog) {
  const dbByArticle = new Map();
  for (const p of dbProducts) {
    if (p.wbArticle) dbByArticle.set(p.wbArticle, p);
  }

  // Also load archived products for slug conflict detection
  const archivedProducts = await prisma.product.findMany({
    where: { archivedAt: { not: null }, wbArticle: { not: null } },
  });
  const archivedByArticle = new Map();
  for (const p of archivedProducts) {
    if (p.wbArticle) archivedByArticle.set(p.wbArticle, p);
  }

  const searchArticles = new Set(searchMap.keys());
  const cardArticles = new Set(cardMap.keys());

  let pricesUpdated = 0;
  let cardApplied = 0;
  let created = 0;
  let archived = 0;
  let skippedCard = 0;

  /* ---------- Update existing products ---------- */

  for (const [article, sp] of searchMap) {
    const db = dbByArticle.get(article);
    if (!db) continue; // will be created below

    const priceUpdates = {};

    if (sp.priceProduct != null && sp.priceProduct !== db.price) {
      priceUpdates.price = sp.priceProduct;
    }
    if (sp.priceBasic != null && sp.priceBasic !== db.originalPrice) {
      priceUpdates.originalPrice = sp.priceBasic;
    }
    if (sp.rating != null && sp.rating !== db.rating) {
      priceUpdates.rating = sp.rating;
    }
    if (sp.feedbacks != null && sp.feedbacks !== db.reviewsCount) {
      priceUpdates.reviewsCount = sp.feedbacks;
    }

    // Photo count increased?
    if (sp.pics != null) {
      const currentCount = db.photoCount || (db.images ? db.images.length : 0);
      if (sp.pics > currentCount) {
        priceUpdates.photoCount = sp.pics;
      }
    }

    if (Object.keys(priceUpdates).length > 0) {
      if (!flags.dry) {
        await prisma.product.update({
          where: { id: db.id },
          data: priceUpdates,
        });
      }
      pricesUpdated++;
    }

    // Card.json data (характеристики, даты, названия)
    if (cardArticles.has(article)) {
      const card = cardMap.get(article);
      const cardUpdates = {};

      // Характеристики
      const cardOptions = card.grouped_options || card.options || [];
      if (cardOptions.length > 0) {
        const current = db.characteristics;
        const newVal = JSON.stringify(cardOptions);
        if (!current || JSON.stringify(current) !== newVal) {
          cardUpdates.characteristics = cardOptions;
        }
      }

      // Даты
      const wbCreated = card.create_date ? parseWbDate(card.create_date) : null;
      const wbUpdated = card.update_date ? parseWbDate(card.update_date) : null;
      if (wbCreated && !db.wbCreatedAt) cardUpdates.wbCreatedAt = wbCreated;
      if (wbUpdated) cardUpdates.wbUpdatedAt = wbUpdated;
      if (card.imt_id && !db.imtId) cardUpdates.imtId = card.imt_id;

      // Цвет и состав (из card.json, только если нет в БД)
      if (!db.colorName) {
        const colorName = extractColorFromCard(card);
        if (colorName) cardUpdates.colorName = colorName;
      }
      if (!db.composition) {
        const comp = extractCompositionFromCard(card);
        if (comp) cardUpdates.composition = comp;
      }

      // Категория (на основе subj_name, если wb-categories может определить)
      const subjName = card.subj_name || null;
      const subjId = card.data?.subject_id || null;
      const category = getCategory(article, subjName, subjId);
      if (category !== db.category) {
        cardUpdates.category = category;
      }

      // Название (только если было auto-generated)
      if (db.nameAutoGenerated !== false) {
        const composition = cardUpdates.composition || db.composition || null;
        const newName = generateName({
          category: cardUpdates.category || db.category,
          composition,
          wbName: card.imt_name || null,
        });
        if (newName !== db.name) {
          cardUpdates.name = newName;
          cardUpdates.nameAutoGenerated = true;
        }
      }

      // Описание (только если было auto-generated)
      if (card.description && card.description !== db.description) {
        if (db.descAutoGenerated !== false) {
          cardUpdates.description = card.description;
          cardUpdates.descAutoGenerated = true;
        }
      }

      if (Object.keys(cardUpdates).length > 0) {
        if (!flags.dry) {
          await prisma.product.update({
            where: { id: db.id },
            data: cardUpdates,
          });
        }
        cardApplied++;
      }
    } else {
      skippedCard++;
    }
  }

  /* ---------- Create new products (or reactivate archived) ---------- */

  for (const [article, sp] of searchMap) {
    if (dbByArticle.has(article)) continue;

    // Если товар был архивирован — реактивируем
    const archived = archivedByArticle.get(article);
    if (archived) {
      if (!flags.dry) {
        await prisma.product.update({
          where: { id: archived.id },
          data: { archivedAt: null },
        });
      }
      console.log(`  Reactivated: ${archived.id} article=${article}`);
      created++;
      continue;
    }

    const card = cardMap.get(article) || null;
    const subjName = card?.subj_name || null;
    const subjId = card?.data?.subject_id || null;
    const category = getCategory(article, subjName, subjId);
    const composition = card
      ? extractCompositionFromCard(card)
      : null;
    const colorName = card
      ? extractColorFromCard(card)
      : null;
    const wbName = sp.name || card?.imt_name || null;
    const newName = generateName({
      category,
      composition,
      wbName,
    });
    const cardOptions = card ? card.grouped_options || card.options || [] : [];
    const photoCount = sp.pics || card?.media?.photo_count || 1;

    if (flags.dry) {
      console.log(`  [DRY] Would create: article=${article} category=${category} name=${newName}`);
      created++;
      continue;
    }

    const maxId = await prisma.product.findFirst({ orderBy: { id: "desc" } });
    const nextNum = maxId ? parseInt(maxId.id.replace("mor-", "")) + 1 : 1;
    const newId = "mor-" + String(nextNum).padStart(3, "0");

    await prisma.product.create({
      data: {
        id: newId,
        slug: "wb-" + article,
        name: newName,
        price: sp.priceProduct || 0,
        originalPrice: sp.priceBasic || 0,
        currency: "₽",
        category,
        description: card?.description || "",
        descAutoGenerated: true,
        wbArticle: article,
        photoCount,
        image: cardCdnUrl(article, 1),
        images: cardCdnUrls(article, photoCount),
        imtId: card?.imt_id || null,
        colorName,
        composition,
        rating: sp.rating || null,
        reviewsCount: sp.feedbacks || null,
        nameAutoGenerated: true,
        characteristics: cardOptions,
        wbCreatedAt: card?.create_date ? parseWbDate(card.create_date) : null,
        wbUpdatedAt: card?.update_date ? parseWbDate(card.update_date) : null,
      },
    });

    console.log(`  Created: ${newId} article=${article} ${newName}`);
    created++;
  }

  /* ---------- Archive removed products ---------- */

  for (const db of dbProducts) {
    if (db.wbArticle && !searchArticles.has(db.wbArticle) && !db.archivedAt) {
      if (!flags.dry) {
        await prisma.product.update({
          where: { id: db.id },
          data: { archivedAt: new Date().toISOString() },
        });
      }
      console.log(`  Archived: ${db.id} article=${db.wbArticle} ${db.name}`);
      archived++;
    }
  }

  return { pricesUpdated, cardApplied, created, archived, skippedCard };
}

/* =============================================
   Helpers: extract from card.json
   ============================================= */

function extractColorFromCard(card) {
  const allOpts = card.grouped_options || card.options || [];
  for (const g of allOpts) {
    const subOpts = g.options || (g.name && g.value ? [g] : []);
    for (const o of subOpts) {
      if (o.name === "Цвет" && o.is_variable && o.variable_values) {
        return o.variable_values.join(", ");
      }
    }
  }
  return card.nm_colors_names || null;
}

function extractCompositionFromCard(card) {
  if (card.compositions) {
    return card.compositions.map((c) => c.name).join("; ");
  }
  const allOpts = card.options || [];
  for (const o of allOpts) {
    if (o.name === "Состав") return o.value;
  }
  return null;
}

/* =============================================
   Helper: products.json sync
   ============================================= */

async function syncProductsJson() {
  const products = await prisma.product.findMany({ orderBy: { id: "asc" } });
  let settings = null;
  try {
    const s = await prisma.settings.findUnique({ where: { id: "singleton" } });
    settings = s?.data || null;
  } catch { /* ignore */ }

  // Compute image URLs for JSON fallback (raw JSON, no mapProduct)
  const withImages = products.map((p) => {
    const photoCount = p.photoCount || p.images?.length || 1;
    const image = p.wbArticle
      ? cardCdnUrl(p.wbArticle, 1, "big")
      : p.image;
    const images = p.wbArticle
      ? cardCdnUrls(p.wbArticle, photoCount, "big")
      : p.images;
    return { ...p, image, images };
  });

  const data = { products: withImages, settings };
  writeFileSync(PRODUCTS_JSON_PATH, JSON.stringify(data, null, 2), "utf-8");
  console.log(`  products.json: ${products.length} products written`);
}

/* =============================================
   Main
   ============================================= */

async function main() {
  const startTime = Date.now();
  console.log("=== sync-public.mjs ===\n");

  if (flags.dry) console.log("  [DRY RUN — no writes]\n");

  const syncLog = loadSyncLog();
  const isFull =
    flags.full ||
    !syncLog.lastCardFetchAt || // never fetched card.json
    Date.now() - new Date(syncLog.lastCardFetchAt).getTime() > CARD_STALE_MS;

  // --- Phase 1: search.wb.ru ---
  console.log("[1/3] Fetching prices & ratings from search.wb.ru...");
  const searchMap = await fetchSearchProducts();
  console.log(`  Found ${searchMap.size} Moranti products on WB\n`);

  // --- Phase 2: card.json ---
  const dbProducts = await prisma.product.findMany({
    where: { archivedAt: null, wbArticle: { not: null } },
  });
  const dbByArticle = new Map();
  for (const p of dbProducts) {
    if (p.wbArticle) dbByArticle.set(p.wbArticle, p);
  }

  // Какие артикулы нужно обновить?
  const articlesToFetch = [];
  for (const article of searchMap.keys()) {
    const db = dbByArticle.get(article);
    if (!db || needsCardFetch(db, syncLog, isFull)) {
      articlesToFetch.push(article);
    }
  }

  // Новые товары (на WB, нет в БД) — всегда фетчим card.json
  for (const article of searchMap.keys()) {
    if (!dbByArticle.has(article) && !articlesToFetch.includes(article)) {
      articlesToFetch.push(article);
    }
  }

  let cardMap = new Map();
  if (articlesToFetch.length > 0) {
    console.log(
      `[2/3] Fetching card.json for ${articlesToFetch.length} products ` +
      `(${isFull ? "full" : "incremental"})...`
    );
    cardMap = await batchFetchCardJson(articlesToFetch, {
      concurrency: 3,
      onProgress: (fetched, total) => {
        process.stdout.write(
          `\r  Card.json: ${fetched}/${total}`
        );
      },
    });
    console.log(`\n  Got ${cardMap.size}/${articlesToFetch.length}\n`);
  } else {
    console.log("[2/3] Skipping card.json (all up to date)\n");
  }

  // --- Phase 3: Prisma ---
  console.log("[3/3] Syncing to database...");
  const stats = await syncToDb(searchMap, cardMap, dbProducts, syncLog);
  console.log("");

  // --- Save sync log ---
  const now = new Date().toISOString();
  syncLog.lastRunAt = now;
  if (articlesToFetch.length > 0) syncLog.lastCardFetchAt = now;
  syncLog.stats = stats;
  syncLog.duration = ((Date.now() - startTime) / 1000).toFixed(1);
  saveSyncLog(syncLog);

  // --- Optional: products.json ---
  if (flags.syncJson) {
    console.log("Syncing products.json...");
    await syncProductsJson();
  }

  // --- Optional: debug dump ---
  if (flags.saveJson && !flags.dry) {
    const dump = {
      fetchedAt: now,
      searchProducts: Array.from(searchMap.entries()).map(([k, v]) => ({
        article: k,
        ...v,
      })),
      cardProducts: [],
    };
    writeFileSync(CARD_DUMP_PATH, JSON.stringify(dump, null, 2), "utf-8");
    console.log(`  Debug dump: ${CARD_DUMP_PATH}`);
  }

  // --- Summary ---
  console.log("\n=== SUMMARY ===");
  console.log(`  Prices updated:   ${stats.pricesUpdated}`);
  console.log(`  Card applied:     ${stats.cardApplied}`);
  console.log(`  Created:          ${stats.created}`);
  console.log(`  Archived:         ${stats.archived}`);
  console.log(`  Card skipped:     ${stats.skippedCard}`);
  console.log(`  Duration:         ${syncLog.duration}s`);
  console.log(`  Mode:             ${isFull ? "full" : "incremental"}` +
               (flags.dry ? " (DRY)" : ""));
}

main()
  .catch((e) => {
    console.error("\nFATAL:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
