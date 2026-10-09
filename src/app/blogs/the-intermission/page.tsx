import type { Metadata } from "next";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getBlog } from "@/components/sites/reigningchamp/catalog";
import { BlogCard } from "@/components/sites/reigningchamp/content/blog-card";

export const metadata: Metadata = { title: "The Intermission" };

const PER_PAGE = 6;

type Props = { searchParams: Promise<{ page?: string | string[] }> };

export default async function BlogPage({ searchParams }: Props) {
  const blog = getBlog();
  const pages = Math.max(1, Math.ceil(blog.articles.length / PER_PAGE));
  const raw = Number((await searchParams).page);
  const current = Number.isInteger(raw) ? Math.min(Math.max(raw, 1), pages) : 1;
  const articles = blog.articles.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  return (
    <div className="px-3 pt-3 pb-12 tab:px-8 tab:pb-12">
      <h1 className="font-rc-cond text-[32px] leading-10 tracking-[1.5px] uppercase tab:text-[48px] tab:leading-[60px] tab:tracking-[1px]">
        {blog.title}
      </h1>
      <ul className="mt-3 grid gap-y-[63px] tab:grid-cols-2 tab:gap-x-1 tab:gap-y-[62px]">
        {articles.map((article, index) => (
          <li key={article.handle}>
            <BlogCard article={article} sizes="(min-width: 750px) 48vw, 100vw" priority={index < 2} />
          </li>
        ))}
      </ul>
      {pages > 1 ? <Pagination current={current} pages={pages} /> : null}
    </div>
  );
}

/** Shopify-style pager: 1 2 3 … 9, with the current page underlined. */
function Pagination({ current, pages }: { current: number; pages: number }) {
  const items: (number | "gap")[] = [];
  for (let page = 1; page <= pages; page++) {
    if (page === 1 || page === pages || Math.abs(page - current) <= 1 || (current <= 2 && page <= 3) || (current >= pages - 1 && page >= pages - 2)) {
      items.push(page);
    } else if (items[items.length - 1] !== "gap") {
      items.push("gap");
    }
  }
  const href = (page: number) => (page === 1 ? "/blogs/the-intermission" : `/blogs/the-intermission?page=${page}`);

  return (
    <nav aria-label="Pagination" className="mt-12 tab:mt-[96px]">
      <ul className="flex h-[60px] items-center justify-center gap-6 tracking-[1.2px] uppercase">
        {items.map((item, index) =>
          item === "gap" ? (
            <li key={`gap-${index}`} aria-hidden="true">
              …
            </li>
          ) : (
            <li key={item}>
              <Link
                href={href(item)}
                aria-current={item === current ? "page" : undefined}
                aria-label={`Page ${item}`}
                className={cn(item === current ? "rc-underline" : "rc-hover-underline")}
              >
                {item}
              </Link>
            </li>
          ),
        )}
      </ul>
    </nav>
  );
}
