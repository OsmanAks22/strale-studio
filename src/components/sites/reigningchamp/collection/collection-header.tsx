import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Link as LinkItem } from "../catalog";

/** "HOME • PRODUCTS" trail shown above listing banners. */
export function Breadcrumbs() {
  return (
    <nav aria-label="Breadcrumbs" className="h-3.5 px-3 tab:px-8">
      <ol className="flex items-center gap-3 text-[9px] leading-[13.5px] tracking-[1.2px] uppercase">
        <li>
          <Link href="/" className="pt-0.5 block rc-hover-underline">
            Home
          </Link>
        </li>
        <li className="flex items-center gap-3 before:text-[12px] before:leading-[18px] before:content-['•']">
          <Link href="/collections/mens-all-clothing" className="pt-0.5 block rc-hover-underline">
            Products
          </Link>
        </li>
      </ol>
    </nav>
  );
}

/** Heading + description banner (source: rc_banner, content below). */
export function ListingBanner({ heading, description }: { heading: string; description: string | null }) {
  return (
    <div className="flex flex-col gap-2 px-3 pt-3 pb-5 tab:px-8 tab:pb-8">
      <h1 className="font-rc-med text-[18px] leading-[27px] tracking-[1.2px] uppercase tab:text-[24px] tab:leading-9">
        {heading}
      </h1>
      {description ? <p className="tab:text-[16px] tab:leading-6">{description}</p> : null}
    </div>
  );
}

/** Large sub-category links; scrolls horizontally when it overflows. */
export function ListingTabs({ tabs }: { tabs: (LinkItem & { active: boolean })[] }) {
  if (!tabs.length) return null;
  return (
    <ul className="rc-no-scrollbar flex gap-6 overflow-x-auto px-3 tab:px-8" aria-label="Categories">
      {tabs.map((tab) => (
        <li key={tab.href} className="shrink-0">
          <Link
            href={tab.href}
            aria-current={tab.active ? "page" : undefined}
            className={cn(
              "inline-flex text-[18px] leading-[27px] tracking-[1px] whitespace-nowrap transition-colors hover:text-black tab:text-[24px] tab:leading-9",
              tab.active ? "text-black" : "text-[#808080]",
            )}
          >
            {tab.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
