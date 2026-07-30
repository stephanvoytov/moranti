/**
 * stocks.mjs — остатки/стоки WB через полный отчёт Analytics API.
 *
 * Использует POST /api/v2/stocks-report/products/products БЕЗ фильтра по nmIDs,
 * чтобы получить данные по ВСЕМ товарам продавца за один запрос.
 *
 * Без nmIDs API возвращает полный отчёт по всем товарам — включая stockCount
 * (остатки на текущий день). Период 365 дней, чтобы захватить товары
 * с минимальной активностью.
 *
 * Не требует отдельного токена — работает с базовым JWT (WB_API_KEY).
 *
 * @module sync-modules/stocks
 */

const BASE_URL = "https://seller-analytics-api.wildberries.ru";
const FETCH_TIMEOUT = 30000;

/** Логгер по умолчанию — тихий, для тестов. */
const noopLog = {
  write: () => {},
  line: () => {},
  progress: () => {},
  detail: () => {},
};

/**
 * Получение стоков через полный отчёт Analytics API.
 *
 * @param {number[]} _nmIDs — игнорируется (используется полный отчёт)
 * @param {string}  apiKey — токен WB (любой с доступом к Analytics)
 * @param {object}  log    — логгер (опционально, по умолчанию noop)
 * @returns {Promise<Map<number, number|null>>} nmID → stockCount (null если нет в отчёте)
 */
export async function wbFetchStocks(_nmIDs, apiKey, log = noopLog) {
  if (!apiKey) return new Map();

  const stockMap = new Map();
  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const periodStart = ninetyDaysAgo.toISOString().split("T")[0];
  const periodEnd = now.toISOString().split("T")[0];

  log.write("  Fetching WB stocks (full report, 90d)...");

  try {
    const resp = await fetch(`${BASE_URL}/api/v2/stocks-report/products/products`, {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentPeriod: { start: periodStart, end: periodEnd },
        stockType: "",
        skipDeletedNm: true,
        availabilityFilters: [],
        orderBy: { field: "stockCount", mode: "desc" },
        limit: 1000,
        offset: 0,
      }),
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
    });

    if (resp.status === 429) {
      log.line(`\n  ⚠️ 429 Rate limit, ждём 30с и повторяем...`);
      await new Promise((r) => setTimeout(r, 30000));
      try {
        const retryResp = await fetch(`${BASE_URL}/api/v2/stocks-report/products/products`, {
          method: "POST",
          headers: { Authorization: apiKey, "Content-Type": "application/json" },
          body: JSON.stringify({
            currentPeriod: { start: periodStart, end: periodEnd },
            stockType: "",
            skipDeletedNm: true,
            availabilityFilters: [],
            orderBy: { field: "stockCount", mode: "desc" },
            limit: 1000,
            offset: 0,
          }),
          signal: AbortSignal.timeout(FETCH_TIMEOUT),
        });
        if (!retryResp.ok) {
          log.line(`\n  ⚠️ Retry тоже ${retryResp.status}, пропускаем стоки`);
          return stockMap;
        }
        const data = await retryResp.json();
        const items = data?.data?.items || [];
        for (const item of items) {
          if (item.nmID) stockMap.set(item.nmID, item.metrics?.stockCount ?? null);
        }
      } catch (retryErr) {
        log.line(`\n  ⚠️ Retry error: ${retryErr.message}, пропускаем стоки`);
        return stockMap;
      }
    } else if (resp.ok) {
      const data = await resp.json();
      const items = data?.data?.items || [];
      for (const item of items) {
        if (item.nmID) {
          stockMap.set(item.nmID, item.metrics?.stockCount ?? null);
        }
      }
    } else {
      const errText = await resp.text().catch(() => "");
      log.line(`\n  ⚠️ Stocks API ${resp.status}: ${errText.slice(0, 200)}`);
      return stockMap;
    }

    const inStock = [...stockMap.values()].filter((s) => s !== null && s > 0).length;
    const zeroStock = [...stockMap.values()].filter((s) => s !== null && s === 0).length;
    log.line(` — ${stockMap.size} товаров (со стоком: ${inStock}, без: ${zeroStock})`);
  } catch (err) {
    log.line(`\n  ⚠️ Stocks API error: ${err.message}`);
  }

  return stockMap;
}
