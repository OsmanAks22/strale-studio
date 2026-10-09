import type { Metadata } from "next";
import { CartView } from "@/components/sites/reigningchamp/content/cart-view";

export const metadata: Metadata = { title: "Your Shopping Cart" };

export default function CartPage() {
  return <CartView />;
}
