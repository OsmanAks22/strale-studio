import type { Metadata } from "next";
import Link from "next/link";
import { categories, footerColumns, legalLinks, navItems } from "@/components/sites/strale/data";
import { AnnouncementBar } from "@/components/sites/strale/home-sections";
import { StraleMarkTwin } from "@/components/sites/strale/icons";
import { SiteFooter } from "@/components/sites/strale/site-footer";
import { SiteHeader } from "@/components/sites/strale/site-header";

export const metadata: Metadata = {
  title: "Yakında",
  robots: { index: false },
};

/** href → visible label, so "/koleksiyonlar/tisort" shows "Tişört" rather than the ASCII slug. */
const labels = new Map<string, string>(
  [
    ...navItems.flatMap((item) => [
      ...(item.href ? [{ href: item.href, label: item.label }] : []),
      ...(item.columns ?? []).flatMap((column) => column.links),
    ]),
    ...footerColumns.flatMap((column) => column.links),
    ...legalLinks,
    ...categories,
  ].map(({ href, label }) => [href, label]),
);

/** Store pages (collections, products, account…) are not built yet; every link lands here. */
export default async function ComingSoon({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const path = `/${slug.map(decodeURIComponent).join("/")}`;
  const section = labels.get(path) ?? slug[slug.length - 1].replace(/-/g, " ");

  return (
    <>
      <AnnouncementBar />
      <SiteHeader overlay={false} />
      <main className="flex min-h-[70dvh] flex-col items-center justify-center px-3 py-24 text-center tab:px-8">
        <StraleMarkTwin className="h-6 w-[30px] fill-rust" />
        <p className="st-micro mt-8 text-[10px] text-graphite">{section}</p>
        <h1 className="st-display mt-3 text-[34px] leading-[36px] tab:text-[56px] tab:leading-[58px]">Yakında</h1>
        <p className="mt-4 max-w-[420px] text-[12px] leading-[18px] tab:text-[16px] tab:leading-6">
          Bu bölüm hazırlanıyor. Yeni stoklardan ilk sen haberdar olmak için aşağıdan listeye katıl.
        </p>
        <Link href="/" className="st-label st-underline mt-8 inline-block">
          Ana Sayfaya Dön
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
