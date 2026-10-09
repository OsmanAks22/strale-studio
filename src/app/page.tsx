import {
  CategoryGrid,
  Hero,
  NewArrivals,
  PromoBlocks,
  SurplusExplainer,
  TrustBar,
} from "@/components/sites/strale/home-sections";
import { StoreShell } from "@/components/sites/strale/store-shell";

export default function Home() {
  return (
    <StoreShell overlay>
      <Hero />
      <TrustBar />
      <NewArrivals />
      <CategoryGrid />
      <PromoBlocks />
      <SurplusExplainer />
    </StoreShell>
  );
}
