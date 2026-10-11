"use client";

import { useMemo, useState } from "react";
import { allProducts, categoryLabel } from "./catalog";
import { SearchIcon } from "./icons";
import { ProductCard } from "./product-card";

const normalize = (value: string) => value.toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[̀-ͯ]/g, "");

export function ProductSearch() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return allProducts.filter((p) => {
      const haystack = normalize([p.name, p.color, categoryLabel(p.category), p.fabric ?? ""].join(" "));
      return p.stock > 0 && terms.every((term) => haystack.includes(term));
    });
  }, [query]);

  return (
    <div className="px-3 pb-16 tab:px-8">
      <label className="flex h-14 items-center gap-3 border-b border-ink">
        <SearchIcon className="size-5 shrink-0" />
        <span className="sr-only">Ürün ara</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ürün, renk veya kumaş ara (ör. siyah tişört)"
          autoFocus
          className="h-full w-full bg-transparent text-[16px] outline-none placeholder:text-graphite"
        />
      </label>
      {query.trim() ? (
        <>
          <p className="mt-4 text-graphite">{results.length} sonuç</p>
          {results.length ? (
            <ul className="mt-3 grid grid-cols-2 gap-x-1 gap-y-6 tab:grid-cols-3 tab:gap-x-1.5 tab:gap-y-8 desk:grid-cols-4">
              {results.map((product) => (
                <li key={product.handle}>
                  <ProductCard product={product} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-8 text-[14px]">Aradığın ürün şu an stokta yok. Farklı bir kelime dene.</p>
          )}
        </>
      ) : null}
    </div>
  );
}
