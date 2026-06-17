/* =============================================
   Moranti — JSON File Repository with Cache
   Generic: любой JSON-файл, TTL-кэш, инвалидация
   ============================================= */

import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

/* ——— Cache entry ——— */

interface CacheEntry<T> {
  data: T;
  ts: number;
}

/* ——— Store (module-level, keyed by filename) ——— */

const store = new Map<string, CacheEntry<unknown>>();
const DEFAULT_TTL = 5000; // 5 sec

/* ——— Repository class ——— */

export class JsonRepository<T extends Record<string, any>> {
  private filePath: string;
  private defaults: () => T;
  private ttl: number;
  private cacheKey: string;

  constructor(
    filename: string,
    defaultsFn: () => T,
    ttl: number = DEFAULT_TTL,
  ) {
    this.filePath = path.join(process.cwd(), "data", filename);
    this.defaults = defaultsFn;
    this.ttl = ttl;
    this.cacheKey = filename;
  }

  /* ——— Read (cached) ——— */

  read(): T {
    const cached = store.get(this.cacheKey) as CacheEntry<T> | undefined;
    if (cached && Date.now() - cached.ts < this.ttl) {
      return cached.data;
    }

    if (!existsSync(this.filePath)) {
      const data = this.defaults();
      store.set(this.cacheKey, { data, ts: Date.now() });
      return data;
    }

    const raw = readFileSync(this.filePath, "utf-8");
    const parsed = JSON.parse(raw) as T;

    // Merge with defaults to ensure new fields exist
    const data = this.deepMerge(this.defaults(), parsed);
    store.set(this.cacheKey, { data, ts: Date.now() });
    return data;
  }

  /* ——— Write (flush to disk + update cache) ——— */

  write(data: T): void {
    writeFileSync(this.filePath, JSON.stringify(data, null, 2), "utf-8");
    store.set(this.cacheKey, { data, ts: Date.now() });
  }

  /* ——— Invalidate cache (force next read from disk) ——— */

  invalidate(): void {
    store.delete(this.cacheKey);
  }

  /* ——— Deep merge (defaults first, then overrides) ——— */

  private deepMerge(defaults: T, overrides: T): T {
    const result = { ...defaults } as Record<string, unknown>;

    for (const key of Object.keys(overrides) as (keyof T)[]) {
      const dv = defaults[key];
      const ov = overrides[key];

      if (
        dv !== null &&
        ov !== null &&
        typeof dv === "object" &&
        typeof ov === "object" &&
        !Array.isArray(dv) &&
        !Array.isArray(ov)
      ) {
        result[key as string] = { ...(dv as Record<string, unknown>), ...(ov as Record<string, unknown>) };
      } else {
        result[key as string] = ov;
      }
    }

    return result as T;
  }
}
