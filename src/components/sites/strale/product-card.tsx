import Link from "next/link";
import { discountPercent, formatPrice, productTitle, type Product } from "./catalog";
import { ProductImage } from "./product-image";

/** Same geometry as the cloned card: 4:5 image, badge top-left, name left / price right. */
export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const href = `/urun/${product.handle}`;
  const discount = discountPercent(product);
  const badge = [discount > 0 ? `-%${discount}` : null, product.condition === "hafif-kusurlu" ? "Hafif kusurlu" : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="relative">
      <Link href={href} className="relative block">
        <ProductImage product={product} sizes="(min-width: 750px) 23vw, 40vw" priority={priority} />
        {badge ? (
          <span className="absolute top-1.5 left-1.5 text-[9px] leading-[7.2px] tracking-[1px] text-rust uppercase tab:top-3 tab:left-3 tab:text-[12px] tab:leading-[9.6px]">
            {badge}
          </span>
        ) : null}
      </Link>
      <div className="mt-2 px-1 text-[9px] leading-[13.5px] tab:text-[12px] tab:leading-[18px] desk:mt-1.5 desk:flex desk:items-start desk:justify-between desk:gap-6 desk:px-[3px]">
        <Link href={href} className="block truncate">
          {productTitle(product)}
        </Link>
        <span className="mt-[3px] flex shrink-0 items-baseline gap-1.5 st-label desk:mt-0">
          {discount > 0 && product.listPrice ? (
            <s className="text-graphite">
              <span className="sr-only">Önceki fiyat: </span>
              {formatPrice(product.listPrice)}
            </s>
          ) : null}
          <span>
            {discount > 0 ? <span className="sr-only">İndirimli fiyat: </span> : null}
            {formatPrice(product.price)}
          </span>
        </span>
      </div>
    </div>
  );
}
