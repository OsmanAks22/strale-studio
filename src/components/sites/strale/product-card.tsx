"use client";

import Image from "next/image";
import { useState } from "react";
import { ASSET_ROOT, storeUrl, type Product } from "./data";
import { WishlistSmallIcon } from "./icons";

export function ProductCard({ product, index }: { product: Product; index: number }) {
  const [saved, setSaved] = useState(false);
  const href = storeUrl(`/products/${product.handle}`);

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
        <span className="st-micro absolute top-1.5 left-1.5 text-[9px] leading-[7.2px] text-rust tab:top-3 tab:left-3 tab:text-[12px] tab:leading-[9.6px]">
          New
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
        <span className="sr-only">{saved ? "Remove from Wishlist" : "Add to Wishlist"}</span>
      </button>
      <div className="mt-2 px-1 text-[9px] leading-[13.5px] tab:text-[12px] tab:leading-[18px] desk:mt-1.5 desk:flex desk:items-start desk:justify-between desk:gap-6 desk:px-[3px]">
        <a href={href} className="block truncate">
          {product.name}
        </a>
        <span className="mt-[3px] block shrink-0 st-label desk:mt-0">{product.price}</span>
      </div>
    </div>
  );
}
