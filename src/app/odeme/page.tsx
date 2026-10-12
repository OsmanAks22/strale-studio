import type { Metadata } from "next";
import { CheckoutPage } from "@/components/sites/strale/checkout/checkout-page";
import { PageHeading, StoreShell } from "@/components/sites/strale/store-shell";

export const metadata: Metadata = { title: "Siparişi Tamamla", robots: { index: false } };

export default function Page() {
  return (
    <StoreShell>
      <PageHeading title="Siparişi Tamamla" />
      <CheckoutPage />
    </StoreShell>
  );
}
