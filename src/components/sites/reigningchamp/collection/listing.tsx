"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import type { ProductImage, ProductSummary } from "../catalog";
import { ProductGridCard } from "../product-grid-card";
import { FilterDrawer } from "./filter-drawer";
import type { FacetGroup, SortOption } from "./facets";

const PAGE_SIZE = 24;

/** Card data plus the on-model shot used by "VIEW AS: Model". */
export type ListingItem = ProductSummary & { modelImage: ProductImage | null };

export type ListingProps = {
  /** Path the filters apply to, e.g. "/collections/mens-latest" or "/search". */
  basePath: string;
  /** Current query as [key, value] pairs (repeating keys allowed). */
  query: [string, string][];
  groups: FacetGroup[];
  /** Facet names that get their own quick button next to "All Filters". */
  quickFacets: string[];
  sortOptions: SortOption[];
  sort: string;
  items: ListingItem[];
  /** Keys kept by "Clear all" (search keeps `q`). */
  keepOnClear?: string[];
  emptyMessage?: React.ReactNode;
};

export function hrefFor(basePath: string, pairs: [string, string][]) {
  const qs = new URLSearchParams(pairs).toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/** Filter row, VIEW AS / SORT bar, filter drawer and the lazily-extended product grid. */
export function Listing({
  basePath,
  query,
  groups,
  quickFacets,
  sortOptions,
  sort,
  items,
  keepOnClear = [],
  emptyMessage,
}: ListingProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [drawer, setDrawer] = useState<{ open: boolean; focus: string | null }>({ open: false, focus: null });
  const [view, setView] = useState<"product" | "model">("product");

  const filterKeys = useMemo(() => new Set(groups.map((g) => g.param)), [groups]);
  const totalActive = groups.reduce((sum, g) => sum + g.activeCount, 0);
  const hasFilters = query.some(([k]) => filterKeys.has(k) || k.startsWith("filter."));
  const clearHref = hrefFor(
    basePath,
    query.filter(([k]) => keepOnClear.includes(k)),
  );

  const navigate = (href: string) => {
    startTransition(() => router.push(href, { scroll: false }));
  };

  const toggle = (param: string, value: string) => {
    const exists = query.some(([k, v]) => k === param && v.toLowerCase() === value.toLowerCase());
    const next: [string, string][] = exists
      ? query.filter(([k, v]) => !(k === param && v.toLowerCase() === value.toLowerCase()))
      : [...query, [param, value]];
    navigate(hrefFor(basePath, next));
  };

  const setSort = (value: string) => {
    const next = query.filter(([k]) => k !== "sort_by");
    next.push(["sort_by", value]);
    navigate(hrefFor(basePath, next));
  };

  const quick = quickFacets.map((name) => groups.find((g) => g.name === name)).filter((g): g is FacetGroup => !!g);
  const sortLabel = sortOptions.find((o) => o.value === sort)?.label ?? sortOptions[0]?.label;
  const gridKey = query
    .filter(([k]) => k !== "page")
    .map(([k, v]) => `${k}=${v}`)
    .join("&");

  return (
    <>
      <div className="sticky top-[59px] z-30 bg-white px-3 py-5 tab:px-8 tab:py-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 tab:gap-x-6">
          <QuickButton
            label="All Filters"
            count={totalActive}
            onClick={() => setDrawer({ open: true, focus: null })}
          />
          {quick.map((group) => (
            <QuickButton
              key={group.name}
              label={group.name}
              count={group.activeCount}
              onClick={() => setDrawer({ open: true, focus: group.name })}
            />
          ))}
          {hasFilters ? (
            <a
              href={clearHref}
              onClick={(e) => {
                e.preventDefault();
                navigate(clearHref);
              }}
              className="flex items-center text-[12px] leading-[18px] tracking-[1px] text-[#333] tab:text-[16px] tab:leading-6"
            >
              <Dot filled />
              <span className="underline underline-offset-[0.2rem]">Clear all</span>
            </a>
          ) : null}
        </div>
      </div>

      <div className="flex items-start justify-between px-3 pb-3 tab:px-8">
        <button
          type="button"
          onClick={() => setView((v) => (v === "product" ? "model" : "product"))}
          aria-label="Change listing view"
          className="cursor-pointer text-[9px] leading-[13.5px] tracking-[1.2px] uppercase tab:text-[12px] tab:leading-[18px]"
        >
          View as:{" "}
          <span className="tracking-[1px] capitalize underline underline-offset-[2.4px]">{view}</span>
        </button>
        <label className="relative block cursor-pointer text-[9px] leading-[13.5px] tracking-[1.2px] uppercase tab:text-[12px] tab:leading-[18px]">
          Sort:
          <span className="ml-1.5 tracking-[1px] normal-case underline underline-offset-[0.2rem]">{sortLabel}</span>
          <select
            name="sort_by"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
            aria-label="Sort by"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={cn("transition-opacity duration-200", pending && "opacity-40")}>
        {items.length ? (
          <ProductGrid key={gridKey} items={items} view={view} />
        ) : (
          <div className="px-3 pt-3 pb-12 tab:px-8">
            {emptyMessage ?? (
              <p>
                No products found.{" "}
                <a
                  href={clearHref}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(clearHref);
                  }}
                  className="rc-underline"
                >
                  Clear all filters
                </a>
              </p>
            )}
          </div>
        )}
      </div>

      <FilterDrawer
        open={drawer.open}
        focus={drawer.focus}
        groups={groups}
        total={items.length}
        pending={pending}
        clearHref={hasFilters ? clearHref : null}
        onClear={() => navigate(clearHref)}
        onToggle={toggle}
        onClose={() => setDrawer((d) => ({ ...d, open: false }))}
      />
    </>
  );
}

function Dot({ filled = false }: { filled?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn("mr-2 inline-block size-2.5 shrink-0 rounded-full border border-[#333]", filled && "bg-black border-black")}
    />
  );
}

function QuickButton({ label, count, onClick }: { label: string; count: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      className="flex cursor-pointer items-center text-[12px] leading-[18px] tracking-[1px] text-[#333] tab:text-[16px] tab:leading-6"
    >
      <Dot filled={count > 0} />
      <span className="underline underline-offset-[0.2rem]">{label}</span>
      {count > 0 ? <span className="ml-1">({count})</span> : null}
    </button>
  );
}

/** Renders PAGE_SIZE cards and appends more as the sentinel approaches the viewport. */
function ProductGrid({ items, view }: { items: ListingItem[]; view: "product" | "model" }) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const sentinel = useRef<HTMLDivElement>(null);
  const done = visible >= items.length;

  useEffect(() => {
    const el = sentinel.current;
    if (!el || done) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setVisible((v) => Math.min(v + PAGE_SIZE, items.length));
      },
      { rootMargin: "1200px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [done, items.length, visible]);

  return (
    <>
      <ul className="mt-3 mb-5 grid grid-cols-2 gap-1 px-1 tab:grid-cols-3 tab:gap-8 tab:px-8" aria-label="Products">
        {items.slice(0, visible).map((item, i) => (
          <li key={item.handle}>
            <ProductGridCard
              showBadge={false}
              product={view === "model" && item.modelImage ? { ...item, image: item.modelImage } : item}
              sizes="(min-width: 750px) 31vw, 50vw"
              priority={i < 3}
            />
          </li>
        ))}
      </ul>
      {done ? null : (
        <div ref={sentinel} className="flex h-16 items-center justify-center text-[#808080]" aria-live="polite">
          Loading…
        </div>
      )}
    </>
  );
}
