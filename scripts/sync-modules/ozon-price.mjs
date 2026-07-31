/**
 * ozon-price.mjs — получение реальных цен Ozon через headless браузер.
 *
 * Адаптировано из eduard256/ozon-mcp-server (parse.js + ozon.js) (MIT).
 * https://github.com/eduard256/ozon-mcp-server
 *
 * Использует headless Chromium для обхода Variti и composer-api для
 * получения цен (cardPrice, price, originalPrice) — тех самых,
 * которые видит покупатель на странице товара.
 *
 * Использование:
 *   import { getProductsPrices } from "./ozon-price.mjs";
 *   const prices = await getProductsPrices([1185261285, 123456789]);
 *   // prices = [{ sku: "1185261285", cardPrice: 10213, price: 18300, oldPrice: null }, ...]
 */

import { fetchJson, isEnabled, shutdown } from "./ozon-browser.mjs";

/**
 * Преобразует текстовую цену ("53 022 ₽") в число.
 * @param {string|number|null} text
 * @returns {number|null}
 */
function priceToNumber(text) {
  if (text == null) return null;
  const str = String(text);
  const digits = str.replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : null;
}

/**
 * Извлекает цены из JSON composer-api страницы товара.
 *
 * В widgetStates есть ключ вида "webPrice-{id}-default-1",
 * который содержит { cardPrice, price, originalPrice, ... }.
 *
 * @param {object} page — результат composer-api (распарсенный JSON)
 * @returns {{ cardPrice: number|null, price: number|null, oldPrice: number|null }}
 */
export function parsePrices(page) {
  const ws = page?.widgetStates || {};
  if (!ws || typeof ws !== "object") {
    return { cardPrice: null, price: null, oldPrice: null };
  }

  // Ищем widget с именем "webPrice" (часть до первого "-")
  const priceKey = Object.keys(ws).find((k) => String(k).split("-")[0] === "webPrice");
  if (!priceKey) {
    return { cardPrice: null, price: null, oldPrice: null };
  }

  let widget;
  try {
    widget = JSON.parse(ws[priceKey]);
  } catch {
    return { cardPrice: null, price: null, oldPrice: null };
  }

  return {
    cardPrice: priceToNumber(widget.cardPrice),
    price: priceToNumber(widget.price),
    oldPrice: priceToNumber(widget.originalPrice),
  };
}

/**
 * Извлекает SKU из URL страницы товара.
 * @param {string} url — URL со страницы composer-api
 * @returns {string|null}
 */
function skuFromUrl(url) {
  if (!url) return null;
  const m = String(url).match(/-(\d+)\/?(?:\?|$)/);
  return m ? m[1] : null;
}

/**
 * Получает цены для одного SKU Ozon.
 *
 * @param {string|number} sku — артикул Ozon (публичный SKU)
 * @returns {Promise<{ sku: string, cardPrice: number|null, price: number|null, oldPrice: number|null }>}
 */
export async function getProductPrice(sku) {
  const path = `/product/${sku}/`;

  // Основная страница товара — тут лежит webPrice
  const basePage = await fetchJson(path);
  const prices = parsePrices(basePage);

  return { sku: String(sku), ...prices };
}

/**
 * Получает цены для нескольких SKU Ozon.
 *
 * Последовательные запросы с задержкой 500мс, чтобы не нагружать Ozon.
 * При ошибке одного SKU остальные продолжаются.
 *
 * @param {Array<string|number>} skus — массив артикулов Ozon
 * @param {object} [opts]
 * @param {number} [opts.delayMs=500] — задержка между запросами
 * @returns {Promise<Array<{ sku: string, cardPrice: number|null, price: number|null, oldPrice: number|null }>>}
 */
export async function getProductsPrices(skus, { delayMs = 500 } = {}) {
  if (!isEnabled()) {
    console.error("[OzonPrice] Browser disabled — пропускаем получение цен");
    return [];
  }

  const results = [];
  let hasError = false;

  try {
    for (let i = 0; i < skus.length; i++) {
      const sku = skus[i];
      try {
        const result = await getProductPrice(sku);
        results.push(result);

        if (result.cardPrice != null) {
          console.error(
            `[OzonPrice] ${i + 1}/${skus.length} SKU ${sku}: cardPrice=${result.cardPrice} price=${result.price} oldPrice=${result.oldPrice}`
          );
        } else {
          console.error(`[OzonPrice] ${i + 1}/${skus.length} SKU ${sku}: нет цен (${result.price ?? "—"})`);
        }
      } catch (err) {
        hasError = true;
        console.error(`[OzonPrice] ${i + 1}/${skus.length} SKU ${sku}: ошибка — ${err.message}`);
        // Продолжаем со следующим
      }

      // Задержка между запросами (кроме последнего)
      if (i < skus.length - 1) {
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  } finally {
    // Гарантированно закрываем браузер — даже при исключении в цикле
    await shutdown();
  }

  if (hasError) {
    console.error(`[OzonPrice] Завершено с ошибками: ${results.length}/${skus.length} успешно`);
  } else {
    console.error(`[OzonPrice] Завершено: ${results.length}/${skus.length} товаров`);
  }

  return results;
}
