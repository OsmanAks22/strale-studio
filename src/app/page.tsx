import {
  Banner,
  ContentCards,
  Hero,
  NewArrivals,
  RecentlyViewed,
  ShopByCategory,
} from "@/components/sites/strale/home-sections";
import { StoreShell } from "@/components/sites/strale/store-shell";

export default function Home() {
  return (
    <StoreShell overlay>
      <Hero />
      <NewArrivals />
      <ContentCards />
      <ShopByCategory />
      <Banner />
      <RecentlyViewed />
    </StoreShell>
  );
}
