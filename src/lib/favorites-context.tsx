"use client";

import {
  createContext,
  useContext,
  useState,
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

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<number[]>(readFavorites);

  // Sync across tabs
  useEffect(() => {
    const onStorage = () => setFavorites(readFavorites());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggleFavorite = useCallback((article: number) => {
    setFavorites((prev) => {
      const next = prev.includes(article)
        ? prev.filter((a) => a !== article)
        : [...prev, article];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (article: number) => favorites.includes(article),
    [favorites],
  );

  const clearFavorites = useCallback(() => {
    setFavorites([]);
    localStorage.removeItem(STORAGE_KEY);
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
