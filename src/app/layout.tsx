import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
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
      <body className="st-body min-h-full">{children}</body>
    </html>
  );
}
