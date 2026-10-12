import type { Metadata } from "next";
import { OrderDone } from "@/components/sites/strale/checkout/order-done";
import { PageHeading, StoreShell } from "@/components/sites/strale/store-shell";

export const metadata: Metadata = { title: "Siparişiniz Alındı", robots: { index: false } };

export default function Page() {
  return (
    <StoreShell>
      <PageHeading title="Siparişiniz Alındı" />
      <OrderDone />
    </StoreShell>
  );
}
