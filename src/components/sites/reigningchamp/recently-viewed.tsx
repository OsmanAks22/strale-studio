"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "./format";
import { Slider, SliderItem } from "./slider";
import { useRecentlyViewed } from "./stores";
import { WishlistButton } from "./wishlist-button";

/** "Recently viewed" row shown under most pages; empty state matches the source. */
export function RecentlyViewed({ exclude }: { exclude?: string }) {
  const items = useRecentlyViewed().filter((item) => item.handle !== exclude);

  return (
    <section className="pt-9 pb-12">
      <h2 className="px-3 font-rc-med text-[12px] leading-[18px] tracking-[1.2px] uppercase tab:px-8 tab:text-[16px] tab:leading-6">
        Recently Viewed
      </h2>
      {items.length === 0 ? (
        <div className="px-3 tab:px-8">
          <p className="mt-8">There are no recently viewed items to show.</p>
          <Link href="/collections/mens-latest" className="mt-1.5 inline-block rc-underline">
            Shop New Arrivals
          </Link>
        </div>
      ) : (
        <div className="mt-3">
          <Slider label="Recently Viewed">
            {items.map((item) => (
              <SliderItem key={item.handle}>
                <div className="relative">
                  <Link href={`/products/${item.handle}`} className="relative block aspect-[4/5] bg-[#f2f2f2]">
                    {item.image ? (
                      <Image src={item.image} alt={item.title} fill sizes="(min-width: 750px) 23vw, 40vw" className="object-cover" />
                    ) : null}
                  </Link>
                  <WishlistButton product={item} className="absolute top-0 right-0" />
                  <div className="mt-2 px-1 text-[9px] leading-[13.5px] tab:text-[12px] tab:leading-[18px] desk:mt-1.5 desk:flex desk:justify-between desk:gap-6 desk:px-[3px]">
                    <Link href={`/products/${item.handle}`} className="block truncate tracking-[1px]">
                      {item.title}
                    </Link>
                    <span className="mt-[3px] block shrink-0 tracking-[1.2px] uppercase desk:mt-0">
                      {formatPrice(item.price)}
                    </span>
                  </div>
                </div>
              </SliderItem>
            ))}
          </Slider>
        </div>
      )}
    </section>
  );
}
