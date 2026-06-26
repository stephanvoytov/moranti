#!/usr/bin/env node
/**
 * sync-ozon.mjs — Синхронизация товаров с Ozon через Seller API.
 *
 * Требует OZON_CLIENT_ID и OZON_API_KEY в .env или process.env.
 * Использует POST /v3/product/info/list для получения данных по offer_id.
 *
 * Использование:
 *   node scripts/sync-ozon.mjs              # полный прогон
 *   node scripts/sync-ozon.mjs --dry        # пробный (без записи)
 *   node scripts/sync-ozon.mjs --sync-json  # + обновить data/products.json
 *
 * Формат лога: data/ozon-sync-log.json
 */

import { writeFileSync, existsSync, readFileSync } from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const OZON_API_BASE = "https://api-seller.ozon.ru";
const SYNC_LOG_PATH = "data/ozon-sync-log.json";

const flags = {
  dry: process.argv.includes("--dry"),
  syncJson: process.argv.includes("--sync-json"),
};

/* ─── Лог ─── */

function loadLog() {
  try {
    return JSON.parse(readFileSync(SYNC_LOG_PATH, "utf-8"));
  } catch {
    return { lastRunAt: null, stats: {} };
  }
}

function saveLog(log) {
  writeFileSync(SYNC_LOG_PATH, JSON.stringify(log, null, 2), "utf-8");
}

/* ─── Ozon API ─── */

function headers() {
  return {
    "Client-Id": process.env.OZON_CLIENT_ID || "",
    "Api-Key": process.env.OZON_API_KEY || "",
    "Content-Type": "application/json",
  };
}

/**
 * POST /v3/product/info/list — получить инфо о товарах по offer_id.
 * Ограничение: до 1000 артикулов за запрос.
 */
async function fetchProductInfo(offerIds) {
  const results = [];

  // Ozon API лимит — 1000 артикулов на запрос
  for (let i = 0; i < offerIds.length; i += 100) {
    const chunk = offerIds.slice(i, i + 100);
    const body = {
      offer_id: chunk.map(String),
      visibility: "ALL",
    };

    const r = await fetch(`${OZON_API_BASE}/v3/product/info/list`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
    });

    if (!r.ok) {
      const text = await r.text();
      console.error(`  Ozon API error (${r.status}): ${text.slice(0, 200)}`);
      continue;
    }

    const data = await r.json();
    results.push(...(data.items || []));
  }

  // Build map: offer_id → product info
  const map = new Map();
  for (const item of results) {
    map.set(Number(item.offer_id), item);
  }
  return map;
}

/**
 * POST /v1/product/prices/details — получить цены.
 * Ограничение: до 1000 артикулов за запрос.
 */
async function fetchPrices(offerIds) {
  const results = [];

  for (let i = 0; i < offerIds.length; i += 100) {
    const chunk = offerIds.slice(i, i + 100);
    const body = {
      filter: {
        offer_id: chunk.map(String),
      },
      limit: 100,
    };

    const r = await fetch(`${OZON_API_BASE}/v1/product/prices/details`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
    });

    if (!r.ok) {
      const text = await r.text();
      console.error(`  Ozon prices API error (${r.status}): ${text.slice(0, 200)}`);
      continue;
    }

    const data = await r.json();
    results.push(...(data.items || []));
  }

  const map = new Map();
  for (const item of results) {
    map.set(Number(item.offer_id), item);
  }
  return map;
}

/* ─── Основная синхронизация ─── */

async function sync() {
  console.log("=== sync-ozon.mjs ===\n");

  if (!process.env.OZON_CLIENT_ID || !process.env.OZON_API_KEY) {
    console.error("ERROR: OZON_CLIENT_ID and OZON_API_KEY must be set in .env");
    process.exit(1);
  }

  const log = loadLog();

  // Все товары с ozonArticle (неархивные)
  const dbProducts = await prisma.product.findMany({
    where: { archivedAt: null, ozonArticle: { not: null } },
  });

  const articles = dbProducts
    .map((p) => Number(p.ozonArticle))
    .filter((a) => a > 0);

  console.log(`Found ${articles.length} products with Ozon articles\n`);

  if (articles.length === 0) {
    console.log("Nothing to sync.");
    return { added: 0, updated: 0, archived: 0, total: 0, skipped: 0 };
  }

  // --- Phase 1: Product info ---
  console.log("[1/3] Fetching product info from Ozon API...");
  const infoMap = await fetchProductInfo(articles);
  console.log(`  Got ${infoMap.size}/${articles.length} products\n`);

  // --- Phase 2: Prices ---
  console.log("[2/3] Fetching prices from Ozon API...");
  const priceMap = await fetchPrices(articles);
  console.log(`  Got ${priceMap.size}/${articles.length} price records\n`);

  // --- Phase 3: Update DB ---
  console.log("[3/3] Updating database...");

  let updated = 0;
let ratingDebugged = false;
  let errors = 0;
  const details = { updated: [], priceUpdated: [] };

  for (const db of dbProducts) {
    const article = Number(db.ozonArticle);
    const info = infoMap.get(article);
    const priceInfo = priceMap.get(article);

    if (!info && !priceInfo) {
      errors++;
      continue;
    }

    const updates = {};

    // --- Prices ---
    if (info) {
      const ozonPrice = info.price ? Number(info.price) : null;
      const ozonOldPrice = info.old_price ? Number(info.old_price) : null;

      if (ozonPrice != null && ozonPrice !== db.ozonPrice) {
        updates.ozonPrice = ozonPrice;
      }
      if (ozonOldPrice != null && ozonOldPrice !== db.ozonOriginalPrice) {
        updates.ozonOriginalPrice = ozonOldPrice;
      }

      // Display price = min across available marketplaces
      if (ozonPrice != null) {
        const wbPrice = db.wbPrice ?? Infinity;
        const minPrice = Math.min(ozonPrice, wbPrice);
        if (minPrice !== Infinity && minPrice !== db.price) {
          updates.price = minPrice;
        }
      }
      if (ozonOldPrice != null) {
        const wbOrig = db.wbOriginalPrice ?? Infinity;
        const minOrig = Math.min(ozonOldPrice, wbOrig);
        if (minOrig !== Infinity && minOrig !== db.originalPrice) {
          updates.originalPrice = minOrig;
        }
      }
    }

    // Alternative price source: priceInfo
    if (priceInfo && priceInfo.price) {
      const ozonPrice = Number(priceInfo.price.price) || Number(priceInfo.price.old_price) || null;
      // priceInfo has more granular data but we already got the main price from info
    }

    // --- Images ---
    if (info && info.images && info.images.length > 0) {
      const currentImages = db.images || [];
      const newImages = info.images.filter((url) => url);

      if (newImages.length > 0) {
        const hasNewImages =
          newImages.length !== currentImages.length ||
          newImages.some((url, i) => url !== currentImages[i]);

        if (hasNewImages) {
          updates.image = newImages[0];
          updates.images = newImages;
          updates.photoCount = newImages.length;
        }
      }
    }

    // --- Stock & archive status ---
    if (info) {
      const isNowArchived = info.is_archived === true || info.is_autoarchived === true;
      const currentIsArchived = db.archivedAt !== null;

      // Stock: sum across all warehouses
      let totalStock = 0;
      if (info.stocks?.stocks?.length) {
        for (const s of info.stocks.stocks) {
          totalStock += (s.present || 0) - (s.reserved || 0);
        }
      }
      const hasStock = totalStock > 0;

      // Has discount FBO stock?
      if (info.discounted_fbo_stocks != null && info.discounted_fbo_stocks > 0) {
        // discounted stock counts as available
      }

      // --- Archived on Ozon → archive in our DB ---
      if (isNowArchived && !currentIsArchived) {
        updates.archivedAt = new Date();
        console.log(`  Product archived on Ozon: ${db.id} article=${article}`);
      }
      // No longer archived on Ozon → un-archive
      if (!isNowArchived && currentIsArchived) {
        updates.archivedAt = null;
        console.log(`  Product back from archive on Ozon: ${db.id} article=${article}`);
      }

      // --- Stock → inStock ---
      const currentlyInStock = db.inStock !== false;
      if (hasStock !== currentlyInStock) {
        updates.inStock = hasStock;
        if (!hasStock) console.log(`  Out of stock: ${db.id} article=${article}`);
      }
    }

    // --- Rating & Reviews (Ozon) ---
    if (info) {
      // Пробуем извлечь рейтинг. Поле может называться по-разному в разных версиях API.
      let ozonRating = info.rating != null ? Number(info.rating) : null;
      let ozonReviewsCount = null;

      if (info.reviews_count != null) ozonReviewsCount = Number(info.reviews_count);
      else if (info.total_reviews != null) ozonReviewsCount = Number(info.total_reviews);
      else if (info.feedback_rating?.count != null) ozonReviewsCount = Number(info.feedback_rating.count);

      // Если рейтинг не нашли — выведем все ключи info первого товара (один раз за запуск)
      if (ozonRating == null && !ratingDebugged) {
        ratingDebugged = true;
        const allKeys = Object.keys(info).filter(k => !["offer_id","name","price","old_price","images",
          "is_archived","is_autoarchived","stocks","discounted_fbo_stocks","id","images360","primary_image",
          "currency_code","visibility_details","marketing_price","min_price","commissions","errors",
          "sources","statuses","barcodes","color_image","created_at","updated_at","description_category_id",
          "has_discounted_fbo_item","is_discounted","is_kgt","is_prepayment_allowed","is_super","model_info",
          "promotions","type_id","vat","volume_weight","price_indexes"].includes(k));
        console.log(`  [debug] ⚠ rating not found in Ozon response for ${db.id}. Available extra keys: ${allKeys.join(", ") || "(none)"}`);
        // Также выведем ценную информацию
        if (allKeys.length === 0) {
          console.log(`  [debug] All keys: ${Object.keys(info).join(", ")}`);
        }
      }

      if (ozonRating == null) { /* rating not found, skip rating update */ } else {

      // Комбинируем с WB через взвешенное среднее
      const wbRC = db.reviewsCount ?? 0;
      const wbRat = db.rating ?? 0;
      const hasWb = wbRC > 0 && wbRat > 0;
      const hasOzRC = ozonReviewsCount != null && ozonReviewsCount > 0;

      let combRat, combRC;

      if (hasWb && hasOzRC) {
        const total = wbRC + ozonReviewsCount;
        combRat = (wbRat * wbRC + ozonRating * ozonReviewsCount) / total;
        combRC = total;
      } else if (hasWb) {
        combRat = wbRat;
        combRC = wbRC;
      } else if (hasOzRC) {
        combRat = ozonRating;
        combRC = ozonReviewsCount;
      } else {
        combRat = ozonRating;
        combRC = wbRC || 0;
      }

      combRat = Math.round(combRat * 10) / 10;

      if (combRat !== db.rating) updates.rating = combRat;
      if (combRC !== db.reviewsCount) updates.reviewsCount = combRC;
      }
    }

    // --- Apply updates ---
    if (Object.keys(updates).length > 0) {
      if (!flags.dry) {
        await prisma.product.update({
          where: { id: db.id },
          data: updates,
        });
      }

      const changes = Object.keys(updates);
      details.updated.push({ id: db.id, name: db.name, changes });
      updated++;
    }
  }

  // --- Phase 4 (optional): products.json ---
  if (flags.syncJson && !flags.dry) {
    console.log("\nSyncing products.json...");
    const all = await prisma.product.findMany({ orderBy: { id: "asc" } });
    writeFileSync(
      "data/products.json",
      JSON.stringify({ products: all }, null, 2),
      "utf-8"
    );
    console.log(`  ${all.length} products written`);
  }

  // --- Save log ---
  const now = new Date().toISOString();
  log.lastRunAt = now;
  log.stats = { updated, errors, total: dbProducts.length };
  log.details = details;
  saveLog(log);

  // --- Summary ---
  console.log("\n=== SUMMARY ===");
  console.log(`  Updated:   ${updated}`);
  console.log(`  Errors:    ${errors}`);
  console.log(`  Total:     ${dbProducts.length}`);
  console.log(`  Mode:      ${flags.dry ? "DRY" : "live"}`);

  return { updated, errors, total: dbProducts.length };
}

/* ─── Запуск ─── */

sync()
  .then((result) => {
    // Последняя строка — JSON-отчёт (для wb-sync.ts парсера)
    console.log(JSON.stringify(result));
  })
  .catch((e) => {
    console.error("\nFATAL:", e);
    process.exit(1);
  })
  .finally(() => prisma["$disconnect"]());
