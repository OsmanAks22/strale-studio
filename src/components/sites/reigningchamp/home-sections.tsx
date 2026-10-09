import Image from "next/image";
import { ASSET_ROOT, categories, contentCards, newArrivals, sourceUrl } from "./data";
import { ProductCard } from "./product-card";
import { Slider, SliderItem } from "./slider";

export function AnnouncementBar() {
  return (
    <div className="flex h-[42px] items-center justify-center bg-black px-3 text-white tab:justify-between tab:px-8">
      <p className="whitespace-nowrap">
        New In: Fall ‘26 Arrivals.{" "}
        <a href={sourceUrl("/collections/mens-latest")} className="rc-underline">
          Shop New
        </a>
      </p>
      <p className="hidden whitespace-nowrap tab:block">Free shipping on US orders $50+</p>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 px-3 font-rc-med text-[12px] leading-[18px] tracking-[1.2px] uppercase tab:px-8 tab:text-[16px] tab:leading-6">
      {children}
    </h2>
  );
}

export function Hero() {
  const href = sourceUrl("/collections/mens-latest");
  return (
    <section className="relative -mt-[60px] aspect-[4/5] w-full overflow-hidden text-white tab:aspect-auto tab:h-[calc(100dvh-42px)]">
      <a href={href} aria-label="Refined Utility" className="absolute inset-0">
        <video
          className="size-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={`${ASSET_ROOT}/video/hero-refined-utility-poster.jpg`}
        >
          <source src={`${ASSET_ROOT}/video/hero-refined-utility.mp4`} type="video/mp4" />
        </video>
      </a>
      <div className="pointer-events-none absolute bottom-8 left-3 tab:left-8">
        <h2 className="font-rc-cond text-[32px] leading-[40px] tracking-[1.5px] uppercase tab:text-[48px] tab:leading-[60px] tab:tracking-[1px]">
          <a href={href} className="pointer-events-auto">
            Refined Utility
          </a>
        </h2>
        <p className="mt-2 text-[12px] leading-[18px] tab:text-[16px] tab:leading-6">
          Timeless interpretations of place and purpose.
        </p>
        <a
          href={href}
          className="pointer-events-auto mt-4 inline-block text-[12px] leading-[18px] tracking-[1.2px] uppercase rc-underline tab:text-[16px] tab:leading-6"
        >
          Shop New
        </a>
      </div>
    </section>
  );
}

export function NewArrivals() {
  return (
    <section className="pt-6 pb-8 tab:pb-[30px]">
      <SectionHeading>New Arrivals</SectionHeading>
      <Slider label="New Arrivals">
        {newArrivals.map((product, index) => (
          <SliderItem key={product.handle}>
            <ProductCard product={product} index={index} />
          </SliderItem>
        ))}
      </Slider>
    </section>
  );
}

export function ContentCards() {
  return (
    <section className="grid gap-[3px] px-3 py-6 tab:grid-cols-2 tab:gap-1.5 tab:px-8">
      {contentCards.map((card) => (
        <a key={card.title} href={sourceUrl(card.href)} className="relative block aspect-[4/5] text-white">
          <Image src={card.image} alt="" fill sizes="(min-width: 750px) 50vw, 100vw" className="object-cover" />
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(to_top,rgba(51,51,51,0.9),rgba(51,51,51,0),rgba(0,0,0,0))]"
          />
          <div className="absolute right-[18px] bottom-[45px] left-[18px] tab:right-[38px] tab:bottom-11 tab:left-[38px]">
            <h3 className="font-rc-med text-[12px] leading-6 tracking-[1.2px] uppercase tab:text-[16px] tab:leading-8">
              {card.title}
            </h3>
            <p className="text-[12px] leading-[18px] tab:text-[16px] tab:leading-6">{card.text}</p>
            <span className="mt-4 inline-block text-[12px] leading-[18px] tracking-[1.2px] uppercase rc-underline tab:text-[16px] tab:leading-6">
              Shop Now
            </span>
          </div>
        </a>
      ))}
    </section>
  );
}

export function ShopByCategory() {
  return (
    <section className="pt-6 pb-9">
      <SectionHeading>Shop by Category</SectionHeading>
      <Slider label="Shop by Category">
        {categories.map((category) => (
          <SliderItem key={category.slug}>
            <a href={sourceUrl(category.href)} className="block">
              <span className="relative block aspect-[4/5] bg-[#f2f2f2]">
                <Image
                  src={`${ASSET_ROOT}/images/categories/${category.slug}.jpg`}
                  alt={category.label}
                  fill
                  sizes="(min-width: 750px) 23vw, 40vw"
                  className="object-cover"
                />
              </span>
              <h3 className="mt-3 px-1.5 text-[9px] leading-[13.5px] tracking-[1.2px] uppercase tab:text-[12px] tab:leading-[18px]">
                {category.label}
              </h3>
            </a>
          </SliderItem>
        ))}
      </Slider>
    </section>
  );
}

export function PerformanceBanner() {
  const href = sourceUrl("/collections/mens-performance-clothing");
  return (
    <section className="px-3 tab:px-8">
      <a href={href} className="relative block aspect-[4/5] overflow-hidden text-white tab:aspect-auto tab:h-[600px]">
        <video
          className="hidden size-full object-cover tab:block"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={`${ASSET_ROOT}/video/performance-desktop-poster.jpg`}
        >
          <source src={`${ASSET_ROOT}/video/performance-desktop.mp4`} type="video/mp4" />
        </video>
        <video
          className="size-full object-cover tab:hidden"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={`${ASSET_ROOT}/video/performance-mobile-poster.jpg`}
        >
          <source src={`${ASSET_ROOT}/video/performance-mobile.mp4`} type="video/mp4" />
        </video>
        <div className="absolute bottom-[33px] left-3 tab:bottom-8 tab:left-8">
          <h2 className="font-rc-med text-[12px] leading-[18px] tracking-[1.2px] uppercase tab:text-[16px] tab:leading-6">
            Performance
          </h2>
          <p className="mt-2 text-[12px] leading-[18px] tab:text-[16px] tab:leading-6">
            From active routines to everyday wear.
          </p>
          <span className="mt-4 inline-block text-[12px] leading-[18px] tracking-[1.2px] uppercase rc-underline tab:text-[16px] tab:leading-6">
            Shop Now
          </span>
        </div>
      </a>
    </section>
  );
}

export function RecentlyViewed() {
  return (
    <section className="px-3 pt-9 pb-12 tab:px-8">
      <h2 className="font-rc-med text-[12px] leading-[18px] tracking-[1.2px] uppercase tab:text-[16px] tab:leading-6">
        Recently Viewed
      </h2>
      <p className="mt-8">There are no recently viewed items to show.</p>
      <a href={sourceUrl("/collections/mens-latest")} className="mt-1.5 inline-block rc-underline">
        Shop New Arrivals
      </a>
    </section>
  );
}
