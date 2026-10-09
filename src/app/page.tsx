import {
  AnnouncementBar,
  ContentCards,
  Hero,
  NewArrivals,
  PerformanceBanner,
  RecentlyViewed,
  ShopByCategory,
} from "@/components/sites/strale/home-sections";
import { SiteFooter } from "@/components/sites/strale/site-footer";
import { SiteHeader } from "@/components/sites/strale/site-header";

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
