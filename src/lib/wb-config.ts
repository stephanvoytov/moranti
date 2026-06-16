/* =============================================
   WB API Config & Types
   =============================================
   Когда появится API-ключ от Wildberries:
   1. Создать .env.local с WB_API_KEY=ваш_ключ
   2. Раскомментировать официальные эндпоинты
   3. Готово — цены полетят через официальное API
   ============================================= */

/**
 * WB_API_KEY берётся из process.env.
 * Пока ключа нет — используем статические данные.
 */
export function getWbApiKey(): string | undefined {
  if (typeof process === "undefined") return undefined;
  return process.env.WB_API_KEY;
}

/** Базовый URL Content API Wildberries (для продавцов) */
export const WB_CONTENT_API = "https://content-api.wildberries.ru";

/**
 * Эндпоинты официального API WB:
 *
 * 1. Список карточек товаров продавца (с ценами):
 *    POST /content/v2/get/cards/list
 *    Headers: { Authorization: WB_API_KEY }
 *    Body: { "settings": { "cursor": { "limit": 100 } } }
 *
 * 2. Цены конкретных товаров (по nmId):
 *    POST /content/v1/cards/cursor/list/{nmId}
 *
 * Пока ключа нет — используем статику из products.ts.
 * Когда появится ключ — переключаем вызов здесь.
 */

export interface WbPriceResult {
  article: number;
  price: number;
  originalPrice: number | null;
}
