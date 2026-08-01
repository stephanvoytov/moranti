/* =============================================
   Moranti — Server-side TTL cache (stale-while-revalidate)
   In-memory кеш для данных из Postgres.

   Два окна жизни записи:
   - «свежее» окно (ttl): отдаём мгновенно, без обращений к БД;
   - SWR-окно (staleTtl): отдаём устаревшие данные мгновенно
     и запускаем фоновую перезагрузку — страница не ждёт БД,
     а данные обновляются в фоне.

   Кеширует не только результат, но и in-flight промис,
   чтобы N одновременных запросов к БД = 1 реальный запрос.
   ============================================= */

interface CacheEntry<T> {
  data: T;
  /** Конец «свежего» окна — после него данные считаются stale */
  expiry: number;
  /** Конец SWR-окна — после него stale больше не отдаётся */
  staleUntil: number;
}

const store = new Map<string, CacheEntry<unknown>>();
const pending = new Map<string, Promise<unknown>>();

/** Свежее окно по умолчанию */
const DEFAULT_TTL = 30_000; // 30 s
/** SWR-окно по умолчанию: сколько ещё отдавать stale, пока грузится свежее */
const DEFAULT_STALE_TTL = 600_000; // 10 min

export function cacheGet<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = DEFAULT_TTL,
  staleTtl: number = DEFAULT_STALE_TTL,
): Promise<T> {
  const now = Date.now();
  const existing = store.get(key);

  if (existing) {
    // ——— Свежие данные — мгновенный ответ, БД не трогаем ———
    if (existing.expiry > now) {
      return Promise.resolve(existing.data as T);
    }
    // ——— Stale, но в SWR-окне — отдаём мгновенно + фоновая перезагрузка ———
    if (existing.staleUntil > now) {
      refreshInBackground(key, fetcher, ttl, staleTtl);
      return Promise.resolve(existing.data as T);
    }
  }

  // ——— Нет данных (или SWR-окно истекло) — ждём реальный запрос ———
  const inFlight = pending.get(key);
  if (inFlight) return inFlight as Promise<T>;

  const promise = fetcher()
    .then((data) => {
      const now2 = Date.now();
      store.set(key, { data, expiry: now2 + ttl, staleUntil: now2 + ttl + staleTtl });
      pending.delete(key);
      return data;
    })
    .catch((err) => {
      pending.delete(key);
      throw err;
    });

  pending.set(key, promise);
  return promise;
}

/**
 * Фоновая перезагрузка stale-данных.
 * Не блокирует ответ страницы; при ошибке молча остаёмся на stale —
 * следующая попытка будет при следующем обращении к ключу.
 */
function refreshInBackground<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number,
  staleTtl: number,
): void {
  if (pending.has(key)) return; // уже обновляется

  const promise = fetcher()
    .then((data) => {
      const now = Date.now();
      store.set(key, { data, expiry: now + ttl, staleUntil: now + ttl + staleTtl });
    })
    .catch(() => {
      // Ошибка фона: данные остаются stale до конца SWR-окна
    })
    .finally(() => {
      pending.delete(key);
    });

  pending.set(key, promise);
}

export function invalidateCache(key?: string): void {
  if (key) {
    store.delete(key);
    pending.delete(key);
  } else {
    store.clear();
    pending.clear();
  }
}
