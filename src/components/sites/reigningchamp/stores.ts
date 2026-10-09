"use client";

import { useSyncExternalStore } from "react";

/**
 * Bag, wishlist and recently-viewed state for the clone. The source keeps these in
 * Shopify/Swym; here they live in localStorage so every control works offline.
 */
function createStore<T>(key: string, initial: T) {
  let state = initial;
  let loaded = false;
  const listeners = new Set<() => void>();

  const load = () => {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) state = JSON.parse(raw) as T;
    } catch {
      // Storage blocked or corrupt: start empty.
    }
  };

  const emit = () => listeners.forEach((listener) => listener());

  if (typeof window !== "undefined") {
    window.addEventListener("storage", (event) => {
      if (event.key !== key) return;
      loaded = false;
      load();
      emit();
    });
  }

  return {
    get: () => {
      load();
      return state;
    },
    set: (next: T | ((previous: T) => T)) => {
      load();
      state = typeof next === "function" ? (next as (previous: T) => T)(state) : next;
      try {
        window.localStorage.setItem(key, JSON.stringify(state));
      } catch {
        // Keep in-memory state when storage is unavailable.
      }
      emit();
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    initial,
  };
}

function useStore<T>(store: ReturnType<typeof createStore<T>>) {
  return useSyncExternalStore(store.subscribe, store.get, () => store.initial);
}

export type CartLine = {
  variantId: number;
  handle: string;
  title: string;
  variantTitle: string;
  colour: string | null;
  size: string | null;
  price: number;
  image: string | null;
  quantity: number;
};

const EMPTY_CART: CartLine[] = [];
const cartStore = createStore<CartLine[]>("rc-cart", EMPTY_CART);

export function useCart() {
  const lines = useStore(cartStore);
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.price, 0);
  return { lines, count, subtotal };
}

export const cart = {
  add(line: Omit<CartLine, "quantity">, quantity = 1) {
    cartStore.set((lines) => {
      const existing = lines.find((l) => l.variantId === line.variantId);
      if (existing) {
        return lines.map((l) => (l.variantId === line.variantId ? { ...l, quantity: l.quantity + quantity } : l));
      }
      return [...lines, { ...line, quantity }];
    });
  },
  setQuantity(variantId: number, quantity: number) {
    cartStore.set((lines) =>
      quantity <= 0
        ? lines.filter((l) => l.variantId !== variantId)
        : lines.map((l) => (l.variantId === variantId ? { ...l, quantity } : l)),
    );
  },
  remove(variantId: number) {
    cartStore.set((lines) => lines.filter((l) => l.variantId !== variantId));
  },
  clear() {
    cartStore.set([]);
  },
};

export type SavedProduct = {
  handle: string;
  title: string;
  price: number;
  image: string | null;
};

const EMPTY_SAVED: SavedProduct[] = [];
const wishlistStore = createStore<SavedProduct[]>("rc-wishlist", EMPTY_SAVED);

export function useWishlist() {
  return useStore(wishlistStore);
}

export const wishlist = {
  toggle(product: SavedProduct) {
    wishlistStore.set((items) =>
      items.some((i) => i.handle === product.handle)
        ? items.filter((i) => i.handle !== product.handle)
        : [product, ...items],
    );
  },
  remove(handle: string) {
    wishlistStore.set((items) => items.filter((i) => i.handle !== handle));
  },
};

const recentStore = createStore<SavedProduct[]>("rc-recently-viewed", EMPTY_SAVED);

export function useRecentlyViewed() {
  return useStore(recentStore);
}

export function recordView(product: SavedProduct) {
  recentStore.set((items) => [product, ...items.filter((i) => i.handle !== product.handle)].slice(0, 12));
}
