/* =============================================
   Moranti — WB Price Service (Server-side)
   =============================================
   Получение живых цен из Wildberries API.

   Эндпоинт: POST /api/v2/list/goods/filter
   Документация: https://dev.wildberries.ru/openapi/work-with-products
   Base URL: discounts-prices-api.wildberries.ru
   Auth: Authorization: <ключ>
   Лимит: 10 запросов / 6 сек на аккаунт (все методы категории цен)

   Схема:
   1. Есть ключ → POST с nmList запрошенных артикулов
   2. При 429 → exponential backoff (до 3 попыток)
   3. Кэш: in-memory (Map) + TTL 5 мин
   4. Нет ключа / ошибка → статика из Prisma (fallback JSON)
   ============================================= */

import { getWbApiKey } from "./wb-config";
import { getProducts } from "@/data/products";
import { logger } from "@/lib/logger";
import type { WbPriceResult } from "./wb-config";

/* =============================================
   Types
   ============================================= */

/** Размер товара из WB API */
interface WbSize {
  price: number;
  discountedPrice: number;
  clubDiscountedPrice?: number;
}

/** Товар из ответа POST /api/v2/list/goods/filter */
interface WbGoodsItem {
  nmID: number;
  vendorCode?: string;
  sizes?: WbSize[];
  currencyIsoCode4217?: string;
  editableSizePrice?: boolean;
}

/** Структура ответа WB API (POST) */
interface WbPostResponse {
  data?: {
    listGoods?: WbGoodsItem[];
  };
  error?: boolean;
  errorText?: string;
}

interface PriceSnapshotEntry {
  price: number;
  originalPrice: number;
}

/* =============================================
   Constants
   ============================================= */

const WB_PRICING_API = "https://discounts-prices-api.wildberries.ru";
const WB_LIST_GOODS_ENDPOINT = "/api/v2/list/goods/filter";

/** TTL in-memory кэша (5 минут) */
const CACHE_TTL_MS = 5 * 60 * 1000;

/** Максимум артикулов в одном POST-запросе */
const MAX_NM_PER_REQUEST = 100;

/** Таймаут запроса к WB API */
const FETCH_TIMEOUT_MS = 15_000;

/** Максимум retry при 429 */
const MAX_RETRIES = 3;

/* =============================================
   Module-level cache (in-memory)
   ============================================= */

let snapshot: Map<number, PriceSnapshotEntry> | null = null;
let snapshotTimestamp = 0;
let snapshotFetchInProgress: Promise<void> | null = null;

function isSnapshotFresh(): boolean {
  return snapshot !== null && Date.now() - snapshotTimestamp < CACHE_TTL_MS;
}

/* =============================================
   Static fallback from products
   ============================================= */

let staticSnapshot: Map<number, PriceSnapshotEntry> | null = null;

async function buildStaticSnapshot(): Promise<Map<number, PriceSnapshotEntry>> {
  if (staticSnapshot) return staticSnapshot;
  const all = await getProducts();
  const map = new Map<number, PriceSnapshotEntry>();
  for (const p of all) {
    if (p.wbArticle) {
      map.set(p.wbArticle, {
        price: p.price,
        originalPrice: p.originalPrice,
      });
    }
  }
  staticSnapshot = map;
  return map;
}

async function staticPricesFor(articles: number[]): Promise<WbPriceResult[]> {
  const all = await getProducts();
  return articles.map((article) => {
    const p = all.find((x) => x.wbArticle === article);
    return {
      article,
      price: p?.price ?? 0,
      originalPrice: p?.originalPrice ?? null,
    };
  });
}

/* =============================================
   WB API — POST с nmList
   ============================================= */

/**
 * Вычисляет среднюю цену по размерам.
 * Если у товара один размер — берёт его напрямую.
 * Если несколько размеров с раздельными ценами — среднее арифметическое.
 */
function extractPrices(sizes: WbSize[] | undefined, editable: boolean | undefined): { price: number; originalPrice: number } | null {
  if (!sizes || sizes.length === 0) return null;

  if (editable && sizes.length > 1) {
    const discounted = sizes.map((s) => s.discountedPrice).filter((p) => p > 0);
    const base = sizes.map((s) => s.price).filter((p) => p > 0);
    if (discounted.length === 0 || base.length === 0) return null;
    return {
      price: Math.round(discounted.reduce((a, b) => a + b, 0) / discounted.length),
      originalPrice: Math.round(base.reduce((a, b) => a + b, 0) / base.length),
    };
  }

  // Один размер — берём напрямую
  return {
    price: sizes[0].discountedPrice || sizes[0].price,
    originalPrice: sizes[0].price,
  };
}

/**
 * POST к WB API с nmList артикулов.
 * Возвращает Map<article, {price, originalPrice}>.
 */
async function fetchArticlesFromWbApi(
  apiKey: string,
  nmList: number[],
  attempt: number = 1,
): Promise<Map<number, PriceSnapshotEntry>> {
  const url = `${WB_PRICING_API}${WB_LIST_GOODS_ENDPOINT}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ nmList }),
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  // ── 429 Too Many Requests → retry с exponential backoff ──
  if (res.status === 429 && attempt <= MAX_RETRIES) {
    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10_000) + Math.random() * 1000;
    logger.warn("WB API 429 rate limited", { attempt, max: MAX_RETRIES, delayMs: Math.round(delay) });
    await new Promise((r) => setTimeout(r, delay));
    return fetchArticlesFromWbApi(apiKey, nmList, attempt + 1);
  }

  if (!res.ok) {
    throw new Error(`WB API responded with ${res.status}: ${res.statusText}`);
  }

  const json: WbPostResponse = await res.json();

  if (json.error) {
    throw new Error(`WB API error: ${json.errorText ?? "unknown"}`);
  }

  const goods = json.data?.listGoods;
  if (!goods || !Array.isArray(goods)) {
    throw new Error("WB API returned unexpected structure: missing data.listGoods");
  }

  const map = new Map<number, PriceSnapshotEntry>();
  for (const item of goods) {
    const nmID = item.nmID;
    if (!nmID) continue;
    const prices = extractPrices(item.sizes, item.editableSizePrice);
    if (prices) {
      map.set(nmID, prices);
    }
  }

  return map;
}

/**
 * Разбивает массив артикулов на батчи по MAX_NM_PER_REQUEST
 * и фетчит каждый батч через POST к WB API.
 */
async function fetchArticlesBatched(
  apiKey: string,
  articles: number[],
): Promise<Map<number, PriceSnapshotEntry>> {
  const result = new Map<number, PriceSnapshotEntry>();

  for (let i = 0; i < articles.length; i += MAX_NM_PER_REQUEST) {
    const batch = articles.slice(i, i + MAX_NM_PER_REQUEST);
    const batchResult = await fetchArticlesFromWbApi(apiKey, batch);
    for (const [key, val] of batchResult) {
      result.set(key, val);
    }

    // Небольшая пауза между батчами для соблюдения rate limit
    if (i + MAX_NM_PER_REQUEST < articles.length) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  return result;
}

/* =============================================
   Public API
   ============================================= */

/**
 * Возвращает цены для запрошенных артикулов.
 *
 * Приоритет:
 *   1. In-memory кэш (TTL 5 мин)
 *   2. WB API (POST с nmList запрошенных артикулов)
 *   3. Статика из Prisma/JSON
 */
export async function getWbPrices(articles: number[]): Promise<WbPriceResult[]> {
  if (articles.length === 0) return [];

  const apiKey = await getWbApiKey();

  if (!apiKey) {
    return staticPricesFor(articles);
  }

  // ── Инициализируем статический кэш при первом вызове ──
  if (staticSnapshot === null) {
    await buildStaticSnapshot();
  }

  // ── Определяем, какие артикулы нужно обновить ──
  const staleOrMissing = articles.filter((a) => {
    if (!snapshot) return true;
    const entry = snapshot.get(a);
    if (!entry) return true;
    return false; // есть в кэше — не обновляем (stale-while-revalidate на клиенте)
  });

  // ── Если всё есть в кэше — отвечаем сразу ──
  if (staleOrMissing.length === 0) {
    return articles.map((article) => {
      const entry = snapshot!.get(article)!;
      return { article, price: entry.price, originalPrice: entry.originalPrice };
    });
  }

  // ── Обновляем только те, что нужны ──
  try {
    const fresh = await fetchArticlesBatched(apiKey, staleOrMissing);

    // Вливаем свежие данные в общий кэш
    if (!snapshot) snapshot = new Map();
    for (const [key, val] of fresh) {
      snapshot.set(key, val);
    }
    snapshotTimestamp = Date.now();
  } catch (err) {
    logger.warn("WB API fetch failed, using cache/fallback", { error: err instanceof Error ? err.message : String(err) });
  }

  // ── Отвечаем (из кэша + fallback на статику) ──
  return articles.map((article) => {
    const entry = snapshot?.get(article);
    if (entry) {
      return { article, price: entry.price, originalPrice: entry.originalPrice };
    }
    // Fallback на статику для артикулов, которые не вернул WB API
    return { article, price: 0, originalPrice: null };
  });
}

/** Принудительный сброс кэша */
export function invalidateWbPriceCache(): void {
  snapshot = null;
  snapshotTimestamp = 0;
  staticSnapshot = null;
}
