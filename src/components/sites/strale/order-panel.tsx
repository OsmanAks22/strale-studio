"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { LOW_STOCK, formatPrice, productTitle, type Product } from "./catalog";
import { WhatsAppIcon } from "./icons";
import { siteConfig, whatsappLink } from "./site-config";

/** Size picker + WhatsApp order button. Ordering runs over WhatsApp until a payment provider is set up. */
export function OrderPanel({ product, url }: { product: Product; url: string }) {
  const [size, setSize] = useState<string | null>(product.sizes.length === 1 ? product.sizes[0] : null);
  const [tried, setTried] = useState(false);
  const soldOut = product.stock <= 0;

  const message = [
    "Merhaba, bu ürünü sipariş etmek istiyorum:",
    productTitle(product),
    `Beden: ${size ?? "-"}`,
    `Fiyat: ${formatPrice(product.price)}`,
    url,
  ].join("\n");
  const href = whatsappLink(message);

  return (
    <div>
      <fieldset>
        <legend className="st-micro text-[10px] text-graphite">
          Beden {size ? <span className="text-ink">· {size}</span> : null}
        </legend>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {product.sizes.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={size === option}
              onClick={() => setSize(option)}
              className={cn(
                "st-label h-11 min-w-12 cursor-pointer border px-3 transition-colors",
                size === option ? "border-ink bg-ink text-bone" : "border-sand hover:border-ink",
              )}
            >
              {option}
            </button>
          ))}
        </div>
        {tried && !size ? <p className="mt-2 text-rust">Lütfen bir beden seç.</p> : null}
      </fieldset>

      {product.stock > 0 && product.stock <= LOW_STOCK ? (
        <p className="mt-4 font-medium text-rust">Son {product.stock} adet — yenisi gelmeyebilir.</p>
      ) : null}

      {soldOut ? (
        <p className="st-label mt-6 flex h-14 items-center justify-center bg-sand text-graphite">Tükendi</p>
      ) : href ? (
        <a
          href={size ? href : undefined}
          target="_blank"
          rel="noreferrer"
          onClick={(event) => {
            if (!size) {
              event.preventDefault();
              setTried(true);
            }
          }}
          className="st-label mt-6 flex h-14 cursor-pointer items-center justify-center gap-2 bg-ink text-bone transition-colors hover:bg-smoke"
        >
          <WhatsAppIcon className="size-5" />
          WhatsApp ile Sipariş Ver
        </a>
      ) : (
        <p className="st-label mt-6 flex h-14 items-center justify-center bg-sand text-graphite">
          Sipariş hattı çok yakında
        </p>
      )}

      <p className="mt-3 text-graphite">
        Ödeme: {siteConfig.paymentMethods.join(" veya ")}.{" "}
        <Link href="/sayfa/siparis" className="st-underline">
          Nasıl sipariş verilir?
        </Link>
      </p>
    </div>
  );
}
