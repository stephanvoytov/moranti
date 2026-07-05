/**
 * prices.mjs — WB Prices & Discounts API (официальные цены).
 *
 * Эндпоинт: GET /api/v2/list/goods/filter
 * Документация: https://dev.wildberries.ru/openapi/work-with-products#tag/Ceny-i-skidki
 *
 * Схема ответа: { data: { listGoods: [
 *   { nmID, vendorCode, sizes: [{ price, discountedPrice }], … }
 * ] } }
 *
 * Цены приходят в копейках → делим на 100.
 * Стоков этот API не возвращает.
 *
 * Требует токен категории «Цены и скидки» (WB_PRICES_API_KEY).
 * Rate limit: 10 запросов / 6 сек (персональный/сервисный).
 *
 * @module sync-modules/prices
 */

const WB_PRICES_API = "https://discounts-prices-api.wildberries.ru";
const FETCH_TIMEOUT = 30000;

/** Логгер по умолчанию — тихий, для тестов. */
const noopLog = {
  write: () => {},
  line: () => {},
  progress: () => {},
  detail: () => {},
};

/**
 * Получение цен через официальное API Wildberries (Цены и скидки).
 *
 * @param {string}  apiKey — токен категории «Цены и скидки»
 * @param {object}  log    — логгер (опционально, по умолчанию noop)
 * @returns {Promise<Map<number, {price: number, discountedPrice: number, stock: null}>>}
 */
export async function wbFetchOfficialPrices(apiKey, log = noopLog) {
  if (!apiKey) return new Map();
  const priceMap = new Map();

  log.write("  Fetching WB official prices (discounts-prices-api):");

  let offset = 0;
  const LIMIT = 1000;

  while (true) {
    const url = `${WB_PRICES_API}/api/v2/list/goods/filter?limit=${LIMIT}&offset=${offset}`;

    try {
      const resp = await fetch(url, {
        headers: { Authorization: apiKey },
        signal: AbortSignal.timeout(FETCH_TIMEOUT),
      });

      if (resp.status === 429) {
        log.write(" 429 (rate limit, waiting 1s)");
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }

      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        log.line(`\n  Official prices API ${resp.status}: ${text.slice(0, 200)}`);
        break;
      }

      const data = await resp.json();
      const goods = data?.data?.listGoods || [];

      if (goods.length === 0) break; // пагинация завершена

      for (const g of goods) {
        const size = g.sizes?.[0];
        if (size?.price != null) {
          priceMap.set(g.nmID, {
            price: size.price / 100,
            discountedPrice: size.discountedPrice / 100,
            stock: null, // из этого API нет стоков
          });
        }
      }

      log.write(` ${priceMap.size}`);

      if (goods.length < LIMIT) break; // последняя страница
      offset += LIMIT;
    } catch (err) {
      log.line(`\n  Official prices API error: ${err.message}`);
      break;
    }
  }

  log.line(` — ${priceMap.size} products from official prices API`);
  return priceMap;
}
