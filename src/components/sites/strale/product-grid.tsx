"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { discountPercent, type Product } from "./catalog";
import { ProductCard } from "./product-card";

const sorts = {
  onerilen: { label: "Önerilen", compare: () => 0 },
  "fiyat-artan": { label: "Fiyat: Düşükten yükseğe", compare: (a: Product, b: Product) => a.price - b.price },
  "fiyat-azalan": { label: "Fiyat: Yüksekten düşüğe", compare: (a: Product, b: Product) => b.price - a.price },
  indirim: { label: "En yüksek indirim", compare: (a: Product, b: Product) => discountPercent(b) - discountPercent(a) },
} as const;

type SortKey = keyof typeof sorts;

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

function sizeRank(size: string) {
  if (SIZE_ORDER.includes(size)) return SIZE_ORDER.indexOf(size);
  const numeric = Number.parseInt(size, 10);
  return Number.isNaN(numeric) ? 1000 : 100 + numeric;
}

/** Product grid with size filter and sorting (client-side; the whole catalogue is small). */
export function ProductGrid({ products, emptyText }: { products: Product[]; emptyText: string }) {
  const [sort, setSort] = useState<SortKey>("onerilen");
  const [size, setSize] = useState<string | null>(null);

  const allSizes = useMemo(
    () => [...new Set(products.flatMap((p) => p.sizes))].sort((a, b) => sizeRank(a) - sizeRank(b)),
    [products],
  );

  const visible = useMemo(
    () => products.filter((p) => !size || p.sizes.includes(size)).sort(sorts[sort].compare),
    [products, size, sort],
  );

  return (
    <div className="px-3 pb-16 tab:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-y border-sand py-3">
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Beden filtresi">
          <span className="st-micro mr-1 text-[10px] text-graphite">Beden</span>
          {[null, ...allSizes].map((option) => (
            <button
              key={option ?? "tumu"}
              type="button"
              aria-pressed={size === option}
              onClick={() => setSize(option)}
              className={cn(
                "st-label h-8 min-w-8 cursor-pointer border px-2 text-[11px] transition-colors",
                size === option ? "border-ink bg-ink text-bone" : "border-sand hover:border-ink",
              )}
            >
              {option ?? "Tümü"}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2">
          <span className="st-micro text-[10px] text-graphite">Sırala</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            className="h-8 cursor-pointer border border-sand bg-bone px-2"
          >
            {Object.entries(sorts).map(([key, option]) => (
              <option key={key} value={key}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="mt-3 text-graphite">{visible.length} ürün</p>
      {visible.length ? (
        <ul className="mt-3 grid grid-cols-2 gap-x-1 gap-y-6 tab:grid-cols-3 tab:gap-x-1.5 tab:gap-y-8 desk:grid-cols-4">
          {visible.map((product, index) => (
            <li key={product.handle}>
              <ProductCard product={product} priority={index < 4} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-10 text-[14px]">{emptyText}</p>
      )}
    </div>
  );
}
