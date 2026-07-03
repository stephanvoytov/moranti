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
const WB_SEARCH_API = "https://search.wb.ru/exactmatch/ru/common/v18/search";
const OZON_API = "https://api-seller.ozon.ru";
// WB supplier ID для фильтрации результатов поиска (можно переопределить через WB_SUPPLIER_ID в .env)
const SUPPLIER_ID = Number(process.env.WB_SUPPLIER_ID) || 312222;

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
  if (!nmIDs || nmIDs.length === 0) return { priceMap: new Map(), errors: 0 };
  const priceMap = new Map();
  let errors = 0;
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
      errors++;
    }

    // Rate limit: не более 3 запросов в секунду
    if (i + BATCH < nmIDs.length) {
      await new Promise((r) => setTimeout(r, 350));
    }
  }

  log.line(` — ${priceMap.size} priced`);
  return { priceMap, errors };
}

/**
 * Получает цены через публичное search API Wildberries (без API-ключа).
 * Работает как fallback, когда WB_PRICES_API недоступен (401/429/не тот скоуп).
 * Возвращает Map<nmID, {price, discountedPrice}>.
 */
async function wbFetchPublicPrices(nmIDs) {
  if (!nmIDs || nmIDs.length === 0) return new Map();
  const priceMap = new Map();

  log.write(`  Fetching WB prices (search API) for ${nmIDs.length} cards:`);

  // search API может отдавать 429 — делаем до 3 попыток с exponential backoff
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

  // search API возвращает все товары продавца — достаточно одного запроса
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
          stock: stockQty, // null если нет данных, 0 если нет на складе
        });
      }
    }

    log.line(` — ${priceMap.size} products from search API`);

    // Если не все nmID нашлись — пробуем вторую страницу
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
 * Извлекает значение характеристики по имени из Content API карточки.
 * Content API возвращает характеристики в двух форматах:
 *   - Новый: [{ options: [{name, value}, ...], group_name: "..." }]
 *   - Старый: [{ name, value }, ...] (card.json)
 * @param {object} card
 * @param {string} charName
 * @returns {string|null}
 */
function extractCharByName(card, charName) {
  const groups = card.characteristics || [];
  for (const group of groups) {
    // Новый формат Content API: group.options[]
    if (group.options && Array.isArray(group.options)) {
      for (const opt of group.options) {
        if (opt.name === charName || opt.name?.toLowerCase() === charName.toLowerCase()) {
          const vals = Array.isArray(opt.value) ? opt.value : [opt.value];
          return vals.filter(Boolean).join(", ") || null;
        }
      }
    }
    // Старый формат (card.json / fallback)
    if (group.name === charName || group.name?.toLowerCase() === charName.toLowerCase()) {
      const vals = Array.isArray(group.value) ? group.value : [group.value];
      return vals.filter(Boolean).join(", ") || null;
    }
  }
  return null;
}

/**
 * Извлекает цвет из card.json-подобной структуры WB Content API.
 */
function extractColorName(card) {
  const colors = card.colors || [];
  if (colors.length > 0) {
    return colors.map((c) => c.name).filter(Boolean).join(", ");
  }
  return extractCharByName(card, "Цвет") || extractCharByName(card, "Цвет товара") || null;
}

/**
 * Извлекает состав из card.json-подобной структуры WB Content API.
 */
function extractComposition(card) {
  const comps = card.compositions || [];
  if (comps.length > 0) {
    return comps.map((c) => c.name).filter(Boolean).join("; ");
  }
  return extractCharByName(card, "Состав") || null;
}

/**
 * Извлекает описание из WB Content API card.
 */
function extractDescription(card) {
  if (card.description) return card.description;
  return extractCharByName(card, "Описание") || extractCharByName(card, "Полное описание") || "";
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
 * Маппинг WB характеристики "Модель сумки" → категории Moranti.
 * Content API возвращает в characteristics: { name: "Модель сумки", value: "кроссбоди" }
 */
const MODEL_CATEGORY_MAP = {
  "кроссбоди": "crossbody",
  "кросс-боди": "crossbody",
  "кросс": "crossbody",
  "багет": "baguette",
  "седло": "saddle",
  "тоут": "tote",
  "шоппер": "tote",
  "шопер": "tote",
  "мешок": "tote",
  "через плечо": "na-plecho",
  "на плечо": "na-plecho",
  "трансформер": "backpack",
  "рюкзак": "backpack",
  "деловая": "crossbody",
  "такс": "baguette",
  "саквояж": "baguette",
  "модная": "crossbody",
};

/**
 * Извлекает модель сумки из характеристики "Модель сумки" WB Content API.
 * Парсит первое совпадение по MODEL_CATEGORY_MAP.
 * Поддерживает оба формата Content API (options[] и прямой).
 *
 * @param {object} card — карточка товара из Content API
 * @returns {string|null}
 */
function resolveModelFromCard(card) {
  const raw = extractCharByName(card, "Модель сумки") || "";
  if (!raw) return null;
  const lower = raw.toLowerCase();
  for (const [keyword, cat] of Object.entries(MODEL_CATEGORY_MAP)) {
    if (lower.includes(keyword)) return cat;
  }
  return null;
}

/**
 * Нормализует категорию из WB Content API card.
 * Приоритет: 1) характеристика "Модель сумки" → 2) subjectID (CATEGORY_MAP).
 */
function resolveCategory(card) {
  // 1) Модель сумки из характеристики Content API (самый точный сигнал)
  const fromModel = resolveModelFromCard(card);
  if (fromModel) return fromModel;

  // 2) Fallback: subjectID-based (для subjectID 1,2,3,5,6,7,8,25)
  const subjId = card.subjectID || card.subject_id || null;
  const subjName = card.subjectName || card.subject_name || null;
  return wbToCategory(subjId, subjName, subjId);
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
  // Fallback: color_image (строка или массив)
  if (info?.color_image) {
    if (Array.isArray(info.color_image)) {
      return info.color_image.filter(Boolean).join(", ") || null;
    }
    if (typeof info.color_image === "string") return info.color_image;
  }
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
  // Сначала проверяем НАЗВАНИЕ товара — оно точнее указывает модель
  // (Ozon attribute 20259 может классифицировать все сумки как "кросс-боди"
  // даже если это багет/седло/тоут)
  const text = [
    info?.category,
    info?.name,
    info?.offer_id,
  ].filter(Boolean).join(" ").toLowerCase();

  if (text) {
    if (text.includes("шоппер") || text.includes("шопер") || text.includes("shopp")) return "tote";
    if (text.includes("рюкзак") || text.includes("backpack") || text.includes("rucksack")) return "backpack";
    // "седл" ДО "через плечо" — Sedlo содержит оба слова, седло важнее
    if (text.includes("седл") || text.includes("седло") || text.includes("saddle") || text.includes("sedlo")) return "saddle";
    if (text.includes("багет") || text.includes("baguette")) return "baguette";
    if (text.includes("через плечо") || text.includes("na plecho") || text.includes("na-plecho")) return "na-plecho";
    // "тоут" — однозначный признак, но ДО "плеч"/"на плечо" чтобы не спутать с "сумка на плечо, тоут"
    if (text.includes("тоут") || text.includes("toute") || text.includes("tout ")) return "tote";
  }

  // Затем Ozon attribute id=20259 (назначение/тип сумки) — для товаров,
  // где название не дало однозначной категории
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

  // Если название не дало категории — пробуем слабые сигналы из названия
  if (text) {
    if (text.includes("кросс") || text.includes("crossbody") || text.includes("клатч") || text.includes("clutch")) return "crossbody";
    if (text.includes("плеч") || text.includes("наплеч")) return "na-plecho";
  }

  return null;
}

/**
 * Группирует Ozon товары по атрибуту 9048 (модель) и привязывает к модели.
 * Если хотя бы один товар из группы уже имеет modelId (от WB) — наследуют все.
 * Если нет — создаётся новая модель ozon-*.
 */
async function syncOzonModels(prisma, attrMap) {
  const groups = new Map(); // "modelName" → [offerId, ...]
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

  let created = 0, assigned = 0;

  for (const [modelName, offerIds] of groups) {
    const products = await prisma.product.findMany({ where: { sku: { in: offerIds } } });
    if (products.length === 0) continue;

    // Если хоть один уже в модели — все наследуют
    const existingModelId = products.find((p) => p.modelId)?.modelId;

    if (existingModelId) {
      for (const p of products) {
        if (p.modelId !== existingModelId) {
          await prisma.product.update({ where: { id: p.id }, data: { modelId: existingModelId } });
          assigned++;
        }
      }
    } else {
      // Создаём новую Ozon-модель
      const slug = "model-ozon-" + modelName
        .toLowerCase().replace(/[/\s]+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");

      let model = await prisma.model.findFirst({ where: { slug } });
      if (!model) {
        model = await prisma.model.create({
          data: { id: slug, name: modelName, slug, category: products[0].category || "crossbody", description: "" },
        });
        created++;
      }
      for (const p of products) {
        if (p.modelId !== model.id) {
          await prisma.product.update({ where: { id: p.id }, data: { modelId: model.id } });
          assigned++;
        }
      }
    }
  }
  return { created, assigned };
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
    bySku: new Map(all.filter((p) => p.sku).map((p) => [p.sku, p])),
    all,
  };
}

/** Генерирует mor-NNN id */
async function generateId(prisma) {
  const last = await prisma.product.findFirst({
    orderBy: { id: "desc" },
    select: { id: true },
  });
  const num = last ? parseInt(last.id.replace("mor-", ""), 10) + 1 : 1;
  return "mor-" + String(num).padStart(3, "0");
}

/** Slug из строки: BalensaTaup → balensa-taup */
function makeSlug(s) {
  if (!s) return null;
  return s
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[/]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
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
      wbArticle: data.wbArticle ? BigInt(data.wbArticle) : null,
      ozonArticle: data.ozonArticle ? BigInt(data.ozonArticle) : null,
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
  if (data.colorName !== undefined) updateData.colorName = data.colorName;
  if (data.composition !== undefined) updateData.composition = data.composition;
  if (data.inStock !== undefined) updateData.inStock = data.inStock;
  if (data.photoCount !== undefined) updateData.photoCount = data.photoCount;
  if (data.wbStock !== undefined) updateData.wbStock = data.wbStock;
  if (data.ozonStock !== undefined) updateData.ozonStock = data.ozonStock;
  if (data.ozonImage !== undefined) updateData.ozonImage = data.ozonImage;
  if (data.ozonImages !== undefined) updateData.ozonImages = data.ozonImages;
  if (data.characteristics !== undefined) updateData.characteristics = data.characteristics;
  if (data.nameAutoGenerated !== undefined) updateData.nameAutoGenerated = data.nameAutoGenerated;
  if (data.descAutoGenerated !== undefined) updateData.descAutoGenerated = data.descAutoGenerated;
  if (data.wbCreatedAt !== undefined) updateData.wbCreatedAt = data.wbCreatedAt;
  if (data.wbUpdatedAt !== undefined) updateData.wbUpdatedAt = data.wbUpdatedAt;
  if (data.archivedAt !== undefined) updateData.archivedAt = data.archivedAt;
  if (data.sku !== undefined) updateData.sku = data.sku;

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

  // ─── Стоки (количество) — читаем, но НЕ меняем inStock ───
  // WB stock из search API
  if (wbPrices?.stock !== undefined) {
    if (wbPrices.stock !== (db?.wbStock ?? null)) data.wbStock = wbPrices.stock;
  }
  // Ozon stock из ProductInfo
  if (ozonInfo?.stocks?.stocks) {
    const qty = ozonInfo.stocks.stocks.reduce(
      (s, st) => s + Math.max(0, (st.present || 0) - (st.reserved || 0)), 0
    );
    if (qty !== (db?.ozonStock ?? null)) data.ozonStock = qty;
  }
  // inStock НЕ трогаем — archiveGoneProducts займётся теми кого нет на маркетплейсах

  // ─── Фото ───
  // Основные фото (для витрины): приоритет WB
  if (wbCard) {
    const photoCount = extractPhotoCount(wbCard);
    const article = wbCard.nmID;
    data.photoCount = photoCount;
    data.image = cdnImageUrl(article, 1);
    data.images = cdnImageUrls(article, photoCount);
  } else if (ozonInfo?.images?.length && !db?.wbArticle && !db?.ozonImage) {
    // Ozon-only товары (нет WB): записываем Ozon фото как основные
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
 * Создаёт/обновляет Model из WB imtId групп.
 *
 * После обработки WB-карточек собирает уникальные imtId из wbCards,
 * для каждого создаёт Model (если нет) и привязывает все товары группы.
 *
 * Ozon-only товары без imtId не трогает — привязываются руками.
 */
async function syncModels(prisma, wbCards) {
  // Собираем imtId → nmID из карточек
  const imtGroups = new Map(); // imtId → { nmIDs: Set, name: string, category: string }
  for (const card of wbCards) {
    const imtId = card.imtID ?? card.imt_id;
    if (!imtId) continue;
    if (!imtGroups.has(imtId)) {
      imtGroups.set(imtId, { nmIDs: new Set(), name: card.imt_name || "", category: resolveCategory(card) });
    }
    const g = imtGroups.get(imtId);
    g.nmIDs.add(card.nmID);
  }

  if (imtGroups.size === 0) {
    log.line("  No imtId groups found in WB cards");
    return { created: 0, assigned: 0 };
  }

  let created = 0;
  let assigned = 0;

  for (const [imtId, group] of imtGroups) {
    const bigIntId = BigInt(imtId);

    // Ищем существующую модель по imtId
    let model = await prisma.model.findFirst({ where: { imtId: bigIntId } });

    if (!model) {
      // Генерируем имя модели: первое слово из imt_name, fallback на "Модель {imtId}"
      const modelName = group.name || `Модель ${imtId}`;
      const slug = `model-wb-${imtId}`;
      model = await prisma.model.create({
        data: {
          id: slug,
          name: modelName,
          slug,
          category: group.category || "crossbody",
          description: "",
          imtId: bigIntId,
        },
      });
      created++;
      log.line(`  Created model: ${model.id} (${modelName})`);
    }

    // Привязываем неархивные товары к модели
    for (const nmId of group.nmIDs) {
      const product = await prisma.product.findFirst({ where: { wbArticle: nmId, archivedAt: null } });
      if (product && product.modelId !== model.id) {
        await prisma.product.update({
          where: { id: product.id },
          data: { modelId: model.id },
        });
        assigned++;
        log.line(`  Assigned ${product.id} → ${model.id}`);
      }
    }
  }

  return { created, assigned };
}

/**
 * Архивирует товары, которых нет ни в WB (активных или trash),
 * ни в Ozon (любой видимости).
 *
 * @param {boolean} ozonChecked — true если Ozon API опрашивался (иначе Ozon-товары не трогаем)
 */
async function archiveGoneProducts(prisma, dbProducts, wbArticles, ozonArticles, trashArticles, wbChecked = true, ozonChecked = true) {
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

    // Если маркетплейс не опрашивался — товары с его артикулом не трогаем
    if (!ozonChecked && ozonArt) continue;
    if (!wbChecked && wbArt) continue;

    const onWb = wbChecked && wbArt && wbSet.has(wbArt);
    const onOzon = ozonChecked && ozonArt && ozonSet.has(ozonArt);
    const inWbTrash = wbArt && trashSet.has(wbArt);

    if (onWb || onOzon) {
      // Товар найден на маркетплейсе — снимаем архив если был
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

    // Не найден ни на одном маркетплейсе → архивируем
    if (!flags.dry) {
      await prisma.product.update({
        where: { id: db.id },
        data: { archivedAt: new Date(), inStock: false },
      });
    }
    archived++;
    const reason = inWbTrash ? 'WB trash' : 'not on marketplace';
    log.line(`  Archived (${reason}): ${db.id} article=${wbArt || ozonArt} ${db.name}`);
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
      ozonCreated: 0,
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
      const wbPricesResult = await wbFetchPrices(wbApiKey, wbArticles);
      let wbPriceMap = wbPricesResult.priceMap;
      stats.errors += wbPricesResult.errors;

      // Fallback: если Pricing API вернул менее 80% цен — используем публичное search API
      if (wbPriceMap.size < wbArticles.length * 0.8) {
        log.line(`  Pricing API returned only ${wbPriceMap.size}/${wbArticles.length} prices, trying search API fallback...`);
        const publicPrices = await wbFetchPublicPrices(wbArticles);
        for (const [nmId, priceData] of publicPrices) {
          wbPriceMap.set(nmId, priceData);
        }
        log.line(`  Total prices after fallback: ${wbPriceMap.size}/${wbArticles.length}`);
      }

      // ─── Определяем inStock из search API ───
      // search API возвращает stock.qty для товаров в выдаче.
      // stock=0 → нет в наличии, stock>0 → в наличии, undefined → нет данных (не в выдаче)
      for (const [nmId, priceData] of wbPriceMap) {
        const db = existing.byWbArticle.get(nmId);
        const inTrash = trashArticles.includes(nmId);
        let newInStock;

        if (inTrash) {
          // В корзине — нет в наличии
          newInStock = false;
        } else if (priceData?.stock !== undefined && priceData?.stock !== null) {
          // search API дал точный сток
          newInStock = priceData.stock > 0;
        } else if (priceData?.discountedPrice != null) {
          // В search API с ценой но без stock — считаем в наличии
          newInStock = true;
        } else {
          // Нет данных from search API — не трогаем
          continue;
        }

        if (db && newInStock !== db.inStock) {
          await updateProduct(prisma, db.id, { inStock: newInStock });
          db.inStock = newInStock; // refresh snapshot для следующих фаз
        }
      }

      // ─── Строим индекс vendorCode → nmID для matching по sku ───
      const wbVendorToNm = new Map();
      for (const card of wbCards) {
        const vc = card.vendorCode?.trim();
        if (vc) wbVendorToNm.set(vc, card.nmID);
      }

      // ─── Process WB cards ───
      log.line("Processing WB cards...");
      for (const card of wbCards) {
        const article = card.nmID;
        const vendorCode = (card.vendorCode || "").trim();

        // Match by sku first, then by wbArticle
        let db = vendorCode ? existing.bySku.get(vendorCode) : null;
        if (!db) db = existing.byWbArticle.get(article);

        const wbPrices = wbPriceMap.get(article) || null;
        const wbRating = card.rating != null ? { rating: card.rating, feedbacks: card.feedbacks ?? 0 } : null;

        if (db) {
          // Update existing — ensure wbArticle is set
          const ensureFields = {};
          if (article && !db.wbArticle) ensureFields.wbArticle = BigInt(article);

          const updates = mergeProductSources(card, wbPrices, wbRating, null, null, null, db);
          const allUpdates = { ...ensureFields, ...updates };
          if (Object.keys(allUpdates).length > 0) {
            const ok = await updateProduct(prisma, db.id, allUpdates);
            if (ok) stats.wbUpdated++;
          }
        } else {
          // Create new
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

        // Match by sku first, then by ozonArticle
        let db = offerId ? existing.bySku.get(offerId) : null;
        if (!db) db = existing.byOzonArticle.get(productId);

        if (!info) continue;

        if (db) {
          // Update existing — ensure ozonArticle is set
          const ensureFields = {};
          if (productId && !db.ozonArticle) ensureFields.ozonArticle = BigInt(productId);

          const updates = mergeProductSources(null, null, null, info, attrs, rating, db);
          const allUpdates = { ...ensureFields, ...updates };
          if (Object.keys(allUpdates).length > 0) {
            const ok = await updateProduct(prisma, db.id, allUpdates);
            if (ok) stats.ozonUpdated++;
          }

          // ─── inStock из Ozon стоков (только для товаров без WB) ───
          // Для товаров с WB статьёй inStock уже обновлён из WB search API выше.
          if (!db.wbArticle && info.stocks?.stocks) {
            const ozonInStock = info.stocks.stocks.some(
              (s) => (s.present || 0) - (s.reserved || 0) > 0
            );
            if (ozonInStock !== db.inStock) {
              await updateProduct(prisma, db.id, { inStock: ozonInStock });
              stats.ozonUpdated++;
            }
          }
        } else {
          // New product from Ozon (no WB card)
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
            ozonArticle: productId,
            photoCount: info.images?.length || 1,
            colorName: ozonExtractColor(info, attrs),
            composition: ozonComp,
            rating: rating?.rating ?? null,
            inStock: info.stocks?.stocks?.some((s) => (s.present || 0) - (s.reserved || 0) > 0) ?? true,
            nameAutoGenerated: true,
            descAutoGenerated: true,
          });
          log.line(`  Created (Ozon): ${id} sku=${offerId} article=${productId}`);
          stats.ozonCreated++;
        }
      }

      log.line(`  Ozon: ${stats.ozonUpdated} updated\n`);

      // ─── Ozon Model Sync (attribute 9048) ───
      const ozonModelResult = await syncOzonModels(prisma, attrMap);
      if (ozonModelResult.created > 0 || ozonModelResult.assigned > 0) {
        log.line(`  Ozon models: ${ozonModelResult.created} created, ${ozonModelResult.assigned} assigned`);
      }
    }

    // ═══════════════════════════════════════════
    // PHASE 3: Sync Models (WB imtId → Model)
    // ═══════════════════════════════════════════

    if (!flags.ozonOnly && wbCards.length > 0) {
      log.line("Syncing models from WB imtId...");
      const modelResult = await syncModels(prisma, wbCards);
      log.line(`  WB models: ${modelResult.created} created, ${modelResult.assigned} assigned\n`);
    }

    // ═══════════════════════════════════════════
    // PHASE 4: Archive & Restock
    // ═══════════════════════════════════════════

    log.line("Archiving removed products...");
    const archiveResult = await archiveGoneProducts(
      prisma,
      existing.all,
      wbArticles,
      ozonArticles,
      trashArticles,
      !flags.ozonOnly, // wbChecked — true если WB фаза запускалась
      !flags.wbOnly,   // ozonChecked — true если Ozon фаза запускалась
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
    log.line(`  Ozon created:    ${stats.ozonCreated}`);
    log.line(`  Ozon updated:    ${stats.ozonUpdated}`);
    log.line(`  Archived:        ${stats.archived}`);
    log.line(`  Out of stock:    ${stats.outOfStock}`);
    log.line(`  Errors:          ${stats.errors}`);
    log.line(`  Duration:        ${duration}s}`);
    log.line(`  Mode:            ${flags.dry ? "DRY" : "live"}`);

    // JSON summary for wrapper scripts (last line)
    const summary = {
      created: stats.wbCreated + stats.ozonCreated,
      updated: stats.wbUpdated + stats.ozonUpdated,
      archived: stats.archived,
      outOfStock: stats.outOfStock,
      errors: stats.errors,
      total: stats.wbCreated + stats.ozonCreated + stats.wbUpdated + stats.ozonUpdated,
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
