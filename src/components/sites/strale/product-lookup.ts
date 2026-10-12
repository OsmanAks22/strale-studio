"use client";

import { useEffect, useState } from "react";
import type { Product } from "./catalog";

/** Product data for a few handles, fetched from /api/urunler and kept for a minute. */
const cache = new Map<string, { product: Product | null; at: number }>();
const TTL = 60_000;

const fresh = (handle: string) => {
  const entry = cache.get(handle);
  return entry && Date.now() - entry.at < TTL ? entry : undefined;
};

export function useProductsByHandle(handles: string[]) {
  const [, setVersion] = useState(0);
  const missing = handles.filter((h) => !fresh(h));
  const missingKey = missing.join(",");

  useEffect(() => {
    if (!missingKey) return;
    let cancelled = false;
    fetch(`/api/urunler?h=${encodeURIComponent(missingKey)}`)
      .then((response) => response.json() as Promise<{ products: Product[] }>)
      .then((data) => {
        const at = Date.now();
        for (const handle of missingKey.split(",")) {
          cache.set(handle, { product: data.products.find((p) => p.handle === handle) ?? null, at });
        }
        if (!cancelled) setVersion((v) => v + 1);
      })
      .catch(() => {
        // Offline: keep showing what we have.
      });
    return () => {
      cancelled = true;
    };
  }, [missingKey]);

  return {
    loading: missing.length > 0,
    /** Same order as `handles`; handles that no longer exist are left out. */
    products: handles.map((h) => cache.get(h)?.product).filter((p): p is Product => Boolean(p)),
    /** null = product no longer on sale, undefined = still loading. */
    get: (handle: string) => cache.get(handle)?.product,
  };
}
