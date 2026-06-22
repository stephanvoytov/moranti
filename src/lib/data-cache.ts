/* =============================================
   Moranti — Server-side TTL cache
   Простой in-memory кеш для данных с Supabase.
   TTL = 60 секунд (согласовано с Cache-Control API).
   ============================================= */

const store = new Map<string, { data: unknown; expiry: number }>();

const DEFAULT_TTL = 60_000; // 60s

export function cacheGet<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = DEFAULT_TTL,
): Promise<T> {
  const existing = store.get(key);
  if (existing && existing.expiry > Date.now()) {
    return Promise.resolve(existing.data as T);
  }

  return fetcher().then((data) => {
    store.set(key, { data, expiry: Date.now() + ttl });
    return data;
  });
}

export function invalidateCache(key?: string): void {
  if (key) store.delete(key);
  else store.clear();
}
