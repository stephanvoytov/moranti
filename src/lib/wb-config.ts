/* =============================================
   WB API Config & Types
   =============================================
   API-ключ можно задать:
   1. В админке → Настройки (хранится в settings.json)
   2. В .env.local (WB_API_KEY) — fallback
   ============================================= */

import { readSettings } from "./settings";

/**
 * WB_API_KEY берётся из настроек сайта или process.env.
 * Приоритет: settings.json > .env.local
 */
export function getWbApiKey(): string | undefined {
  // Сначала проверяем settings.json (редактируется через админку)
  try {
    const settings = readSettings();
    if (settings.wbApiKey) return settings.wbApiKey;
  } catch {
    // ignore
  }

  // Fallback на .env.local
  if (typeof process !== "undefined") {
    return process.env.WB_API_KEY;
  }

  return undefined;
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
