"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { LOW_STOCK, productTitle, sizeAvailable, type Product } from "./catalog";
import { WhatsAppIcon } from "./icons";
import { addToCart, toggleFavourite, useFavourites } from "./shop-store";
import { siteConfig, whatsappLink } from "./site-config";
import { StockAlertForm } from "./stock-alert-form";

/** Size picker, add-to-basket, favourite and "notify me" for sold-out sizes. */
export function OrderPanel({ product, url }: { product: Product; url: string }) {
  const available = product.sizes.filter((option) => sizeAvailable(product, option));
  const [size, setSize] = useState<string | null>(available.length === 1 ? available[0] : null);
  const [tried, setTried] = useState(false);
  const [added, setAdded] = useState(false);
  const [alertSize, setAlertSize] = useState<string | null>(null);
  const favourite = useFavourites().includes(product.handle);
  const soldOut = available.length === 0;
  const soldOutSizes = product.sizes.filter((option) => !sizeAvailable(product, option));

  const ask = whatsappLink(["Merhaba, bu ürün hakkında bilgi almak istiyorum:", productTitle(product), size ? `Beden: ${size}` : "", url].filter(Boolean).join("\n"));

  return (
    <div>
      <fieldset>
        <legend className="st-micro text-[10px] text-graphite">
          Beden {size ? <span className="text-ink">· {size}</span> : null}
        </legend>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {product.sizes.map((option) => {
            const inStock = sizeAvailable(product, option);
            return (
              <button
                key={option}
                type="button"
                aria-pressed={size === option}
                disabled={!inStock}
                onClick={() => {
                  setSize(option);
                  setAdded(false);
                }}
                title={inStock ? undefined : "Bu beden tükendi"}
                className={cn(
                  "st-label h-11 min-w-12 cursor-pointer border px-3 transition-colors disabled:cursor-not-allowed disabled:border-stone disabled:text-ash disabled:line-through",
                  size === option ? "border-ink bg-ink text-bone" : "border-sand hover:border-ink",
                )}
              >
                {option}
              </button>
            );
          })}
        </div>
        {tried && !size ? <p className="mt-2 text-rust">Lütfen bir beden seç.</p> : null}
      </fieldset>

      {product.stock > 0 && product.stock <= LOW_STOCK ? (
        <p className="mt-4 font-medium text-rust">Son {product.stock} adet — yenisi gelmeyebilir.</p>
      ) : null}

      {soldOut ? (
        <>
          <p className="st-label mt-6 flex h-14 items-center justify-center bg-sand text-graphite">Tükendi</p>
          <StockAlertForm handle={product.handle} sizes={product.sizes} />
        </>
      ) : (
        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={() => {
              if (!size) return setTried(true);
              addToCart(product.handle, size);
              setAdded(true);
            }}
            className="st-label flex h-14 flex-1 cursor-pointer items-center justify-center bg-ink text-bone transition-colors hover:bg-smoke"
          >
            Sepete Ekle
          </button>
          <button
            type="button"
            aria-pressed={favourite}
            aria-label={favourite ? "Favorilerden çıkar" : "Favorilere ekle"}
            onClick={() => toggleFavourite(product.handle)}
            className="flex h-14 w-14 cursor-pointer items-center justify-center border border-sand hover:border-ink"
          >
            <HeartIcon filled={favourite} className="size-5" />
          </button>
        </div>
      )}

      {added ? (
        <p role="status" className="mt-3 flex flex-wrap items-center justify-between gap-2 bg-stone px-3 py-2.5">
          <span>Sepete eklendi ({size}).</span>
          <Link href="/sepet" className="st-label st-underline">
            Sepete git
          </Link>
        </p>
      ) : null}

      {!soldOut && soldOutSizes.length ? (
        <div className="mt-3">
          {alertSize === null ? (
            <button type="button" onClick={() => setAlertSize(soldOutSizes[0])} className="st-underline cursor-pointer text-graphite">
              Bedeniniz tükendi mi? Gelince haber verelim
            </button>
          ) : (
            <StockAlertForm handle={product.handle} sizes={soldOutSizes} />
          )}
        </div>
      ) : null}

      {ask ? (
        <a href={ask} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-graphite st-hover-underline">
          <WhatsAppIcon className="size-4" />
          Soru sor (WhatsApp)
        </a>
      ) : null}

      <p className="mt-3 text-graphite">
        Ödeme: {siteConfig.paymentMethods.join(" veya ")}.{" "}
        <Link href="/sayfa/siparis" className="st-underline">
          Nasıl sipariş verilir?
        </Link>
      </p>
    </div>
  );
}

export function HeartIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
      <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.9 3.5 4.5 7 4.5c2 0 3.5 1.1 5 3 1.5-1.9 3-3 5-3 3.5 0 5.6 3.4 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z" />
    </svg>
  );
}
