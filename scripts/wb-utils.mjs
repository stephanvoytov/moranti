/**
 * wb-utils.mjs — Общие утилиты для работы с WB API.
 *
 * Все скрипты, работающие с WB, используют эти утилиты
 * вместо дублирования кода.
 *
 * Экспорты:
 *   CDN_HOSTS         — 8 CDN-хостов WB (для card.json и изображений)
 *   SUPPLIER_ID       — ID поставщика Moranti (312222)
 *   FETCH_TIMEOUT     — таймаут fetch (15000ms)
 *   getVolPart()      — vol/part из артикула
 *   sleep()           — задержка Promise
 *   randomHeaders()   — User-Agent + _wbauid cookie
 *   fetchWithRetry()  — fetch с повторным запросом при 429
 *   fetchCardJson()   — запрос card.json с CDN
 *   cardCdnUrl()      — URL изображения товара на CDN
 *   cardCdnUrls()     — массив URL изображений (1..count)
 */

/* =============================================
   Константы
   ============================================= */

/** CDN-хосты WB в порядке приоритета (пробуем первый, падаем на следующий). */
export const CDN_HOSTS = [
  "https://kgd-basket-cdn-01bl.geobasket.ru",
  "https://basket-01.wbbasket.ru",
  "https://basket-02.wbbasket.ru",
  "https://basket-05.wbbasket.ru",
  "https://basket-08.wbbasket.ru",
  "https://basket-10.wbbasket.ru",
  "https://basket-12.wbbasket.ru",
  "https://basket-15.wbbasket.ru",
];

/** ID поставщика Moranti на Wildberries. */
export const SUPPLIER_ID = 312222;

/** Таймаут HTTP-запроса (мс). */
export const FETCH_TIMEOUT = 15000;

/** User-Agent'ы для ротации (чтобы не получить 429). */
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/125",
  "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/120",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) AppleWebKit/605.1.15",
];

/* =============================================
   Утилиты
   ============================================= */

/**
 * Вычисляет vol/part для CDN-URL по артикулу товара.
 * @param {number} article — артикул WB
 * @returns {{ vol: number, part: number }}
 */
export function getVolPart(article) {
  return {
    vol: Math.floor(article / 100000),
    part: Math.floor(article / 1000),
  };
}

/**
 * Promise-задержка.
 * @param {number} ms — миллисекунды
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Генерирует случайные заголовки HTTP для обхода 429.
 * Ротирует User-Agent и генерирует случайный _wbauid.
 * @returns {Record<string, string>}
 */
export function randomHeaders() {
  const wbauid = "96" + String(Math.floor(Math.random() * 1e15)).padStart(15, "0");
  return {
    "User-Agent": USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
    Accept: "*/*",
    "Accept-Language": "ru,en;q=0.9",
    Cookie: "_wbauid=" + wbauid + "; _cp=1",
  };
}

/**
 * Fetch с ретраем при 429 (exponential backoff).
 * @param {string} url
 * @param {number} [retries=3] — количество попыток
 * @returns {Promise<Response|null>} — Response или null если все попытки исчерпаны
 */
export async function fetchWithRetry(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const r = await fetch(url, {
      headers: randomHeaders(),
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
    });
    if (r.ok) return r;
    if (r.status === 429) {
      const wait = attempt * 5000;
      console.log("  429, retry in " + (wait / 1000) + "s...");
      await sleep(wait);
      continue;
    }
    throw new Error("HTTP " + r.status + " — " + url);
  }
  return null;
}

/**
 * Загружает card.json с CDN WB (без токена).
 * Пробует CDN-хосты по порядку, возвращает null если ни один не ответил.
 *
 * @param {number} article — артикул WB
 * @returns {Promise<object|null>}
 */
export async function fetchCardJson(article) {
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
      // пробуем следующий хост
    }
  }
  return null;
}

/**
 * Загружает card.json для нескольких артикулов параллельно (батчами).
 *
 * @param {number[]} articles — массив артикулов WB
 * @param {object} [opts]
 * @param {number} [opts.concurrency=3] — сколько запросов параллельно
 * @param {(fetched: number, total: number, article: number) => void} [opts.onProgress]
 * @returns {Promise<Map<number, object>>} — article → card.json data
 */
export async function batchFetchCardJson(articles, opts = {}) {
  const { concurrency = 3, onProgress } = opts;
  const results = new Map();
  let fetched = 0;
  const total = articles.length;

  for (let i = 0; i < total; i += concurrency) {
    const chunk = articles.slice(i, i + concurrency);
    const promises = chunk.map(async (article) => {
      const card = await fetchCardJson(article);
      return { article, card };
    });

    const chunkResults = await Promise.all(promises);
    for (const { article, card } of chunkResults) {
      if (card) results.set(article, card);
      fetched++;
      if (onProgress) onProgress(fetched, total, article);
    }

    if (i + concurrency < total) await sleep(200);
  }

  return results;
}

/**
 * Формирует URL изображения товара на CDN WB.
 *
 * @param {number} article — артикул WB
 * @param {number} index — номер фото (1-based)
 * @param {string} [size="c516x688"] — размер (c246x328, c516x688, big)
 * @returns {string}
 */
export function cardCdnUrl(article, index, size = "c516x688") {
  const { vol, part } = getVolPart(article);
  return (
    "https://kgd-basket-cdn-01bl.geobasket.ru/vol" +
    vol +
    "/part" +
    part +
    "/" +
    article +
    "/images/" +
    size +
    "/" +
    index +
    ".webp"
  );
}

/**
 * Формирует массив URL изображений товара.
 *
 * @param {number} article — артикул WB
 * @param {number} count — количество фото (макс 30)
 * @param {string} [size="c516x688"]
 * @returns {string[]}
 */
export function cardCdnUrls(article, count, size = "c516x688") {
  const urls = [];
  for (let i = 1; i <= count && i <= 30; i++) {
    urls.push(cardCdnUrl(article, i, size));
  }
  return urls;
}

/* =============================================
   Парсинг дат WB
   ============================================= */

/**
 * Парсит дату WB: ISO-строка ("2024-08-15T14:05:36Z")
 * или Unix timestamp в секундах (число или строка).
 *
 * @param {string|number|null|undefined} val
 * @returns {Date|null}
 */
export function parseWbDate(val) {
  if (!val) return null;
  if (typeof val === "number") return new Date(val * 1000);
  if (typeof val === "string") {
    if (val.includes("T") || val.includes("-")) {
      return new Date(val);
    }
    return new Date(Number(val) * 1000);
  }
  return null;
}
