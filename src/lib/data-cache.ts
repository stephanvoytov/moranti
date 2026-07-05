/* =============================================
   Moranti — Server-side TTL cache
   In-memory кеш для данных из Postgres.
   TTL = 5 минут.

   Кеширует не только результат, но и in-flight промис,
   чтобы N одновременных запросов к БД = 1 реальный запрос.
   ============================================= */

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const store = new Map<string, CacheEntry<unknown>>();
const pending = new Map<string, Promise<unknown>>();

const DEFAULT_TTL = 300_000; // 5 min

export function cacheGet<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = DEFAULT_TTL,
): Promise<T> {
  // ——— Есть закешированные данные? ———
  const existing = store.get(key);
  if (existing && existing.expiry > Date.now()) {
    return Promise.resolve(existing.data as T);
  }

  // ——— Уже идёт запрос? Дедикап ——— 
  const inFlight = pending.get(key);
  if (inFlight) return inFlight as Promise<T>;

  // ——— Новый запрос ———
  const promise = fetcher()
    .then((data) => {
      store.set(key, { data, expiry: Date.now() + ttl });
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

export function invalidateCache(key?: string): void {
  if (key) {
    store.delete(key);
    pending.delete(key);
  } else {
    store.clear();
    pending.clear();
  }
}
