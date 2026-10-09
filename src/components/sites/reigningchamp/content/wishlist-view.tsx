"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "../format";
import { useWishlist, wishlist } from "../stores";

/** Saved products from the local wishlist store (the source uses Swym for this page). */
export function WishlistView() {
  const items = useWishlist();

  return (
    <div className="px-3 pt-3 pb-12 tab:px-8">
      <h1 className="font-rc-cond text-[32px] leading-10 tracking-[1.5px] tab:text-[48px] tab:leading-[60px] tab:tracking-[1px]">
        WISHLIST
      </h1>
      <p className="mt-6 text-[#808080] tab:mt-[53px]">
        {items.length} {items.length === 1 ? "product" : "products"}
      </p>
      {items.length > 0 ? (
        <ul className="mt-5 grid grid-cols-2 gap-x-1 gap-y-6 tab:grid-cols-4 tab:gap-x-2 tab:gap-y-8">
          {items.map((item) => (
            <li key={item.handle} className="relative">
              <Link href={`/products/${item.handle}`} className="relative block aspect-[4/5] bg-[#f2f2f2]">
                {item.image ? (
                  <Image src={item.image} alt={item.title} fill sizes="(min-width: 750px) 24vw, 50vw" className="object-cover" />
                ) : null}
              </Link>
              <div className="mt-2 px-1 text-[9px] leading-[13.5px] tab:text-[12px] tab:leading-[18px] desk:mt-1.5 desk:flex desk:justify-between desk:gap-6 desk:px-[3px]">
                <Link href={`/products/${item.handle}`} className="block truncate tracking-[1px]">
                  {item.title}
                </Link>
                <span className="mt-[3px] block shrink-0 tracking-[1.2px] uppercase desk:mt-0">{formatPrice(item.price)}</span>
              </div>
              <button
                type="button"
                onClick={() => wishlist.remove(item.handle)}
                className="rc-underline mt-2 cursor-pointer px-1 text-[9px] leading-[13.5px] tab:text-[12px] tab:leading-[18px] desk:px-[3px]"
              >
                Remove<span className="sr-only"> {item.title} from wishlist</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-5 pb-24">
          <p>Your wishlist is empty.</p>
          <p className="mt-1.5">Tap the bookmark on any product to save it here.</p>
          <Link href="/collections/mens-latest" className="rc-underline mt-4 inline-block">
            Continue Shopping
          </Link>
        </div>
      )}
    </div>
  );
}
