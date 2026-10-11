import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { collectionSlugs, getCollection } from "@/components/sites/strale/catalog";
import { ProductGrid } from "@/components/sites/strale/product-grid";
import { PageHeading, StoreShell } from "@/components/sites/strale/store-shell";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return collectionSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const collection = getCollection((await params).slug);
  return collection ? { title: collection.title, description: collection.description } : {};
}

export default async function CollectionPage({ params }: Props) {
  const collection = getCollection((await params).slug);
  if (!collection) notFound();

  return (
    <StoreShell>
      <PageHeading eyebrow="Koleksiyon" title={collection.title}>
        <p>{collection.description}</p>
      </PageHeading>
      <ProductGrid
        products={collection.products}
        emptyText="Bu bölümde şu an stokta ürün yok. Yeni stoklar her hafta geliyor."
      />
    </StoreShell>
  );
}
