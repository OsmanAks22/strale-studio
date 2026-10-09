import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ProductSummary } from "./catalog";
import { formatPrice } from "./format";
import { WishlistButton } from "./wishlist-button";

const MAX_SWATCHES = 3;

/**
 * Catalog card used by collection, search, product "More …" grids and the wishlist page:
 * 4:5 media on #f2f2f2, wishlist toggle, name/price row, colourway swatches.
 */
export function ProductGridCard({
  product,
  sizes = "(min-width: 990px) 30vw, 50vw",
  priority = false,
  showBadge = true,
  className,
}: {
  product: ProductSummary;
  sizes?: string;
  priority?: boolean;
  /** Collection grids on the source omit the "New" badge that carousels show. */
  showBadge?: boolean;
  className?: string;
}) {
  const href = `/products/${product.handle}`;
  const extra = product.swatches.length - MAX_SWATCHES;

  return (
    <div className={cn("relative pb-6", className)}>
      <Link href={href} className="group relative block aspect-[4/5] overflow-hidden bg-[#f2f2f2]">
        {product.image ? (
          <Image
            src={product.image.src}
            alt={product.title}
            fill
            sizes={sizes}
            preload={priority}
            className="object-cover"
          />
        ) : null}
        {showBadge && product.isNew ? (
          <span className="absolute top-1.5 left-1.5 text-[9px] leading-[7.2px] tracking-[1px] tab:top-3 tab:left-3 tab:text-[12px] tab:leading-[9.6px]">
            New
          </span>
        ) : null}
      </Link>
      <WishlistButton
        product={{ handle: product.handle, title: product.title, price: product.price, image: product.image?.src ?? null }}
        className="absolute top-0 right-0"
      />
      <div className="mt-2 px-1 text-[9px] leading-[13.5px] tab:text-[12px] tab:leading-[18px] desk:mt-1.5 desk:flex desk:items-start desk:justify-between desk:gap-6 desk:px-[3px]">
        <Link href={href} className="block truncate tracking-[1px]">
          {product.title}
        </Link>
        <span className="mt-[3px] block shrink-0 tracking-[1.2px] uppercase desk:mt-0">
          {product.compareAtPrice ? (
            <>
              <s className="mr-1.5 text-[#808080]">{formatPrice(product.compareAtPrice)}</s>
              {formatPrice(product.price)}
            </>
          ) : (
            formatPrice(product.price)
          )}
        </span>
      </div>
      {product.swatches.length > 1 ? (
        <ul className="mt-2 flex items-center gap-2 px-1 desk:px-[3px]" aria-label="Colours">
          {product.swatches.slice(0, MAX_SWATCHES).map((swatch) => (
            <li key={swatch.handle}>
              <Link
                href={`/products/${swatch.handle}`}
                title={swatch.colour ?? undefined}
                aria-label={swatch.colour ?? swatch.handle}
                className={cn(
                  "block size-3 border border-black/20",
                  swatch.handle === product.handle && "outline outline-1 outline-offset-1 outline-black",
                )}
                style={{ backgroundColor: swatch.colourHex ?? "#ccc" }}
              />
            </li>
          ))}
          {extra > 0 ? <li className="text-[9px] leading-none">+{extra}</li> : null}
        </ul>
      ) : null}
    </div>
  );
}
