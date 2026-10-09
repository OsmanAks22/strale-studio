import Image from "next/image";
import {
  ASSET_ROOT,
  FREE_SHIPPING_THRESHOLD,
  categories,
  contentCards,
  formatPrice,
  newArrivals,
  storeUrl,
  surplusFacts,
  trustItems,
} from "./data";
import { ProductCard } from "./product-card";
import { Slider, SliderItem } from "./slider";

export function AnnouncementBar() {
  return (
    <div className="flex h-[42px] items-center justify-center bg-ink px-3 text-bone tab:justify-between tab:px-8">
      <p className="whitespace-nowrap">
        İhraç fazlası ürünlerde %50’ye varan indirim.{" "}
        <a href={storeUrl("/koleksiyonlar/yeni-gelenler")} className="st-underline">
          Alışverişe Başla
        </a>
      </p>
      <p className="hidden whitespace-nowrap tab:block">{formatPrice(FREE_SHIPPING_THRESHOLD)} üzeri siparişlerde ücretsiz kargo</p>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 px-3 st-heading text-[12px] leading-[18px] tab:px-8 tab:text-[15px] tab:leading-6">
      {children}
    </h2>
  );
}

export function Hero() {
  const href = storeUrl("/koleksiyonlar/yeni-gelenler");
  return (
    <section className="relative -mt-[60px] aspect-[4/5] w-full overflow-hidden text-bone tab:aspect-auto tab:h-[calc(100dvh-42px)]">
      <a href={href} aria-label="İhracat Kalitesi, Stok Fiyatı" className="absolute inset-0">
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
        <h2 className="st-display text-[34px] leading-[36px] tab:text-[56px] tab:leading-[58px]">
          <a href={href} className="pointer-events-auto">
            İhracat Kalitesi,
            <br />
            Stok Fiyatı
          </a>
        </h2>
        <p className="mt-2 text-[12px] leading-[18px] tab:text-[16px] tab:leading-6">
          Yurt dışı siparişlerden artan, sınırlı sayıdaki parçalar. Etiket fiyatının yarısına.
        </p>
        <a
          href={href}
          className="pointer-events-auto mt-4 inline-block text-[12px] leading-[18px] st-label st-underline tab:text-[16px] tab:leading-6"
        >
          Yeni Gelen Stokları Gör
        </a>
      </div>
    </section>
  );
}

export function NewArrivals() {
  return (
    <section className="pt-6 pb-8 tab:pb-[30px]">
      <SectionHeading>Bu Hafta Gelen Stoklar</SectionHeading>
      <Slider label="Bu Hafta Gelen Stoklar">
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
        <a key={card.title} href={storeUrl(card.href)} className="relative block aspect-[4/5] text-bone">
          <Image src={card.image} alt="" fill sizes="(min-width: 750px) 50vw, 100vw" className="object-cover" />
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(to_top,rgba(21,20,18,0.85),rgba(21,20,18,0),rgba(21,20,18,0))]"
          />
          <div className="absolute right-[18px] bottom-[45px] left-[18px] tab:right-[38px] tab:bottom-11 tab:left-[38px]">
            <h3 className="st-heading text-[12px] leading-6  tab:text-[16px] tab:leading-8">
              {card.title}
            </h3>
            <p className="text-[12px] leading-[18px] tab:text-[16px] tab:leading-6">{card.text}</p>
            <span className="mt-4 inline-block text-[12px] leading-[18px] st-label st-underline tab:text-[16px] tab:leading-6">
              Keşfet
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
      <SectionHeading>Kategoriler</SectionHeading>
      <Slider label="Kategoriler">
        {categories.map((category) => (
          <SliderItem key={category.slug}>
            <a href={storeUrl(category.href)} className="block">
              <span className="relative block aspect-[4/5] bg-stone">
                <Image
                  src={`${ASSET_ROOT}/images/categories/${category.slug}.jpg`}
                  alt={category.label}
                  fill
                  sizes="(min-width: 750px) 23vw, 40vw"
                  className="object-cover"
                />
              </span>
              <h3 className="mt-3 px-1.5 text-[9px] leading-[13.5px] st-label tab:text-[12px] tab:leading-[18px]">
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
  const href = storeUrl("/koleksiyonlar/son-bedenler");
  return (
    <section className="px-3 tab:px-8">
      <a href={href} className="relative block aspect-[4/5] overflow-hidden text-bone tab:aspect-auto tab:h-[600px]">
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
          <h2 className="st-heading text-[12px] leading-[18px]  tab:text-[16px] tab:leading-6">
            Son Bedenler
          </h2>
          <p className="mt-2 text-[12px] leading-[18px] tab:text-[16px] tab:leading-6">
            Tek beden kalan parçalar, en düşük fiyatlarla. Bittiğinde yenisi gelmez.
          </p>
          <span className="mt-4 inline-block text-[12px] leading-[18px] st-label st-underline tab:text-[16px] tab:leading-6">
            Keşfet
          </span>
        </div>
      </a>
    </section>
  );
}

export function RecentlyViewed() {
  return (
    <section className="px-3 pt-9 pb-12 tab:px-8">
      <h2 className="st-heading text-[12px] leading-[18px]  tab:text-[16px] tab:leading-6">
        Son Görüntülenenler
      </h2>
      <p className="mt-8">Henüz görüntülediğiniz bir ürün yok.</p>
      <a href={storeUrl("/koleksiyonlar/yeni-gelenler")} className="mt-1.5 inline-block st-underline">
        Yeni Gelenleri Keşfet
      </a>
    </section>
  );
}

export function TrustBar() {
  return (
    <section aria-label="Alışveriş güvencesi" className="border-b border-sand px-3 py-5 tab:px-8">
      <ul className="grid grid-cols-2 gap-x-3 gap-y-4 desk:grid-cols-4">
        {trustItems.map((item) => (
          <li key={item.title}>
            <p className="st-label">{item.title}</p>
            <p className="mt-0.5 text-graphite">{item.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SurplusExplainer() {
  return (
    <section className="px-3 pt-12 tab:px-8">
      <div className="bg-stone px-4 py-8 tab:px-8 tab:py-12">
        <h2 className="st-display text-[28px] leading-[30px] tab:text-[40px] tab:leading-[42px]">İhraç Fazlası Nedir?</h2>
        <div className="mt-6 grid gap-6 tab:grid-cols-3 tab:gap-8">
          {surplusFacts.map((fact) => (
            <div key={fact.title}>
              <h3 className="st-heading text-[12px] tab:text-[13px]">{fact.title}</h3>
              <p className="mt-2 text-[12px] leading-[18px] tab:text-[14px] tab:leading-[22px]">{fact.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
