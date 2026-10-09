import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "STRALE | Made with Direction",
    template: "%s | STRALE",
  },
  description:
    "Strale Studio designs premium everyday essentials with intent — sweats, knitwear and outerwear cut, sewn and finished to last.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="st-body min-h-full">{children}</body>
    </html>
  );
}
