import type { Metadata } from "next";
import Link from "next/link";
import { ShopByCategory } from "@/components/sites/reigningchamp/home-sections";

export const metadata: Metadata = { title: "404 Not Found" };

/** Mirrors the source's /pages/does-not-exist: message, helpful links, then "Shop by Category". */
export default function NotFound() {
  return (
    <>
      <section className="px-3 pt-3 pb-6 tab:px-8">
        <div className="tab:max-w-[66.67%]">
          <h1 className="font-rc-cond text-[24px] leading-[1.25] tracking-[1.5px] uppercase tab:text-[32px]">
            Page Not Found
          </h1>
          <div className="rc-rte mt-2 text-[12px] leading-[18px] tab:text-[16px] tab:leading-6">
            <p>We can&apos;t seem to find the page you&apos;re looking for.</p>
            <p>Error code: 404.</p>
            <p>Here are some helpful links instead:</p>
            <p>
              <Link href="/" className="text-black/85">
                Home
              </Link>
            </p>
            <p>
              <Link href="/collections/mens-latest" className="text-black/85">
                Men&apos;s Latest
              </Link>
            </p>
            <p>
              <Link href="/pages/contact" className="text-black/85">
                Contact Us
              </Link>
            </p>
          </div>
        </div>
      </section>
      <ShopByCategory />
    </>
  );
}
