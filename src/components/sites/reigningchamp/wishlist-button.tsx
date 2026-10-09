"use client";

import { cn } from "@/lib/utils";
import { WishlistSmallIcon } from "./icons";
import { useWishlist, wishlist, type SavedProduct } from "./stores";

/** Bookmark toggle shown on product cards and the product page; persists to the wishlist page. */
export function WishlistButton({
  product,
  className,
  iconClassName = "size-[9px] tab:size-3",
}: {
  product: SavedProduct;
  className?: string;
  iconClassName?: string;
}) {
  const saved = useWishlist().some((item) => item.handle === product.handle);
  return (
    <button
      type="button"
      aria-pressed={saved}
      onClick={() => wishlist.toggle(product)}
      className={cn("flex size-10 cursor-pointer items-center justify-center", className)}
    >
      {saved ? (
        <svg aria-hidden="true" viewBox="0 0 9 9" className={iconClassName}>
          <path d="M1.125 0h6.75v9L4.5 6.6 1.125 9z" fill="currentColor" />
        </svg>
      ) : (
        <WishlistSmallIcon className={iconClassName} />
      )}
      <span className="sr-only">{saved ? "Remove from Wishlist" : "Add to Wishlist"}</span>
    </button>
  );
}
