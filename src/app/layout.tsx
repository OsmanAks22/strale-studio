import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { siteOrigin } from "@/lib/site-url";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  openGraph: { type: "website", locale: "tr_TR", siteName: "STRALE" },
  title: {
    default: "STRALE | İhraç Fazlası Giyim",
    template: "%s | STRALE",
  },
  description:
    "Yurt dışı siparişlerden artan ihraç fazlası giyim ürünleri; ceket, triko, sweat ve eşofman. Sınırlı stok, etiket fiyatının yarısına.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="h-full">
      <body className="st-body min-h-full">
        {children}
        {/* Cookieless visitor stats (no consent banner needed); enable Analytics in the Vercel project. */}
        <Analytics />
      </body>
    </html>
  );
}
