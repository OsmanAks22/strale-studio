import Link from "next/link";
import { LOW_STOCK, discountPercent, formatPrice, productTitle, type Product } from "./catalog";
import { ProductImage } from "./product-image";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const href = `/urun/${product.handle}`;
  const discount = discountPercent(product);

  return (
    <Link href={href} className="group relative block">
      <span className="relative block">
        <ProductImage product={product} sizes="(min-width: 990px) 23vw, (min-width: 750px) 30vw, 48vw" priority={priority} />
        {discount > 0 ? (
          <span className="st-micro absolute top-1.5 left-1.5 bg-rust px-1 py-0.5 text-[9px] leading-[11px] text-bone tab:top-3 tab:left-3 tab:px-1.5 tab:text-[11px] tab:leading-[14px]">
            -%{discount}
          </span>
        ) : null}
        <span className="st-micro absolute bottom-1.5 left-1.5 text-[8px] leading-[11px] text-graphite tab:bottom-3 tab:left-3 tab:text-[10px]">
          {product.condition === "hafif-kusurlu" ? (
            <span className="text-rust">İhraç fazlası · Hafif kusurlu</span>
          ) : (
            "İhraç fazlası"
          )}
        </span>
      </span>
      <span className="mt-2 block px-1 text-[11px] leading-4 tab:text-[12px] tab:leading-[18px] desk:px-[3px]">
        <span className="block truncate group-hover:underline group-hover:underline-offset-4">{productTitle(product)}</span>
        <span className="mt-0.5 flex items-baseline gap-1.5">
          {discount > 0 && product.listPrice ? (
            <s className="text-graphite">
              <span className="sr-only">Önceki fiyat: </span>
              {formatPrice(product.listPrice)}
            </s>
          ) : null}
          <span className={discount > 0 ? "st-label text-rust" : "st-label"}>
            {discount > 0 ? <span className="sr-only">İndirimli fiyat: </span> : null}
            {formatPrice(product.price)}
          </span>
        </span>
        <span className="mt-0.5 flex justify-between gap-2 text-[10px] leading-[14px] text-graphite tab:text-[11px] tab:leading-4">
          <span className="truncate">Beden: {product.sizes.join(" · ")}</span>
          {product.stock <= LOW_STOCK ? (
            <span className="shrink-0 font-medium text-rust">Son {product.stock} adet</span>
          ) : null}
        </span>
      </span>
    </Link>
  );
}
