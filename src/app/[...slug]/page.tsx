import type { Metadata } from "next";
import Link from "next/link";
import { AnnouncementBar } from "@/components/sites/strale/home-sections";
import { StraleMark } from "@/components/sites/strale/icons";
import { SiteFooter } from "@/components/sites/strale/site-footer";
import { SiteHeader } from "@/components/sites/strale/site-header";

export const metadata: Metadata = {
  title: "Coming Soon",
  robots: { index: false },
};

/** Store pages (collections, products, account…) are not built yet; every link lands here. */
export default async function ComingSoon({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const section = decodeURIComponent(slug[slug.length - 1]).replace(/-/g, " ");

  return (
    <>
      <AnnouncementBar />
      <SiteHeader overlay={false} />
      <main className="flex min-h-[70dvh] flex-col items-center justify-center px-3 py-24 text-center tab:px-8">
        <StraleMark className="h-6 w-8 fill-rust" />
        <p className="st-micro mt-8 text-[10px] text-graphite">{section}</p>
        <h1 className="st-display mt-3 text-[34px] leading-[36px] tab:text-[56px] tab:leading-[58px]">Coming Soon</h1>
        <p className="mt-4 max-w-[420px] text-[12px] leading-[18px] tab:text-[16px] tab:leading-6">
          This part of the Strale studio is still being cut and sewn. Join The List below to hear first.
        </p>
        <Link href="/" className="st-label st-underline mt-8 inline-block">
          Back to Home
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
