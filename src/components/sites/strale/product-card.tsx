"use client";

import Image from "next/image";
import { useState } from "react";
import { ASSET_ROOT, LOW_STOCK, discountPercent, formatPrice, storeUrl, type Product } from "./data";
import { WishlistSmallIcon } from "./icons";

export function ProductCard({ product, index }: { product: Product; index: number }) {
  const [saved, setSaved] = useState(false);
  const href = storeUrl(`/urun/${product.handle}`);

  return (
    <div className="relative">
      <a href={href} className="relative block aspect-[4/5] bg-stone">
        <Image
          src={`${ASSET_ROOT}/images/products/${product.image}.jpg`}
          alt={product.name}
          fill
          sizes="(min-width: 750px) 23vw, 40vw"
          loading={index < 5 ? "eager" : "lazy"}
          className="object-cover"
        />
        <span className="st-micro absolute top-1.5 left-1.5 bg-rust px-1 py-0.5 text-[9px] leading-[11px] text-bone tab:top-3 tab:left-3 tab:px-1.5 tab:text-[11px] tab:leading-[14px]">
          -%{discountPercent(product)}
        </span>
        <span className="st-micro absolute bottom-1.5 left-1.5 text-[8px] leading-[11px] text-graphite tab:bottom-3 tab:left-3 tab:text-[10px]">
          İhraç fazlası
        </span>
      </a>
      <button
        type="button"
        aria-pressed={saved}
        onClick={() => setSaved((value) => !value)}
        className="absolute top-0 right-0 flex size-10 cursor-pointer items-center justify-center"
      >
        {saved ? (
          <svg aria-hidden="true" viewBox="0 0 9 9" className="size-[9px] tab:size-3">
            <path d="M1.125 0h6.75v9L4.5 6.6 1.125 9z" fill="currentColor" />
          </svg>
        ) : (
          <WishlistSmallIcon className="size-[9px] tab:size-3" />
        )}
        <span className="sr-only">{saved ? "Favorilerden çıkar" : "Favorilere ekle"}</span>
      </button>
      <div className="mt-2 px-1 text-[9px] leading-[13.5px] tab:text-[12px] tab:leading-[18px] desk:mt-1.5 desk:flex desk:items-start desk:justify-between desk:gap-6 desk:px-[3px]">
        <a href={href} className="block truncate">
          {product.name}
        </a>
        <span className="mt-[3px] flex shrink-0 items-baseline gap-1.5 desk:mt-0">
          <s className="text-graphite">
            <span className="sr-only">Önceki fiyat: </span>
            {formatPrice(product.listPrice)}
          </s>
          <span className="st-label text-rust">
            <span className="sr-only">İndirimli fiyat: </span>
            {formatPrice(product.price)}
          </span>
        </span>
      </div>
      <p className="mt-1 flex justify-between gap-2 px-1 text-[9px] leading-[13.5px] text-graphite tab:text-[11px] tab:leading-4 desk:px-[3px]">
        <span className="truncate">Beden: {product.sizes.join(" · ")}</span>
        {product.stock <= LOW_STOCK ? (
          <span className="shrink-0 font-medium text-rust">Son {product.stock} adet</span>
        ) : null}
      </p>
    </div>
  );
}
