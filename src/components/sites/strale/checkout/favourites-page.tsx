"use client";

import Link from "next/link";
import { allProducts } from "../catalog";
import { ProductCard } from "../product-card";
import { useFavourites } from "../shop-store";

export function FavouritesPage() {
  const handles = useFavourites();
  const products = handles.map((h) => allProducts.find((p) => p.handle === h)).filter((p) => p !== undefined);
  if (!products.length) {
    return (
      <div className="px-3 pb-16 tab:px-8">
        <p>Henüz favori ürününüz yok. Ürün sayfasındaki ♡ ile ekleyebilirsiniz.</p>
        <Link href="/koleksiyonlar/tumu" className="st-label st-underline mt-3 inline-block">
          Tüm ürünler
        </Link>
      </div>
    );
  }
  return (
    <ul className="grid grid-cols-2 gap-x-1 gap-y-6 px-3 pb-16 tab:grid-cols-3 tab:gap-x-1.5 tab:px-8 desk:grid-cols-4">
      {products.map((product) => (
        <li key={product.handle}>
          <ProductCard product={product} />
          {product.stock <= 0 ? <p className="mt-1 px-1 text-[12px] text-graphite">Tükendi</p> : null}
        </li>
      ))}
    </ul>
  );
}
