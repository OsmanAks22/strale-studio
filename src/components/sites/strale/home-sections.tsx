import Link from "next/link";
import { allProducts, categories, formatPrice, getCollection } from "./catalog";
import { surplusFacts, trustItems } from "./data";
import { CaretIcon, StraleMarkTwin } from "./icons";
import { ProductCard } from "./product-card";
import { siteConfig } from "./site-config";
import { Slider, SliderItem } from "./slider";

export function AnnouncementBar() {
  return (
    <div className="flex h-[42px] items-center justify-center bg-ink px-3 text-bone tab:justify-between tab:px-8">
      <p className="truncate">
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

function SectionHeading({ children, href }: { children: React.ReactNode; href?: string }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-4 px-3 tab:px-8">
      <h2 className="st-heading text-[12px] leading-[18px] tab:text-[15px] tab:leading-6">{children}</h2>
      {href ? (
        <Link href={href} className="st-label st-underline shrink-0 text-[11px] tab:text-[12px]">
          Tümünü Gör
        </Link>
      ) : null}
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative -mt-[60px] flex min-h-[560px] w-full flex-col justify-end overflow-hidden bg-ink px-3 pt-[120px] pb-10 text-bone tab:h-[calc(88dvh-42px)] tab:px-8 tab:pb-14">
      <StraleMarkTwin
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 -right-[12%] h-auto w-[78%] -translate-y-1/2 fill-smoke tab:-right-[4%] tab:w-[52%]"
      />
      <div className="relative max-w-[760px]">
        <p className="st-micro text-[10px] text-ash tab:text-[12px]">İhraç fazlası giyim · Sınırlı stok</p>
        <h1 className="st-display mt-4 text-[44px] leading-[44px] tab:text-[88px] tab:leading-[84px]">
          İhracat Kalitesi,
          <br />
          <span className="text-rust">Stok</span> Fiyatı
        </h1>
        <p className="mt-5 max-w-[460px] text-[13px] leading-5 text-sand tab:text-[16px] tab:leading-6">
          Yurt dışı siparişlerden artan, sınırlı sayıdaki parçalar. Önceki fiyatının yarısına, bittiğinde yenisi
          gelmez.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/koleksiyonlar/yeni-gelenler"
            className="st-label inline-flex h-12 items-center bg-bone px-6 text-ink transition-colors hover:bg-sand"
          >
            Yeni Gelenleri Gör
          </Link>
          <Link
            href="/koleksiyonlar/tumu"
            className="st-label inline-flex h-12 items-center border border-ash px-6 transition-colors hover:border-bone"
          >
            Tüm Ürünler
          </Link>
        </div>
      </div>
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

export function NewArrivals() {
  const products = allProducts.filter((p) => p.stock > 0).slice(0, 12);
  return (
    <section className="pt-8 pb-8 tab:pt-10">
      <SectionHeading href="/koleksiyonlar/yeni-gelenler">Bu Hafta Gelen Stoklar</SectionHeading>
      <Slider label="Bu Hafta Gelen Stoklar">
        {products.map((product, index) => (
          <SliderItem key={product.handle}>
            <ProductCard product={product} priority={index < 4} />
          </SliderItem>
        ))}
      </Slider>
    </section>
  );
}

export function CategoryGrid() {
  const withCounts = categories
    .map((category) => ({ ...category, count: getCollection(category.slug)?.products.length ?? 0 }))
    .filter((category) => category.count > 0);
  return (
    <section className="pt-6 pb-8">
      <SectionHeading>Kategoriler</SectionHeading>
      <ul className="grid grid-cols-2 gap-1 px-3 tab:grid-cols-4 tab:gap-1.5 tab:px-8">
        {withCounts.map((category) => (
          <li key={category.slug}>
            <Link
              href={`/koleksiyonlar/${category.slug}`}
              className="group flex h-[96px] flex-col justify-between bg-stone p-3 transition-colors hover:bg-sand tab:h-[140px] tab:p-5"
            >
              <span className="flex items-start justify-between">
                <span className="st-display text-[22px] leading-6 tab:text-[32px] tab:leading-8">{category.label}</span>
                <CaretIcon className="size-4 transition-transform group-hover:translate-x-1 tab:size-5" />
              </span>
              <span className="text-graphite">{category.count} ürün</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function PromoBlocks() {
  const blocks = [
    {
      title: "%50 ve Üzeri İndirim",
      text: "Önceki fiyatının en az yarısına satılan parçalar.",
      href: "/koleksiyonlar/yuzde-50-ustu",
      className: "bg-ink text-bone",
    },
    {
      title: "Son Bedenler",
      text: "Tek ya da birkaç adet kalan parçalar. Bittiğinde yenisi gelmez.",
      href: "/koleksiyonlar/son-bedenler",
      className: "bg-rust text-bone",
    },
  ];
  return (
    <section className="grid gap-1 px-3 py-6 tab:grid-cols-2 tab:gap-1.5 tab:px-8">
      {blocks.map((block) => (
        <Link
          key={block.title}
          href={block.href}
          className={`flex min-h-[240px] flex-col justify-end p-5 tab:min-h-[360px] tab:p-10 ${block.className}`}
        >
          <h3 className="st-display text-[32px] leading-[34px] tab:text-[48px] tab:leading-[50px]">{block.title}</h3>
          <p className="mt-2 max-w-[380px] text-[13px] leading-5 tab:text-[16px] tab:leading-6">{block.text}</p>
          <span className="st-label st-underline mt-5 self-start">Keşfet</span>
        </Link>
      ))}
    </section>
  );
}

export function SurplusExplainer() {
  return (
    <section className="px-3 pt-6 pb-14 tab:px-8">
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
