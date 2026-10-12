import type { Metadata } from "next";
import { OrderTracking } from "@/components/sites/strale/checkout/order-tracking";
import { PageHeading, StoreShell } from "@/components/sites/strale/store-shell";

export const metadata: Metadata = { title: "Sipariş Takip", robots: { index: false } };

export default function Page() {
  return (
    <StoreShell>
      <PageHeading title="Sipariş Takip" />
      <OrderTracking />
    </StoreShell>
  );
}
