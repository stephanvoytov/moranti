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
export async function getWbApiKey(): Promise<string | undefined> {
  // Сначала проверяем настройки (редактируется через админку)
  try {
    const settings = await readSettings();
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

/** Базовый URL Content API Wildberries (для карточек товаров) */
export const WB_CONTENT_API = "https://content-api.wildberries.ru";

/** Базовый URL API цен и скидок Wildberries */
export const WB_PRICING_API = "https://discounts-prices-api.wildberries.ru";

/**
 * Эндпоинты официального API WB для цен:
 *
 * ─── Получение цен ───
 * GET /api/v2/list/goods/filter?limit=1000
 * Base: discounts-prices-api.wildberries.ru
 * Auth: { Authorization: WB_API_KEY }
 * Описание: возвращает цены, скидки, скидки WB Клуба для всех товаров.
 * Лимит: один filterNmID за раз. Чтобы получить все — limit=1000 без фильтра.
 *
 * ─── Используется в проекте ───
 * Сервис: src/lib/wb-prices.ts
 * Кэш: in-memory (Map) + файл data/wb-prices-cache.json (переживает рестарт)
 * Без ключа: статика из products.json (graceful degradation)
 */

export interface WbPriceResult {
  article: number;
  price: number | null;
  originalPrice: number | null;
}
