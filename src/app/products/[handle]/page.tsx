import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, getProducts } from "@/components/sites/reigningchamp/catalog";
import { ProductGridCard } from "@/components/sites/reigningchamp/product-grid-card";
import {
  buildProductView,
  flatImage,
  getProductDetail,
  lineupProducts,
  relatedProducts,
} from "@/components/sites/reigningchamp/product/product-data";
import { ProductView } from "@/components/sites/reigningchamp/product/product-view";
import { RecentlyViewedRow } from "@/components/sites/reigningchamp/product/recently-viewed-row";
import { Slider } from "@/components/sites/reigningchamp/slider";

type Props = { params: Promise<{ handle: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(getProducts()).map((handle) => ({ handle }));
}

const plainText = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;| /g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const product = getProduct(handle);
  if (!product) return {};
  const details = getProductDetail(handle);
  const description = plainText(details?.description ?? "").slice(0, 300) || undefined;
  const image = flatImage(product);
  return {
    title: `${product.title} | Reigning Champ`,
    description,
    openGraph: {
      title: product.title,
      description,
      type: "website",
      images: image ? [{ url: image.src, width: image.width, height: image.height, alt: product.title }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params;
  const product = getProduct(handle);
  const details = getProductDetail(handle);
  if (!product || !details) notFound();

  const view = buildProductView(product, details);
  const related = relatedProducts(details);
  const lineup = lineupProducts(product);

  return (
    <div className="pb-6">
      <ProductView product={view} />

      {related ? (
        <section className="mt-12 px-3 tab:mt-[72px] tab:px-8">
          <div className="flex items-end justify-between">
            <h2 className="font-rc-med tracking-[1.2px] uppercase tab:text-[16px] tab:leading-6">{related.title}</h2>
            {related.href ? (
              <Link href={related.href} className="hidden text-[16px] leading-6 rc-underline tab:block">
                View All
              </Link>
            ) : null}
          </div>
          <ul className="mt-3 grid grid-cols-2 gap-x-1.5 gap-y-3 desk:grid-cols-3 desk:gap-y-1.5">
            {related.items.map((item) => (
              <li key={item.handle} className="desk:pb-[22px]">
                <ProductGridCard product={item} sizes="(min-width: 990px) 32vw, 50vw" />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {lineup.length ? (
        <section className="mt-12 tab:mt-14">
          <h2 className="px-3 font-rc-med tracking-[1.2px] uppercase tab:px-8 tab:text-[16px] tab:leading-6">
            Expand your lineup
          </h2>
          <div className="mt-3">
            <Slider label="Expand your lineup">
              {lineup.map((item) => (
                <li key={item.handle} className="w-[66vw] shrink-0 snap-start tab:w-[calc(22.29vw-1px)]">
                  <ProductGridCard product={item} sizes="(min-width: 750px) 23vw, 66vw" />
                </li>
              ))}
            </Slider>
          </div>
        </section>
      ) : null}

      <RecentlyViewedRow exclude={product.handle} />
    </div>
  );
}
