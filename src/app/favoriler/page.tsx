import type { Metadata } from "next";
import { FavouritesPage } from "@/components/sites/strale/checkout/favourites-page";
import { PageHeading, StoreShell } from "@/components/sites/strale/store-shell";

export const metadata: Metadata = { title: "Favorilerim", robots: { index: false } };

export default function Page() {
  return (
    <StoreShell>
      <PageHeading title="Favorilerim" />
      <FavouritesPage />
    </StoreShell>
  );
}
