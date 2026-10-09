import Image from "next/image";
import Link from "next/link";
import { ASSET_ROOT, type Product } from "./data";
import { WishlistButton } from "./wishlist-button";

/** Homepage carousel card (local imagery). Catalog grids use ProductGridCard. */
export function ProductCard({ product, index }: { product: Product; index: number }) {
  const href = `/products/${product.handle}`;
  const image = `${ASSET_ROOT}/images/products/${product.handle}.jpg`;

  return (
    <div className="relative">
      <Link href={href} className="relative block aspect-[4/5] bg-[#f2f2f2]">
        <Image
          src={image}
          alt={product.name}
          fill
          sizes="(min-width: 750px) 23vw, 40vw"
          loading={index < 5 ? "eager" : "lazy"}
          className="object-cover"
        />
        <span className="absolute top-1.5 left-1.5 text-[9px] leading-[7.2px] tracking-[1px] tab:top-3 tab:left-3 tab:text-[12px] tab:leading-[9.6px]">
          New
        </span>
      </Link>
      <WishlistButton
        product={{ handle: product.handle, title: product.name, price: priceValue(product.price), image }}
        className="absolute top-0 right-0"
      />
      <div className="mt-2 px-1 text-[9px] leading-[13.5px] tab:text-[12px] tab:leading-[18px] desk:mt-1.5 desk:flex desk:items-start desk:justify-between desk:gap-6 desk:px-[3px]">
        <Link href={href} className="block truncate tracking-[1px]">
          {product.name}
        </Link>
        <span className="mt-[3px] block shrink-0 tracking-[1.2px] uppercase desk:mt-0">{product.price}</span>
      </div>
    </div>
  );
}

function priceValue(price: string) {
  return Number(price.replace(/[^0-9.]/g, ""));
}
