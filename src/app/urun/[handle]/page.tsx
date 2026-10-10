import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  allProducts,
  categoryLabel,
  discountPercent,
  formatPrice,
  getProduct,
  productTitle,
} from "@/components/sites/strale/catalog";
import { OrderPanel } from "@/components/sites/strale/order-panel";
import { ProductCard } from "@/components/sites/strale/product-card";
import { ProductImage } from "@/components/sites/strale/product-image";
import { RecentlyViewedList, TrackRecentlyViewed } from "@/components/sites/strale/recently-viewed";
import { siteConfig } from "@/components/sites/strale/site-config";
import { Slider, SliderItem } from "@/components/sites/strale/slider";
import { StoreShell } from "@/components/sites/strale/store-shell";

type Props = { params: Promise<{ handle: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return allProducts.map((product) => ({ handle: product.handle }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProduct((await params).handle);
  if (!product) return {};
  return {
    title: productTitle(product),
    description: `${productTitle(product)} — ihraç fazlası, ${formatPrice(product.price)}. Bedenler: ${product.sizes.join(", ")}.`,
  };
}

export default async function ProductPage({ params }: Props) {
  const product = getProduct((await params).handle);
  if (!product) notFound();

  const discount = discountPercent(product);
  const related = allProducts.filter((p) => p.category === product.category && p.handle !== product.handle && p.stock > 0);
  const url = siteConfig.domain ? `https://${siteConfig.domain}/urun/${product.handle}` : `/urun/${product.handle}`;

  const details = [
    { label: "Durum", value: product.condition === "hafif-kusurlu" ? "Hafif kusurlu" : "Kusursuz" },
    { label: "Kumaş", value: product.fabric },
    { label: "Kaynak", value: product.origin },
    { label: "Kargo", value: `${siteConfig.dispatchDays} iş gününde kargoda. ${formatPrice(siteConfig.freeShippingThreshold)} üzeri ücretsiz.` },
    { label: "İade", value: `Teslimattan itibaren ${siteConfig.returnDays} gün içinde iade veya değişim.` },
  ].filter((row): row is { label: string; value: string } => Boolean(row.value));

  return (
    <StoreShell>
      <TrackRecentlyViewed handle={product.handle} />
      <nav aria-label="Sayfa yolu" className="px-3 pt-6 text-graphite tab:px-8">
        <Link href="/" className="st-hover-underline">
          Ana Sayfa
        </Link>
        {" / "}
        <Link href={`/koleksiyonlar/${product.category}`} className="st-hover-underline">
          {categoryLabel(product.category)}
        </Link>
      </nav>

      <div className="grid gap-6 px-3 pt-4 pb-12 tab:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] tab:gap-8 tab:px-8 desk:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] desk:gap-12">
        <div className="relative">
          <ProductImage product={product} sizes="(min-width: 990px) 58vw, (min-width: 750px) 50vw, 100vw" priority />
          {discount > 0 ? (
            <span className="absolute top-3 left-3 text-[12px] leading-[9.6px] tracking-[1px] text-rust uppercase">-%{discount}</span>
          ) : null}
        </div>

        <div className="tab:sticky tab:top-[76px] tab:self-start">
          <p className="st-micro text-[10px] text-graphite">
            İhraç fazlası · {categoryLabel(product.category)}
          </p>
          <h1 className="mt-2 st-heading text-[14px] leading-[22px] tab:text-[16px] tab:leading-6">{product.name}</h1>
          {product.color ? <p className="mt-1 text-graphite">Renk: {product.color}</p> : null}

          <p className="mt-4 flex items-baseline gap-3">
            <span className="st-label text-[14px] tab:text-[16px]">
              {formatPrice(product.price)}
            </span>
            {discount > 0 && product.listPrice ? (
              <>
                <s className="text-[14px] text-graphite tab:text-[16px]">
                  <span className="sr-only">Önceki fiyat: </span>
                  {formatPrice(product.listPrice)}
                </s>
                <span className="st-label text-rust">%{discount} indirim</span>
              </>
            ) : null}
          </p>
          {discount > 0 ? (
            <p className="mt-1 text-[11px] text-graphite">Üstü çizili fiyat, son 30 gündeki en düşük satış fiyatımızdır.</p>
          ) : null}

          {product.condition === "hafif-kusurlu" ? (
            <div className="mt-5 border border-rust p-3">
              <p className="st-label text-rust">Hafif kusurlu ürün</p>
              <p className="mt-1">{product.note ?? "Küçük bir üretim kusuru bulunur; detay için bize yazın."}</p>
            </div>
          ) : null}

          <div className="mt-6">
            <OrderPanel product={product} url={url} />
          </div>

          <dl className="mt-8 border-t border-sand">
            {details.map((row) => (
              <div key={row.label} className="grid grid-cols-[96px_1fr] gap-3 border-b border-sand py-3">
                <dt className="st-micro pt-0.5 text-[10px] text-graphite">{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {related.length ? (
        <section className="pb-14">
          <h2 className="mb-3 px-3 st-heading text-[12px] leading-[18px] tab:px-8 tab:text-[16px] tab:leading-6">Benzer Ürünler</h2>
          <Slider label="Benzer Ürünler">
            {related.slice(0, 8).map((item) => (
              <SliderItem key={item.handle}>
                <ProductCard product={item} />
              </SliderItem>
            ))}
          </Slider>
        </section>
      ) : null}

      <section className="pt-3 pb-12">
        <h2 className="px-3 st-heading text-[12px] leading-[18px] tab:px-8 tab:text-[16px] tab:leading-6">
          Son Görüntülenenler
        </h2>
        <RecentlyViewedList exclude={product.handle} />
      </section>
    </StoreShell>
  );
}
