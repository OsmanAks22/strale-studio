import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type ArticleSummary = { handle: string; title: string; image: string | null };

/** Article tile used by /blogs/the-intermission and the "The Intermission" strip on articles. */
export function BlogCard({
  article,
  sizes,
  priority = false,
  className,
}: {
  article: ArticleSummary;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const href = `/blogs/the-intermission/${article.handle}`;
  return (
    <article className={className}>
      <Link href={href} className="relative block aspect-[4/5] overflow-hidden bg-[#f2f2f2]" tabIndex={-1} aria-hidden="true">
        {article.image ? (
          <Image src={article.image} alt={article.title} fill sizes={sizes} preload={priority} className="object-cover" />
        ) : null}
      </Link>
      <h3 className="mt-2 px-1 text-[9px] leading-[13.5px] tracking-[1.2px] uppercase tab:mt-1.5 tab:px-[3px] tab:text-[12px] tab:leading-[18px]">
        <Link href={href} className="rc-hover-underline">
          {article.title}
        </Link>
      </h3>
    </article>
  );
}

/** "THE INTERMISSION / View All" strip that closes each article on the source. */
export function RelatedArticles({ articles, className }: { articles: ArticleSummary[]; className?: string }) {
  return (
    <section className={cn("pt-8 pb-3", className)}>
      <div className="flex items-center justify-between px-3 tab:px-8">
        <h2 className="font-rc-med text-[12px] leading-[18px] tracking-[1.2px] uppercase tab:text-[16px] tab:leading-6">
          The Intermission
        </h2>
        <Link
          href="/blogs/the-intermission"
          className="rc-underline text-[12px] leading-[18px] tab:text-[16px] tab:leading-6"
        >
          View All
        </Link>
      </div>
      <ul className="rc-no-scrollbar mt-3 flex snap-x snap-mandatory scroll-px-3 gap-1 overflow-x-auto px-3 tab:grid tab:grid-cols-3 tab:px-8">
        {articles.map((article) => (
          <li key={article.handle} className="w-[80vw] shrink-0 snap-start tab:w-auto">
            <BlogCard article={article} sizes="(min-width: 750px) 32vw, 80vw" />
          </li>
        ))}
      </ul>
    </section>
  );
}
