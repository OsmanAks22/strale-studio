import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCollection, getProducts, type Product } from "@/components/sites/reigningchamp/catalog";
import { Breadcrumbs, ListingBanner, ListingTabs } from "@/components/sites/reigningchamp/collection/collection-header";
import {
  applyFilters,
  toListingItem,
  COLLECTION_SORTS,
  isCurrentHref,
  readSort,
  sortProducts,
  toQueryPairs,
  type SearchParamsRecord,
} from "@/components/sites/reigningchamp/collection/facets";
import { Listing } from "@/components/sites/reigningchamp/collection/listing";
import { RecentlyViewed } from "@/components/sites/reigningchamp/recently-viewed";

type Props = {
  params: Promise<{ handle: string }>;
  searchParams: Promise<SearchParamsRecord>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const collection = getCollection(handle);
  return { title: collection?.title ?? "Collection" };
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const [{ handle }, query] = await Promise.all([params, searchParams]);
  const collection = getCollection(handle);
  if (!collection) notFound();

  const all = getProducts();
  const products = collection.products.map((h) => all[h]).filter((p): p is Product => Boolean(p));
  const { products: filtered, groups } = applyFilters(products, query, collection.facets);
  const sort = readSort(query, COLLECTION_SORTS);
  const pairs = toQueryPairs(query);
  const basePath = `/collections/${collection.handle}`;
  const paths = [basePath, `/collections/${handle}`];

  const description =
    collection.description &&
    ![collection.heading, collection.title].some((t) => t.toLowerCase() === collection.description.toLowerCase())
      ? collection.description
      : null;

  return (
    <>
      <Breadcrumbs />
      <ListingBanner heading={collection.heading} description={description} />
      <ListingTabs tabs={collection.tabs.map((tab) => ({ ...tab, active: isCurrentHref(tab.href, paths, pairs) }))} />
      <Listing
        basePath={basePath}
        query={pairs}
        groups={groups}
        quickFacets={groups.slice(0, 3).map((g) => g.name)}
        sortOptions={COLLECTION_SORTS}
        sort={sort.value}
        items={sortProducts(filtered, sort.value).map(toListingItem)}
      />
      <RecentlyViewed />
    </>
  );
}
