import {
  AnnouncementBar,
  ContentCards,
  Hero,
  NewArrivals,
  PerformanceBanner,
  RecentlyViewed,
  ShopByCategory,
} from "@/components/sites/reigningchamp/home-sections";
import { SiteFooter } from "@/components/sites/reigningchamp/site-footer";
import { SiteHeader } from "@/components/sites/reigningchamp/site-header";

export default function Home() {
  return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      <main>
        <Hero />
        <NewArrivals />
        <ContentCards />
        <ShopByCategory />
        <PerformanceBanner />
        <RecentlyViewed />
      </main>
      <SiteFooter />
    </>
  );
}
