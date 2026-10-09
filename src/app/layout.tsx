import type { Metadata } from "next";
import localFont from "next/font/local";
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
  title: "Reigning Champ | Premium Apparel | Est. 2007 | Reigning Champ US",
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
      <body className="rc-body min-h-full">{children}</body>
    </html>
  );
}
