"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

const STORAGE_KEY = "moranti_favorites";

interface FavoritesContextValue {
  favorites: number[];
  count: number;
  isFavorite: (article: number) => boolean;
  toggleFavorite: (article: number) => void;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

function readFavorites(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/* ——— Snapshot cache + subscription (useSyncExternalStore) ———
   Гидрация консистентна с SSR: снапшот кэшируется модульно, на сервере
   всегда [] (typeof window guard), на клиенте меняется только через
   toggle/clear/storage-событие. Никакого setState в инициализаторе. */

let snapshotCache: number[] | null = null;
const listeners = new Set<() => void>();
/** Стабильная ссылка для getServerSnapshot — иначе React предупреждает
    о бесконечном цикле (новый массив на каждый вызов). */
const EMPTY_FAVORITES: number[] = [];

function emit() {
  for (const cb of listeners) cb();
}

function getFavoritesSnapshot(): number[] {
  if (snapshotCache === null) snapshotCache = readFavorites();
  return snapshotCache;
}

function setFavoritesCache(next: number[]) {
  snapshotCache = next;
  emit();
}

function subscribeFavorites(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const favorites = useSyncExternalStore(
    subscribeFavorites,
    getFavoritesSnapshot,
    () => EMPTY_FAVORITES,
  );

  // Sync across tabs — обновляем модульный кэш напрямую (без setState-в-эффекте)
  useEffect(() => {
    const onStorage = () => {
      snapshotCache = readFavorites();
      emit();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggleFavorite = useCallback(
    (article: number) => {
      const next = favorites.includes(article)
        ? favorites.filter((a) => a !== article)
        : [...favorites, article];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // localStorage unavailable
      }
      setFavoritesCache(next);
    },
    [favorites],
  );

  const isFavorite = useCallback(
    (article: number) => favorites.includes(article),
    [favorites],
  );

  const clearFavorites = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage unavailable
    }
    setFavoritesCache([]);
  }, []);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        count: favorites.length,
        isFavorite,
        toggleFavorite,
        clearFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx)
    throw new Error("useFavorites must be used within a FavoritesProvider");
  return ctx;
}
