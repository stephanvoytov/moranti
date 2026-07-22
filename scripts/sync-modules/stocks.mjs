/**
 * stocks.mjs — WB Analytics API (остатки/стоки) через SDK.
 *
 * Использует daytona-wildberries-typescript-sdk:
 *   sdk.analytics.createProductsProduct() → POST /api/v3/analytics/stocks/product
 *
 * Возвращает stockCount (общий остаток на всех складах) для каждого nmID.
 * Данные обновляются раз в 30 минут.
 *
 * Требует токен категории «Аналитика» (WB_ANALYTICS_API_KEY).
 *
 * @module sync-modules/stocks
 */

import { WildberriesSDK } from "daytona-wildberries-typescript-sdk";

const FETCH_TIMEOUT = 30000;
const BATCH_SIZE = 1000;

/** Логгер по умолчанию — тихий, для тестов. */
const noopLog = {
  write: () => {},
  line: () => {},
  progress: () => {},
  detail: () => {},
};

/**
 * Получение стоков через Wildberries SDK.
 *
 * @param {number[]} nmIDs — массив артикулов WB
 * @param {string}  apiKey — токен категории «Аналитика»
 * @param {object}  log    — логгер (опционально, по умолчанию noop)
 * @returns {Promise<Map<number, number>>} nmID → stockCount
 */
export async function wbFetchStocks(nmIDs, apiKey, log = noopLog) {
  if (!nmIDs || nmIDs.length === 0 || !apiKey) return new Map();

  const sdk = new WildberriesSDK({
    apiKey,
    timeout: FETCH_TIMEOUT,
  });

  const stockMap = new Map();
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const periodStart = thirtyDaysAgo.toISOString().split("T")[0];
  const periodEnd = now.toISOString().split("T")[0];

  log.write(`  Fetching WB stocks (via SDK) for ${nmIDs.length} cards:`);

  try {
    let offset = 0;

    while (offset < nmIDs.length) {
      const chunk = nmIDs.slice(offset, offset + BATCH_SIZE);

      const response = await sdk.analytics.createProductsProduct({
        nmIDs: chunk,
        currentPeriod: { start: periodStart, end: periodEnd },
        stockType: "",
        skipDeletedNm: true,
        availabilityFilters: [],
        orderBy: { field: "stockCount", mode: "desc" },
        limit: BATCH_SIZE,
        offset: 0,
      });

      const items = response?.data?.items || [];

      for (const item of items) {
        if (item.nmID && item.metrics?.stockCount != null) {
          stockMap.set(item.nmID, item.metrics.stockCount);
        }
      }

      log.write(` ${stockMap.size}`);

      offset += BATCH_SIZE;
    }

    log.line(` — ${stockMap.size} products`);
  } catch (err) {
    log.line(`\n  SDK stocks API error: ${err.message}`);
  }

  return stockMap;
}
