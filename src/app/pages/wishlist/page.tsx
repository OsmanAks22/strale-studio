import type { Metadata } from "next";
import { WishlistView } from "@/components/sites/reigningchamp/content/wishlist-view";

export const metadata: Metadata = { title: "Wishlist" };

export default function WishlistPage() {
  return <WishlistView />;
}
