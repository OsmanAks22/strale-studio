import type { Metadata } from "next";
import localFont from "next/font/local";
import { AnnouncementBar } from "@/components/sites/reigningchamp/home-sections";
import { SiteFooter } from "@/components/sites/reigningchamp/site-footer";
import { SiteHeader } from "@/components/sites/reigningchamp/site-header";
import "./globals.css";

const akzidenz = localFont({
  src: "../../public/sites/reigningchamp/fonts/akzidenz-grotesk-regular.woff2",
  weight: "400",
  variable: "--font-akzidenz",
  display: "swap",
});

const akzidenzMed = localFont({
  src: "../../public/sites/reigningchamp/fonts/akzidenz-grotesk-medium.woff2",
  weight: "500",
  variable: "--font-akzidenz-med",
  display: "swap",
});

const akzidenzCond = localFont({
  src: "../../public/sites/reigningchamp/fonts/akzidenz-grotesk-bold-condensed.woff2",
  weight: "700",
  variable: "--font-akzidenz-cond",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Reigning Champ | Premium Apparel | Est. 2007 | Reigning Champ US",
    template: "%s | Reigning Champ US",
  },
  description:
    "We design and develop premium apparel without compromise. Our process is guided by our principles: Respect the details. Master simplicity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${akzidenz.variable} ${akzidenzMed.variable} ${akzidenzCond.variable} h-full`}
    >
      <body className="rc-body min-h-full">
        <AnnouncementBar />
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
