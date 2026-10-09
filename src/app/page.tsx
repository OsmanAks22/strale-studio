import {
  ContentCards,
  Hero,
  NewArrivals,
  PerformanceBanner,
  RecentlyViewed,
  ShopByCategory,
} from "@/components/sites/reigningchamp/home-sections";

export default function Home() {
  return (
    <>
      <Hero />
      <NewArrivals />
      <ContentCards />
      <ShopByCategory />
      <PerformanceBanner />
      <RecentlyViewed />
    </>
  );
}
