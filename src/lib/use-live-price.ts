"use client";

import { useState, useEffect, useRef } from "react";

/* ==========================================================
   Module-level кэш — живёт всю сессию, общий для всех карточек
   ========================================================== */

interface PriceEntry {
  price: number | null;
  originalPrice: number | null;
  timestamp: number; // когда получен (Date.now())
}

const priceCache = new Map<number, PriceEntry>();
const inflight = new Map<string, Promise<void>>();

/** 5 минут — цены в кэше считаются свежими */
const CACHE_TTL = 5 * 60 * 1000;

function isFresh(entry: PriceEntry): boolean {
  return Date.now() - entry.timestamp < CACHE_TTL;
}

/* ==========================================================
   Batch scheduler — собирает артикулы за 80мс и делает
   ОДИН запрос к /api/prices. Повторные вызовы в окне 80мс
   не создают новых запросов (dedup).
   ========================================================== */

let batchQueue: number[] = [];
let batchTimer: ReturnType<typeof setTimeout> | null = null;
let batchResolve: ((map: Map<number, PriceEntry>) => void) | null = null;
let batchPromise: Promise<Map<number, PriceEntry>> | null = null;

function scheduleBatch(article: number): Promise<Map<number, PriceEntry>> {
  if (!batchPromise) {
    batchQueue = [];
    batchPromise = new Promise((resolve) => {
      batchResolve = resolve;
    });

    batchTimer = setTimeout(async () => {
      const articles = [...batchQueue];
      batchQueue = [];
      batchPromise = null;
      batchTimer = null;

      const cacheKey = articles.sort().join(",");

      // Dedup: если точно такой же набор уже летит — не дублируем
      if (inflight.has(cacheKey)) {
        await inflight.get(cacheKey);
        const map = new Map<number, PriceEntry>();
        for (const a of articles) {
          const e = priceCache.get(a);
          if (e) map.set(a, e);
        }
        batchResolve?.(map);
        batchResolve = null;
        return;
      }

      const fetchPromise = (async () => {
        try {
          const res = await fetch(`/api/prices?articles=${articles.join(",")}`, {
            signal: AbortSignal.timeout(10000),
            headers: { Accept: "application/json" },
          });

          if (!res.ok) {
            batchResolve?.(new Map());
            return;
          }

          const data = await res.json();
          const now = Date.now();
          const map = new Map<number, PriceEntry>();

          if (data.articles) {
            for (const a of data.articles) {
              const entry: PriceEntry = {
                price: a.price ?? null,
                originalPrice: a.originalPrice ?? null,
                timestamp: now,
              };
              priceCache.set(a.article, entry);
              map.set(a.article, entry);
            }
          }

          batchResolve?.(map);
        } catch {
          batchResolve?.(new Map());
        }
      })();

      inflight.set(cacheKey, fetchPromise);
      await fetchPromise;
      inflight.delete(cacheKey);
    }, 80);
  }

  batchQueue.push(article);
  return batchPromise;
}

/* ==========================================================
   Stale-while-revalidate:
   1. Если в кэше И свежее 5 мин → сразу отдаём, запроса нет
   2. Если в кэше И старше 5 мин → отдаём сразу, в фоне обновляем
   3. Если нет в кэше → ждём батч-запрос
   ========================================================== */

interface LivePriceResult {
  livePrice: number | null;
  liveOriginal: number | null;
  loading: boolean;
}

export function useLivePrice(article: number): LivePriceResult {
  const [result, setResult] = useState<LivePriceResult>(() => {
    const cached = priceCache.get(article);
    if (cached) {
      return {
        livePrice: cached.price,
        liveOriginal: cached.originalPrice,
        loading: !isFresh(cached),
      };
    }
    return { livePrice: null, liveOriginal: null, loading: true };
  });
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    const cached = priceCache.get(article);

    // Случай 1: свежий кэш — ничего не делаем
    if (cached && isFresh(cached)) {
      return;
    }

    // Случай 2: устаревший кэш — revalidate в фоне
    if (cached) {
      scheduleBatch(article).then((batchMap) => {
        if (!mounted.current) return;
        const entry = batchMap.get(article) ?? priceCache.get(article);
        if (entry && entry.timestamp > cached.timestamp) {
          setResult({
            livePrice: entry.price,
            liveOriginal: entry.originalPrice,
            loading: false,
          });
        } else {
          setResult((prev) => ({ ...prev, loading: false }));
        }
      });
      return;
    }

    // Случай 3: нет в кэше — ждём
    scheduleBatch(article).then((batchMap) => {
      if (!mounted.current) return;
      const entry = batchMap.get(article) ?? priceCache.get(article);
      if (entry) {
        setResult({
          livePrice: entry.price,
          liveOriginal: entry.originalPrice,
          loading: false,
        });
      } else {
        setResult((prev) => ({ ...prev, loading: false }));
      }
    });

    return () => {
      mounted.current = false;
    };
  }, [article]);

  return result;
}
