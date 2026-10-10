import type { Metadata } from "next";
import { ProductSearch } from "@/components/sites/strale/product-search";
import { PageHeading, StoreShell } from "@/components/sites/strale/store-shell";

export const metadata: Metadata = { title: "Ürün Ara" };

export default function SearchPage() {
  return (
    <StoreShell>
      <PageHeading title="Ürün Ara" />
      <ProductSearch />
    </StoreShell>
  );
}
