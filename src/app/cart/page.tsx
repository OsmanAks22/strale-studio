import type { Metadata } from "next";
import { getProducts } from "@/components/sites/reigningchamp/catalog";
import { CartView } from "@/components/sites/reigningchamp/content/cart-view";

export const metadata: Metadata = { title: "Your Shopping Cart" };

export default function CartPage() {
  // Line items show the product's department ("Classics") above the title, as on the source.
  const departments: Record<string, string> = {};
  for (const product of Object.values(getProducts())) {
    if (product.department) departments[product.handle] = product.department;
  }
  return <CartView departments={departments} />;
}
