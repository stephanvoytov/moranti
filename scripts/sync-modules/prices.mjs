/**
 * prices.mjs — WB Prices & Discounts API (официальные цены) через SDK.
 *
 * Использует daytona-wildberries-typescript-sdk:
 *   sdk.products.getGoodsFilter() → GET /api/v2/list/goods/filter
 *
 * SDK обеспечивает:
 *   - Rate limiting (100 req/min, per-endpoint)
 *   - Retry с exponential backoff на 429/5xx
 *   - Typed errors (RateLimitError, AuthenticationError, NetworkError, etc.)
 *
 * Цены приходят в копейках → функция делит на 100.
 * Стоков этот API не возвращает (stock всегда null).
 *
 * Требует токен категории «Цены и скидки» (WB_PRICES_API_KEY).
 *
 * @module sync-modules/prices
 */

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { WildberriesSDK } = require("daytona-wildberries-typescript-sdk");

const FETCH_TIMEOUT = 30000;

/** Логгер по умолчанию — тихий, для тестов. */
const noopLog = {
  write: () => {},
  line: () => {},
  progress: () => {},
  detail: () => {},
};

/**
 * Получение цен через Wildberries SDK (обёртка над discounts-prices-api).
 *
 * @param {string}  apiKey — токен категории «Цены и скидки»
 * @param {object}  log    — логгер (опционально, по умолчанию noop)
 * @returns {Promise<Map<number, {price: number, discountedPrice: number}>>}
 */
export async function wbFetchOfficialPrices(apiKey, log = noopLog) {
  if (!apiKey) return new Map();

  const sdk = new WildberriesSDK({
    apiKey,
    timeout: FETCH_TIMEOUT,
  });

  const priceMap = new Map();

  log.write("  Fetching WB official prices (via SDK)...");

  try {
    let offset = 0;
    const LIMIT = 1000;

    while (true) {
      const response = await sdk.products.getGoodsFilter({
        limit: LIMIT,
        offset,
      });

      const goods = response?.data?.listGoods || [];

      if (goods.length === 0) break; // пагинация завершена

      for (const g of goods) {
        const size = g.sizes?.[0];
        if (size?.price != null) {
          priceMap.set(g.nmID, {
            price: size.price / 100,
            discountedPrice: size.discountedPrice / 100,
          });
        }
      }

      log.write(` ${priceMap.size}`);

      if (goods.length < LIMIT) break; // последняя страница
      offset += LIMIT;
    }

    log.line(` — ${priceMap.size} products via SDK`);
  } catch (err) {
    log.line(`\n  SDK prices API error: ${err.message}`);
  }

  return priceMap;
}
