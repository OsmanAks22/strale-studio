"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { getProduct, type Product } from "./catalog";
import { ProductCard } from "./product-card";
import { Slider, SliderItem } from "./slider";

const KEY = "st-recently-viewed";
const MAX = 12;
const EVENT = "st-recently-viewed";

function read(): string {
  try {
    return window.localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function parse(raw: string): string[] {
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

/** Mounted on product pages: records the visit (most recent first). */
export function TrackRecentlyViewed({ handle }: { handle: string }) {
  useEffect(() => {
    const next = [handle, ...parse(read()).filter((h) => h !== handle)].slice(0, MAX);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
      window.dispatchEvent(new Event(EVENT));
    } catch {
      // Storage unavailable (private mode): nothing to remember.
    }
  }, [handle]);
  return null;
}

export function RecentlyViewedList({ exclude }: { exclude?: string }) {
  const raw = useSyncExternalStore(subscribe, read, () => "[]");
  const products = parse(raw)
    .filter((handle) => handle !== exclude)
    .map(getProduct)
    .filter((p): p is Product => Boolean(p && p.stock > 0));

  if (!products.length) {
    return (
      <div className="px-3 tab:px-8">
        <p className="mt-8">Henüz görüntülediğin bir ürün yok.</p>
        <Link href="/koleksiyonlar/yeni-gelenler" className="mt-1.5 inline-block st-underline">
          Yeni Gelenlere Göz At
        </Link>
      </div>
    );
  }
  return (
    <div className="mt-3">
      <Slider label="Son Görüntülenenler">
        {products.map((product) => (
          <SliderItem key={product.handle}>
            <ProductCard product={product} />
          </SliderItem>
        ))}
      </Slider>
    </div>
  );
}
