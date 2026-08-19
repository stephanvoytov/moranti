"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

const STORAGE_KEY = "moranti_cart";

/** Позиция в корзине — ключ по артикулу WB (как в избранном) */
export interface CartItem {
  article: number;
  qty: number;
}

interface CartContextValue {
  cart: CartItem[];
  /** Суммарное количество позиций (qty всех товаров) — для бейджа */
  count: number;
  /** Количество разных товаров */
  itemsCount: number;
  qtyOf: (article: number) => number;
  addToCart: (article: number) => void;
  removeFromCart: (article: number) => void;
  setQty: (article: number, qty: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (i): i is CartItem =>
          i &&
          typeof i.article === "number" &&
          typeof i.qty === "number" &&
          i.qty > 0,
      )
      .map((i) => ({ article: i.article, qty: Math.floor(i.qty) }));
  } catch {
    return [];
  }
}

/* ——— Snapshot cache + subscription (useSyncExternalStore) ———
   Гидрация консистентна с SSR: снапшот кэшируется модульно, на сервере
   всегда [] (typeof window guard). Никакого setState в инициализаторе. */

let snapshotCache: CartItem[] | null = null;
const listeners = new Set<() => void>();
/** Стабильная ссылка для getServerSnapshot */
const EMPTY_CART: CartItem[] = [];

function emit() {
  for (const cb of listeners) cb();
}

function getCartSnapshot(): CartItem[] {
  if (snapshotCache === null) snapshotCache = readCart();
  return snapshotCache;
}

function setCartCache(next: CartItem[]) {
  snapshotCache = next;
  emit();
}

function subscribeCart(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function persist(next: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage unavailable
  }
  setCartCache(next);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const cart = useSyncExternalStore(
    subscribeCart,
    getCartSnapshot,
    () => EMPTY_CART,
  );

  // Sync across tabs — обновляем модульный кэш напрямую
  useEffect(() => {
    const onStorage = () => {
      snapshotCache = readCart();
      emit();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addToCart = useCallback(
    (article: number) => {
      const existing = cart.find((i) => i.article === article);
      const next = existing
        ? cart.map((i) =>
            i.article === article ? { ...i, qty: i.qty + 1 } : i,
          )
        : [...cart, { article, qty: 1 }];
      persist(next);
    },
    [cart],
  );

  const removeFromCart = useCallback(
    (article: number) => {
      persist(cart.filter((i) => i.article !== article));
    },
    [cart],
  );

  const setQty = useCallback(
    (article: number, qty: number) => {
      if (qty <= 0) {
        persist(cart.filter((i) => i.article !== article));
        return;
      }
      persist(
        cart.map((i) => (i.article === article ? { ...i, qty } : i)),
      );
    },
    [cart],
  );

  const clearCart = useCallback(() => {
    persist([]);
  }, []);

  const qtyOf = useCallback(
    (article: number) =>
      cart.find((i) => i.article === article)?.qty ?? 0,
    [cart],
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        count: cart.reduce((sum, i) => sum + i.qty, 0),
        itemsCount: cart.length,
        qtyOf,
        addToCart,
        removeFromCart,
        setQty,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}