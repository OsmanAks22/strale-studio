import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "STRALE | Amaçla Tasarlandı",
    template: "%s | STRALE",
  },
  description:
    "Strale Studio, yıllarca giyilmek için tasarlanmış premium temel parçalar üretir: sweat, triko ve dış giyim.",
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
