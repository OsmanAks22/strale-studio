import type { Metadata } from "next";
import { CartPage } from "@/components/sites/strale/checkout/cart-page";
import { PageHeading, StoreShell } from "@/components/sites/strale/store-shell";

export const metadata: Metadata = { title: "Sepetim", robots: { index: false } };

export default function Page() {
  return (
    <StoreShell>
      <PageHeading title="Sepetim" />
      <CartPage />
    </StoreShell>
  );
}
