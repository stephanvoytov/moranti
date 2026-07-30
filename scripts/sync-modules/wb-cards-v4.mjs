/**
 * wb-cards-v4.mjs — Цены, стоки и рейтинг через card.wb.ru (публичный API).
 *
 * Использует card.wb.ru/cards/v4/detail — публичный endpoint WB:
 *   GET /cards/v4/detail?nm=id1;id2;id3&dest=-1257786&spp=30
 *
 * Возвращает ВСЁ в одном Map:
 *   - price.product      → текущая цена на сайте (копейки → рубли)
 *   - price.basic        → оригинальная цена (без скидки)
 *   - totalQuantity      → остаток на складах
 *   - rating             → звёздный рейтинг (1-5)
 *   - feedbacks          → количество отзывов
 *
 * Не требует API-ключа, кук, токенов.
 * Использует got-scraping для обхода TLS-фingerprint'инга WB.
 *
 * @module sync-modules/wb-cards-v4
 */

import { gotScraping } from "got-scraping";

const CARD_WB_HOST = "https://card.wb.ru";
const CARD_WB_PATH = "/cards/v4/detail";
const DEST = "-1257786";   // Moscow (регион для цен и остатков)
const SPP = 30;            // Уровень скидки (30 = стандартный)
const BATCH_SIZE = 15;     // Сколько nmId в одном запросе
const REQUEST_TIMEOUT = 15000;

/** Логгер по умолчанию — тихий, для тестов. */
const noopLog = {
  write: () => {},
  line: () => {},
  progress: () => {},
  detail: () => {},
};

/**
 * Преобразует копейки в рубли (целое число).
 * @param {number|null} kopecks
 * @returns {number|null}
 */
function toRub(kopecks) {
  return kopecks != null ? Math.round(kopecks / 100) : null;
}

/**
 * Разбивает массив на батчи указанного размера.
 * @param {number[]} arr
 * @param {number} size
 * @returns {number[][]}
 */
function batch(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

/**
 * Загружает цены, стоки и рейтинг через card.wb.ru (публичный API).
 * Заменяет собой wbFetchOfficialPrices + wbFetchStocks + wbFetchAnalytics.
 *
 * @param {string}  _apiKey — не используется (оставлено для совместимости)
 * @param {object}  log     — логгер (опционально, по умолчанию noop)
 * @param {number[]} nmIds  — массив nmId для запроса
 * @returns {Promise<Map<number, {price, discountedPrice, stock, rating, feedbacks}>>}
 */
export async function wbFetchCardsV4(_apiKey, log = noopLog, nmIds = []) {
  const cardMap = new Map();

  if (nmIds.length === 0) {
    log.line("  Нет nmId для запроса");
    return cardMap;
  }

  const batches = batch(nmIds, BATCH_SIZE);
  log.write(`  card.wb.ru (${batches.length} батчей)`);

  for (let i = 0; i < batches.length; i++) {
    const ids = batches[i];
    const url =
      `${CARD_WB_HOST}${CARD_WB_PATH}` +
      `?nm=${ids.join(";")}` +
      `&appType=1&curr=rub&dest=${DEST}&spp=${SPP}`;

    try {
      const response = await gotScraping({
        url,
        responseType: "json",
        timeout: { request: REQUEST_TIMEOUT },
        retry: { limit: 2 },
      });

      const data = response.body;
      const products = data?.products || [];

      for (const p of products) {
        const size = p.sizes?.[0];

        // Недоступные товары (архив, нет на WB) приходят с price.product=0.
        // Пропускаем их — в БД остаются старые цены, а archive-фаза архивирует.
        if (!size?.price?.product || size.price.product <= 0) continue;

        // Товар без стоков, но с ценой — временно нет в наличии.
        // Цену сохраняем, inStock выставится в 0 на стороне merge.
        cardMap.set(p.id, {
          price: toRub(size.price.product),         // текущая цена на сайте
          discountedPrice: toRub(size.price.basic), // оригинал без скидки
          stock: p.totalQuantity ?? 0,               // остаток (0 если нет)
          rating: p.rating,                          // звёздный рейтинг
          feedbacks: p.feedbacks ?? 0,               // количество отзывов
        });
      }

      log.write(` ${cardMap.size}`);
    } catch (err) {
      const status = err.response?.statusCode || "";
      const body = err.response?.body;
      const detail = typeof body === "string" ? body.slice(0, 100) : err.message;
      log.line(`\n  [${i + 1}/${batches.length}] ${status} ${detail}`);
    }
  }

  log.line(` — ${cardMap.size} товаров`);
  return cardMap;
}
