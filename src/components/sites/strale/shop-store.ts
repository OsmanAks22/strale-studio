"use client";

import { useMemo, useSyncExternalStore } from "react";

/**
 * Basket and favourites, kept in this browser (localStorage). Same pattern as recently-viewed:
 * the raw JSON string is the snapshot so React only re-renders when it really changes.
 */

export type CartLine = { handle: string; size: string; qty: number };

function createListStore<T>(key: string) {
  const event = `${key}-change`;
  const read = () => {
    try {
      return window.localStorage.getItem(key) ?? "[]";
    } catch {
      return "[]";
    }
  };
  const parse = (raw: string): T[] => {
    try {
      const value = JSON.parse(raw) as unknown;
      return Array.isArray(value) ? (value as T[]) : [];
    } catch {
      return [];
    }
  };
  const write = (items: T[]) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(items));
    } catch {
      // Private mode / storage full: the basket still works until the page reloads.
      memory = JSON.stringify(items);
    }
    window.dispatchEvent(new Event(event));
  };
  let memory: string | null = null;
  const subscribe = (onChange: () => void) => {
    window.addEventListener(event, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(event, onChange);
      window.removeEventListener("storage", onChange);
    };
  };
  const snapshot = () => memory ?? read();
  return {
    get: () => parse(snapshot()),
    set: write,
    use() {
      const raw = useSyncExternalStore(subscribe, snapshot, () => "[]");
      return useMemo(() => parse(raw), [raw]);
    },
  };
}

const cart = createListStore<CartLine>("st-sepet");
const favourites = createListStore<string>("st-favoriler");

export const useCart = cart.use;
export const useFavourites = favourites.use;

export const cartCount = (lines: CartLine[]) => lines.reduce((sum, line) => sum + line.qty, 0);

export function addToCart(handle: string, size: string, qty = 1) {
  const lines = cart.get();
  const existing = lines.find((l) => l.handle === handle && l.size === size);
  cart.set(
    existing
      ? lines.map((l) => (l === existing ? { ...l, qty: Math.min(10, l.qty + qty) } : l))
      : [...lines, { handle, size, qty }],
  );
}

export function setQty(handle: string, size: string, qty: number) {
  cart.set(
    cart
      .get()
      .map((l) => (l.handle === handle && l.size === size ? { ...l, qty: Math.max(1, Math.min(10, qty)) } : l)),
  );
}

export function removeFromCart(handle: string, size: string) {
  cart.set(cart.get().filter((l) => !(l.handle === handle && l.size === size)));
}

export const clearCart = () => cart.set([]);
export const replaceCart = (lines: CartLine[]) => cart.set(lines);

export function toggleFavourite(handle: string) {
  const list = favourites.get();
  favourites.set(list.includes(handle) ? list.filter((h) => h !== handle) : [handle, ...list]);
}
