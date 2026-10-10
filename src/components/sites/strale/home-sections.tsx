import Link from "next/link";
import { allProducts, categories, formatPrice, getCollection } from "./catalog";
import { media } from "./media";
import { MediaSlot } from "./media-slot";
import { ProductCard } from "./product-card";
import { RecentlyViewedList } from "./recently-viewed";
import { siteConfig } from "./site-config";
import { Slider, SliderItem } from "./slider";

/* Layout and type scale follow the cloned homepage 1:1 (docs/research/reigningchamp/page-brief.md). */

export function AnnouncementBar() {
  return (
    <div className="flex h-[42px] items-center justify-center bg-ink px-3 text-bone tab:justify-between tab:px-8">
      <p className="whitespace-nowrap">
        İhraç fazlası ürünlerde %50’ye varan indirim.{" "}
        <Link href="/koleksiyonlar/yeni-gelenler" className="st-underline">
          Alışverişe Başla
        </Link>
      </p>
      <p className="hidden whitespace-nowrap tab:block">
        {formatPrice(siteConfig.freeShippingThreshold)} üzeri siparişlerde ücretsiz kargo
      </p>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 px-3 st-heading text-[12px] leading-[18px] tab:px-8 tab:text-[16px] tab:leading-6">
      {children}
    </h2>
  );
}

export function Hero() {
  const href = "/koleksiyonlar/yeni-gelenler";
  return (
    <section className="relative -mt-[60px] aspect-[4/5] w-full overflow-hidden text-bone tab:aspect-auto tab:h-[calc(100dvh-42px)]">
      <Link href={href} aria-label="İhracat Kalitesi, Stok Fiyatı" className="absolute inset-0">
        <MediaSlot media={media.hero} sizes="100vw" tone="dark" priority />
      </Link>
      <div className="pointer-events-none absolute bottom-8 left-3 tab:left-8">
        <h2 className="st-display text-[34px] leading-[36px] tab:text-[56px] tab:leading-[58px]">
          <Link href={href} className="pointer-events-auto">
            İhracat Kalitesi, Stok Fiyatı
          </Link>
        </h2>
        <p className="mt-2 text-[12px] leading-[18px] tab:text-[16px] tab:leading-6">
          Yurt dışı siparişlerden artan, sınırlı sayıdaki parçalar.
        </p>
        <Link
          href={href}
          className="pointer-events-auto mt-4 inline-block text-[12px] leading-[18px] st-label st-underline tab:text-[16px] tab:leading-6"
        >
          Yeni Gelenler
        </Link>
      </div>
    </section>
  );
}

export function NewArrivals() {
  const products = allProducts.filter((p) => p.stock > 0).slice(0, 12);
  return (
    <section className="pt-6 pb-8 tab:pb-[30px]">
      <SectionHeading>Yeni Gelenler</SectionHeading>
      <Slider label="Yeni Gelenler">
        {products.map((product, index) => (
          <SliderItem key={product.handle}>
            <ProductCard product={product} priority={index < 5} />
          </SliderItem>
        ))}
      </Slider>
    </section>
  );
}

const contentCards = [
  { title: "Eşofman & Sweat", text: "Fabrika fazlası sweat ve eşofmanlar.", href: "/koleksiyonlar/esofman" },
  { title: "Dış Giyim", text: "Avrupa siparişlerinden artan yün ve polar ceketler.", href: "/koleksiyonlar/dis-giyim" },
];

export function ContentCards() {
  return (
    <section className="grid gap-[3px] px-3 py-6 tab:grid-cols-2 tab:gap-1.5 tab:px-8">
      {contentCards.map((card, index) => (
        <Link key={card.title} href={card.href} className="relative block aspect-[4/5] overflow-hidden text-bone">
          <MediaSlot media={media.contentCards[index]} sizes="(min-width: 750px) 50vw, 100vw" tone="dark" />
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(to_top,rgba(21,20,18,0.85),rgba(21,20,18,0),rgba(21,20,18,0))]"
          />
          <div className="absolute right-[18px] bottom-[45px] left-[18px] tab:right-[38px] tab:bottom-11 tab:left-[38px]">
            <h3 className="st-heading text-[12px] leading-6 tab:text-[16px] tab:leading-8">{card.title}</h3>
            <p className="text-[12px] leading-[18px] tab:text-[16px] tab:leading-6">{card.text}</p>
            <span className="mt-4 inline-block text-[12px] leading-[18px] st-label st-underline tab:text-[16px] tab:leading-6">
              Alışverişe Başla
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}

export function ShopByCategory() {
  const withStock = categories.filter((category) => (getCollection(category.slug)?.products.length ?? 0) > 0);
  return (
    <section className="pt-6 pb-9">
      <SectionHeading>Kategoriler</SectionHeading>
      <Slider label="Kategoriler">
        {withStock.map((category) => (
          <SliderItem key={category.slug}>
            <Link href={`/koleksiyonlar/${category.slug}`} className="block">
              <span className="relative block aspect-[4/5] overflow-hidden bg-stone">
                <MediaSlot media={media.categories[category.slug]} sizes="(min-width: 750px) 23vw, 40vw" tone="light" />
              </span>
              <h3 className="mt-3 px-1.5 text-[9px] leading-[13.5px] st-label tab:text-[12px] tab:leading-[18px]">
                {category.label}
              </h3>
            </Link>
          </SliderItem>
        ))}
      </Slider>
    </section>
  );
}

export function Banner() {
  return (
    <section className="px-3 tab:px-8">
      <Link
        href="/koleksiyonlar/son-bedenler"
        className="relative block aspect-[4/5] overflow-hidden text-bone tab:aspect-auto tab:h-[600px]"
      >
        <span className="absolute inset-0 hidden tab:block">
          <MediaSlot media={media.banner.desktop} sizes="100vw" tone="dark" />
        </span>
        <span className="absolute inset-0 tab:hidden">
          <MediaSlot media={media.banner.mobile} sizes="100vw" tone="dark" />
        </span>
        <div className="absolute bottom-[33px] left-3 tab:bottom-8 tab:left-8">
          <h2 className="st-heading text-[12px] leading-[18px] tab:text-[16px] tab:leading-6">Son Bedenler</h2>
          <p className="mt-2 text-[12px] leading-[18px] tab:text-[16px] tab:leading-6">
            Tek ya da birkaç adet kalan parçalar, en düşük fiyatlarla.
          </p>
          <span className="mt-4 inline-block text-[12px] leading-[18px] st-label st-underline tab:text-[16px] tab:leading-6">
            Alışverişe Başla
          </span>
        </div>
      </Link>
    </section>
  );
}

export function RecentlyViewed() {
  return (
    <section className="pt-9 pb-12">
      <h2 className="px-3 st-heading text-[12px] leading-[18px] tab:px-8 tab:text-[16px] tab:leading-6">
        Son Görüntülenenler
      </h2>
      <RecentlyViewedList />
    </section>
  );
}
