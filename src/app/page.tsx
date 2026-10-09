import {
  AnnouncementBar,
  ContentCards,
  Hero,
  NewArrivals,
  PerformanceBanner,
  RecentlyViewed,
  ShopByCategory,
  SurplusExplainer,
  TrustBar,
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
        <TrustBar />
        <NewArrivals />
        <ContentCards />
        <ShopByCategory />
        <PerformanceBanner />
        <SurplusExplainer />
        <RecentlyViewed />
      </main>
      <SiteFooter />
    </>
  );
}
