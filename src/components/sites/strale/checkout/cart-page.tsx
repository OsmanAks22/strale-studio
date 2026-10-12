"use client";

import Link from "next/link";
import { allProducts, formatPrice, productTitle, sizeAvailable } from "../catalog";
import { ProductImage } from "../product-image";
import { removeFromCart, setQty, useCart } from "../shop-store";
import { shippingFor, siteConfig } from "../site-config";

export function CartPage() {
  const lines = useCart();
  const rows = lines.map((line) => ({ line, product: allProducts.find((p) => p.handle === line.handle) }));
  const subtotal = rows.reduce((sum, { line, product }) => sum + (product ? product.price * line.qty : 0), 0);
  const shipping = shippingFor(subtotal);
  const toFree = siteConfig.freeShippingThreshold - subtotal;
  const blocked = rows.some(({ line, product }) => !product || !sizeAvailable(product, line.size));

  if (!lines.length) {
    return (
      <div className="px-3 pb-16 tab:px-8">
        <p>Sepetiniz boş.</p>
        <Link href="/koleksiyonlar/yeni-gelenler" className="st-label st-underline mt-3 inline-block">
          Yeni gelenlere göz at
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 px-3 pb-16 tab:px-8 desk:grid-cols-[1fr_380px]">
      <ul className="border-t border-sand">
        {rows.map(({ line, product }) => (
          <li key={`${line.handle}-${line.size}`} className="flex gap-3 border-b border-sand py-4">
            {product ? (
              <Link href={`/urun/${product.handle}`} className="w-24 shrink-0 tab:w-32">
                <ProductImage product={product} sizes="128px" />
              </Link>
            ) : (
              <span className="aspect-[4/5] w-24 shrink-0 bg-stone tab:w-32" />
            )}
            <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
              <div>
                <p className="font-medium">{product ? productTitle(product) : "Ürün artık satışta değil"}</p>
                <p className="text-graphite">Beden: {line.size}</p>
                {product && !sizeAvailable(product, line.size) ? <p className="text-rust">Bu beden tükendi, lütfen sepetten çıkarın.</p> : null}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex h-9 items-stretch border border-sand">
                  <button type="button" aria-label="Azalt" onClick={() => setQty(line.handle, line.size, line.qty - 1)} className="w-8 cursor-pointer">
                    −
                  </button>
                  <span className="flex w-8 items-center justify-center border-x border-sand">{line.qty}</span>
                  <button type="button" aria-label="Arttır" onClick={() => setQty(line.handle, line.size, line.qty + 1)} className="w-8 cursor-pointer">
                    +
                  </button>
                </span>
                <button type="button" onClick={() => removeFromCart(line.handle, line.size)} className="st-underline cursor-pointer text-graphite">
                  Kaldır
                </button>
                <span className="ml-auto st-label">{product ? formatPrice(product.price * line.qty) : "—"}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="h-fit bg-stone p-4">
        <dl className="flex flex-col gap-2">
          <div className="flex justify-between">
            <dt>Ara toplam</dt>
            <dd>{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Kargo</dt>
            <dd>{shipping ? formatPrice(shipping) : "Ücretsiz"}</dd>
          </div>
          <div className="flex justify-between border-t border-sand pt-2 font-medium">
            <dt>Toplam</dt>
            <dd>{formatPrice(subtotal + shipping)}</dd>
          </div>
        </dl>
        {toFree > 0 ? (
          <div className="mt-3">
            <p className="text-[12px] text-graphite">Ücretsiz kargo için {formatPrice(toFree)} daha ekleyin.</p>
            <div className="mt-1 h-1 bg-sand">
              <div className="h-1 bg-ink" style={{ width: `${Math.min(100, (subtotal / siteConfig.freeShippingThreshold) * 100)}%` }} />
            </div>
          </div>
        ) : null}
        <p className="mt-3 text-[12px] text-graphite">İndirim kodunu bir sonraki adımda girebilirsiniz.</p>
        {blocked ? (
          <p className="st-label mt-4 flex h-12 items-center justify-center bg-sand text-graphite">Tükenen ürünleri çıkarın</p>
        ) : (
          <Link href="/odeme" className="st-label mt-4 flex h-12 items-center justify-center bg-ink text-bone hover:bg-smoke">
            Siparişi Tamamla
          </Link>
        )}
      </aside>
    </div>
  );
}
