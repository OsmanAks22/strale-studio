import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SettingsProvider } from "@/components/sites/strale/settings-context";
import { siteOrigin } from "@/lib/site-url";
import { getSettings } from "@/lib/store-data";
import "./globals.css";

/** Pages are cached and refreshed right after every change (see storeChanged); this is the hourly safety net. */
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(await siteOrigin()),
    openGraph: { type: "website", locale: "tr_TR", siteName: "STRALE" },
    title: {
      default: "STRALE | İhraç Fazlası Giyim",
      template: "%s | STRALE",
    },
    description:
      "Yurt dışı siparişlerden artan ihraç fazlası giyim ürünleri; ceket, triko, sweat ve eşofman. Sınırlı stok, etiket fiyatının yarısına.",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();
  return (
    <html lang="tr" className="h-full">
      <body className="st-body min-h-full">
        <SettingsProvider settings={settings}>{children}</SettingsProvider>
        {/* Cookieless visitor stats (no consent banner needed); enable Analytics in the Vercel project. */}
        <Analytics />
      </body>
    </html>
  );
}
