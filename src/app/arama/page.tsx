import type { Metadata } from "next";
import { ProductSearch } from "@/components/sites/strale/product-search";
import { PageHeading, StoreShell } from "@/components/sites/strale/store-shell";
import { getProducts } from "@/lib/store-data";

export const metadata: Metadata = { title: "Ürün Ara" };

export default async function SearchPage() {
  const products = (await getProducts()).filter((p) => p.stock > 0);
  return (
    <StoreShell>
      <PageHeading title="Ürün Ara" />
      <ProductSearch products={products} />
    </StoreShell>
  );
}
