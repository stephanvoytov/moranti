#!/usr/bin/env node
/**
 * enrich-scrape.mjs — Дополняет wb-scrape-result.json данными из card.json
 * (характеристики) и search.wb.ru (цены/рейтинги). Без токена.
 *
 * Использование: node scripts/enrich-scrape.mjs
 */

import { readFileSync, writeFileSync } from "fs";

const CDN_HOSTS = [
  "https://kgd-basket-cdn-01bl.geobasket.ru",
  "https://basket-01.wbbasket.ru",
  "https://basket-02.wbbasket.ru",
  "https://basket-05.wbbasket.ru",
  "https://basket-08.wbbasket.ru",
  "https://basket-10.wbbasket.ru",
  "https://basket-12.wbbasket.ru",
  "https://basket-15.wbbasket.ru",
];
const FETCH_TIMEOUT = 15000;
const DELAY_MS = 300;
const SUPPLIER_ID = 312222;

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/125",
  "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/120",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) AppleWebKit/605.1.15",
];

function randomHeaders() {
  const wbauid = "96" + String(Math.floor(Math.random() * 1e15)).padStart(15, "0");
  return {
    "User-Agent": USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
    Accept: "*/*",
    "Accept-Language": "ru,en;q=0.9",
    Cookie: "_wbauid=" + wbauid + "; _cp=1",
  };
}

async function fetchWithRetry(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const r = await fetch(url, {
      headers: randomHeaders(),
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
    });
    if (r.ok) return r;
    if (r.status === 429) {
      const wait = attempt * 5000;
      console.log("429, retry in " + (wait / 1000) + "s...");
      await sleep(wait);
      continue;
    }
    throw new Error("HTTP " + r.status);
  }
  return null;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function getVolPart(article) {
  return {
    vol: Math.floor(article / 100000),
    part: Math.floor(article / 1000),
  };
}

/* =============================================
   Fetchers
   ============================================= */

/** card.json — характеристики, состав, даты (CDN, без токена) */
async function fetchCardJson(article) {
  const { vol, part } = getVolPart(article);
  for (const host of CDN_HOSTS) {
    const url = host + "/vol" + vol + "/part" + part + "/" + article + "/info/ru/card.json";
    try {
      const r = await fetch(url, {
        headers: randomHeaders(),
        signal: AbortSignal.timeout(FETCH_TIMEOUT),
      });
      if (!r.ok) continue;
      const data = await r.json();
      if (data && data.imt_id) return data;
    } catch {
      // try next host
    }
  }
  return null;
}

/** search.wb.ru — цены, рейтинги, остатки (без токена) */
async function fetchSearchPrices() {
  const baseUrl =
    "https://search.wb.ru/exactmatch/ru/common/v4/search" +
    "?appType=1&curr=rub&dest=-1257786&lang=ru&locale=ru" +
    "&query=Moranti&resultset=catalog&spp=30";

  let page = 1;
  let allProducts = [];
  let totalPages = 1;

  while (page <= totalPages) {
    const url = baseUrl + "&page=" + page;
    process.stdout.write("  Search page " + page + "... ");

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

    // Пагинация
    const total = data.total || 0;
    totalPages = Math.ceil(total / 100) || 1;
    console.log(products.length + " our products (total " + total + ")");
    page++;

    if (page <= totalPages) await sleep(DELAY_MS * 3);
  }

  return allProducts;
}

/* =============================================
   Main
   ============================================= */

async function main() {
  console.log("=== enrich-scrape.mjs ===\n");

  const scrape = JSON.parse(readFileSync("data/wb-scrape-result.json", "utf-8"));

  // --- Шаг 1: Цены и рейтинги из search.wb.ru ---
  console.log("[1/2] Fetching prices & ratings from search.wb.ru...");
  const searchProducts = await fetchSearchPrices();
  const priceMap = new Map(searchProducts.map((p) => [p.id, p]));
  console.log("  Found " + priceMap.size + " products with prices\n");

  // --- Шаг 2: Характеристики и даты из card.json ---
  console.log("[2/2] Fetching card.json for characteristics...");
  let enriched = 0;
  let failed = 0;
  let priceUpdated = 0;

  for (let i = 0; i < scrape.products.length; i++) {
    const p = scrape.products[i];
    const article = p.article;

    process.stdout.write(
      "  [" + (i + 1) + "/" + scrape.products.length + "] article=" + article + "... "
    );

    // --- Цены из search (всегда обновляем) ---
    const sp = priceMap.get(article);
    if (sp) {
      const size = sp.sizes && sp.sizes[0];
      p.priceBasic = size?.price?.basic ? size.price.basic / 100 : p.priceBasic;
      p.priceProduct = size?.price?.product ? size.price.product / 100 : p.priceProduct;
      p.discount =
        p.priceBasic && p.priceProduct
          ? Math.round((1 - p.priceProduct / p.priceBasic) * 100)
          : p.discount;
      p.rating = sp.rating ?? p.rating;
      p.feedbacks = sp.feedbacks ?? p.feedbacks;
      p.totalQuantity = sp.totalQuantity ?? p.totalQuantity;
      p.supplierRating = sp.supplierRating ?? p.supplierRating;
      priceUpdated++;
    }

    // --- card.json (характеристики, только если нет cardOptions) ---
    if (p.cardOptions && p.cardOptions.length > 0) {
      process.stdout.write("OK (already enriched)\n");
      enriched++;
      continue;
    }

    const card = await fetchCardJson(article);

    if (card) {
      p.subjId = card.data?.subject_id ?? p.subjId ?? null;
      p.cardOptions = card.grouped_options || card.options || [];
      p.wbCreatedAt = card.create_date ?? p.wbCreatedAt ?? null;
      p.wbUpdatedAt = card.update_date ?? p.wbUpdatedAt ?? null;

      if (!p.compositions) {
        const compositions = (card.compositions || []).map((c) => c.name).join("; ");
        p.compositions = compositions || null;
      }
      if (!p.colorName) {
        const allOpts = card.grouped_options || card.options || [];
        for (const g of allOpts) {
          const subOpts = g.options || (g.name && g.value ? [g] : []);
          for (const o of subOpts) {
            if (o.name === "Цвет" && o.is_variable && o.variable_values) {
              p.colorName = o.variable_values.join(", ");
              break;
            }
          }
          if (p.colorName) break;
        }
      }
      if (!p.categoryName && card.subj_name) {
        p.categoryName = card.subj_name;
      }

      console.log(
        "OK subj_id=" + (card.data?.subject_id ?? "N/A") +
        " options=" + (card.grouped_options || []).length
      );
      enriched++;
    } else {
      console.log("NO card.json");
      failed++;
    }

    await sleep(DELAY_MS);
  }

  // Сохраняем
  scrape.fetchedAt = new Date().toISOString();
  writeFileSync("data/wb-scrape-result.json", JSON.stringify(scrape, null, 2), "utf-8");

  console.log("\n=== SUMMARY ===");
  console.log("Prices updated: " + priceUpdated);
  console.log("Card enriched: " + enriched);
  console.log("Failed: " + failed);
  console.log("Total: " + scrape.products.length);
  console.log("Saved to: data/wb-scrape-result.json");
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
