/**
 * ozon.mjs — Ozon Seller API через SDK (ozon-seller-sdk).
 *
 * Заменяет сырые fetch-вызовы в sync-all.mjs на типизированные методы SDK.
 *
 * Использование:
 *   import { ozonFetchAllProducts, ozonFetchProductInfo, ozonFetchProductAttributes } from "./sync-modules/ozon.mjs";
 */

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { OzonSellerApiClient } = require("ozon-seller-sdk");

const BATCH_SIZE = 100;
const REQUEST_DELAY = 100;

/**
 * Создаёт (или возвращает кешированный) клиент Ozon SDK.
 * @param {string} clientId
 * @param {string} apiKey
 * @returns {OzonSellerApiClient}
 */
let cachedClient = null;
let cachedClientId = null;
let cachedApiKey = null;

function getClient(clientId, apiKey) {
  if (cachedClient && cachedClientId === clientId && cachedApiKey === apiKey) {
    return cachedClient;
  }
  cachedClient = new OzonSellerApiClient({ clientId, apiKey });
  cachedClientId = clientId;
  cachedApiKey = apiKey;
  return cachedClient;
}

/**
 * Получить список всех товаров продавца на Ozon.
 * Соответствует POST /v3/product/list.
 *
 * @param {string} clientId
 * @param {string} apiKey
 * @param {object} log
 * @returns {Promise<Array<{offerId: string, productId: number, productSku: number}>>}
 */
export async function ozonFetchAllProducts(clientId, apiKey, log) {
  const api = getClient(clientId, apiKey);
  log.write("  Fetching Ozon product list:");
  let lastId = null;
  const allItems = [];

  while (true) {
    const body = { filter: { visibility: "ALL" }, limit: 1000 };
    if (lastId) body.last_id = lastId;
    const data = await api.product.getList(body);
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

/**
 * Получить детальную информацию о товарах по offer_id.
 * Соответствует POST /v3/product/info/list.
 *
 * @param {string} clientId
 * @param {string} apiKey
 * @param {string[]} offerIds
 * @param {object} log
 * @returns {Promise<Map<string, object>>} ключ — offer_id
 */
export async function ozonFetchProductInfo(clientId, apiKey, offerIds, log) {
  if (offerIds.length === 0) return new Map();
  const api = getClient(clientId, apiKey);
  const results = [];

  for (let i = 0; i < offerIds.length; i += BATCH_SIZE) {
    const chunk = offerIds.slice(i, i + BATCH_SIZE);
    const data = await api.product.getProductInfoListV3({
      offer_id: chunk,
      visibility: "ALL",
    });
    results.push(...(data.items || []));
    await new Promise((r) => setTimeout(r, REQUEST_DELAY));
  }

  const infoMap = new Map();
  for (const item of results) infoMap.set(String(item.offer_id), item);
  log.line(`  Info: ${infoMap.size} products`);
  return infoMap;
}

/**
 * Получить атрибуты товаров по offer_id.
 * Соответствует POST /v4/product/info/attributes.
 *
 * @param {string} clientId
 * @param {string} apiKey
 * @param {string[]} offerIds
 * @param {object} log
 * @returns {Promise<Map<string, object>>} ключ — offer_id
 */
export async function ozonFetchProductAttributes(clientId, apiKey, offerIds, log) {
  if (offerIds.length === 0) return new Map();
  const api = getClient(clientId, apiKey);
  const results = [];

  for (let i = 0; i < offerIds.length; i += BATCH_SIZE) {
    const chunk = offerIds.slice(i, i + BATCH_SIZE);
    const data = await api.product.getAttributes({
      filter: { offer_id: chunk },
      limit: BATCH_SIZE,
    });
    results.push(...(data.result || []));
    await new Promise((r) => setTimeout(r, REQUEST_DELAY));
  }

  const attrMap = new Map();
  for (const item of results) attrMap.set(String(item.offer_id), item);
  log.line(`  Attributes: ${attrMap.size} products`);
  return attrMap;
}
