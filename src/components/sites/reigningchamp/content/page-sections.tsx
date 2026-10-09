import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getBlog, getProducts, toSummary, type PageSection } from "../catalog";
import { ProductGridCard } from "../product-grid-card";
import { RelatedArticles } from "./blog-card";
import { NewsletterForm, OptOutForm } from "./forms";
import { isExternal, isPolicyPage, localizeHref, prepareHtml } from "./html";

/**
 * Renders the section list of a snapshot page or article. Shopify's theme gives the same
 * section type different looks per template; those choices are derived here from the
 * section's neighbours and content so pages.json does not need layout flags.
 */

type Variant = "page" | "article";
type Ctx = {
  handle: string;
  variant: Variant;
  index: number;
  prev: PageSection | undefined;
  next: PageSection | undefined;
  /** Pages that open with a titled banner (wholesale/corporate/store pages) use tighter spacing. */
  compact: boolean;
  /** Section ids for in-page tab links ("#staff-picks"). */
  anchorIds: Map<number, string>;
};

const GUTTER = "px-3 tab:px-8";
const BODY = "text-[12px] leading-[18px] tab:text-[16px] tab:leading-6";
const SUBTITLE = "font-rc-med text-[12px] leading-[18px] tracking-[1.2px] uppercase tab:text-[16px] tab:leading-6";
/** Pages whose body copy stays at 16px on phones on the source. */
const LARGE_BODY_PAGES = new Set(["manufacturing", "reigning-champ-corporate", "reigning-champ-wholesale"]);

export function PageSections({
  sections,
  handle,
  variant = "page",
}: {
  sections: PageSection[];
  handle: string;
  variant?: Variant;
}) {
  const compact = sections.some((s) => s.type === "banner" && s.heading);
  const anchorIds = findAnchorTargets(sections);
  return (
    <>
      {sections.map((section, index) => {
        const ctx: Ctx = {
          handle,
          variant,
          index,
          prev: sections[index - 1],
          next: sections[index + 1],
          compact,
          anchorIds,
        };
        return <Section key={index} section={section} ctx={ctx} />;
      })}
    </>
  );
}

function Section({ section, ctx }: { section: PageSection; ctx: Ctx }) {
  switch (section.type) {
    case "banner":
      return <Banner section={section} ctx={ctx} />;
    case "richText":
      return <RichText section={section} ctx={ctx} />;
    case "tabs":
      return <Tabs section={section} ctx={ctx} />;
    case "cards":
      return <Cards section={section} ctx={ctx} />;
    case "accordion":
      return <Accordion section={section} ctx={ctx} />;
    case "products":
      return <Products section={section} ctx={ctx} />;
    case "html":
      return <HtmlBlock section={section} ctx={ctx} />;
  }
}

/** Tab links like "#staff-picks" point at the section whose heading (or first card title) matches the label. */
function findAnchorTargets(sections: PageSection[]) {
  const ids = new Map<number, string>();
  const tabs = sections.find((s) => s.type === "tabs");
  if (!tabs || tabs.type !== "tabs") return ids;
  for (const link of tabs.links) {
    if (!link.href.startsWith("#")) continue;
    const label = link.label.trim().toLowerCase();
    const index = sections.findIndex((s) => {
      const heading = "heading" in s ? s.heading : "";
      const firstTitle = s.type === "cards" ? (s.items[0]?.title ?? "") : "";
      return heading.trim().toLowerCase() === label || firstTitle.trim().toLowerCase() === label;
    });
    if (index >= 0) ids.set(index, link.href.slice(1));
  }
  return ids;
}

function SmartLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const local = localizeHref(href);
  if (isExternal(local)) {
    const web = !local.startsWith("mailto:") && !local.startsWith("tel:");
    return (
      <a href={local} className={className} {...(web ? { target: "_blank", rel: "noreferrer" } : {})}>
        {children}
      </a>
    );
  }
  return (
    <Link href={local} className={className}>
      {children}
    </Link>
  );
}

function Html({ html, className, handle }: { html: string; className?: string; handle?: string }) {
  if (!html.trim()) return null;
  // Snapshot HTML is sanitised at scrape time (scripts/reigningchamp/scrape_pages.py allow-list).
  return <div className={cn("rc-rte", className)} dangerouslySetInnerHTML={{ __html: prepareHtml(html, handle) }} />;
}

/* ------------------------------------------------------------------ banner */

function bannerHeight(section: Extract<PageSection, { type: "banner" }>, ctx: Ctx) {
  if (ctx.variant === "article") return "h-[488px] tab:h-[calc(100vh-102px)] tab:min-h-[600px]";
  if (section.heading) {
    // Store pages (followed by in-page tabs) use the large size; wholesale/corporate use medium.
    const isStore = ctx.next?.type === "tabs";
    return isStore ? "h-[488px] tab:h-[calc(100vh-102px)] tab:min-h-[600px]" : "h-[488px] tab:h-[600px]";
  }
  const firstBanner = ctx.index === 0;
  return firstBanner ? "h-[250px] tab:h-[400px]" : "h-[488px] tab:h-[calc(100vh-102px)] tab:min-h-[600px]";
}

function Banner({ section, ctx }: { section: Extract<PageSection, { type: "banner" }>; ctx: Ctx }) {
  if (!section.image) return null;
  const article = ctx.variant === "article";
  return (
    <section
      id={ctx.anchorIds.get(ctx.index)}
      className={cn("relative scroll-mt-20 overflow-hidden", article && "mx-3 tab:mx-0", bannerHeight(section, ctx))}
    >
      {section.mobileImage ? (
        <>
          <Image
            src={section.mobileImage}
            alt=""
            fill
            sizes="100vw"
            preload={ctx.index === 0}
            className="object-cover tab:hidden"
          />
          <Image
            src={section.image}
            alt=""
            fill
            sizes="100vw"
            preload={ctx.index === 0}
            className="hidden object-cover tab:block"
          />
        </>
      ) : (
        <Image
          src={section.image}
          alt={section.heading || ""}
          fill
          sizes="100vw"
          preload={ctx.index <= 1}
          className={article ? "object-contain" : "object-cover"}
        />
      )}
      {section.heading && ctx.next?.type !== "tabs" ? (
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      ) : null}
      {section.heading || section.links.length || section.html ? (
        <div className="absolute inset-x-3 bottom-8 text-white tab:inset-x-8">
          {section.heading ? (
            <h2 className="font-rc-cond text-[24px] leading-[1.25] tracking-[1.5px] uppercase tab:text-[32px]">
              {section.heading}
            </h2>
          ) : null}
          <Html html={section.html} className={cn("mt-2", BODY)} />
          {section.links.length ? (
            <div className="mt-4 flex flex-wrap gap-4">
              {section.links.map((link) => (
                <SmartLink key={link.href + link.label} href={link.href} className="rc-underline tracking-[1.2px] uppercase">
                  {link.label}
                </SmartLink>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

/* --------------------------------------------------------------- rich text */

type HeadingStyle = "cond" | "med24" | "med16" | "editorial" | "quote";

function headingStyle(section: Extract<PageSection, { type: "richText" }>, ctx: Ctx): HeadingStyle {
  if (ctx.variant === "article") return ctx.index === 0 ? "editorial" : "quote";
  if (ctx.handle === "stores") return "med24";
  if (section.heading.trim().toLowerCase() === "what to expect") return "med16";
  return "cond";
}

const HEADING_CLASS: Record<HeadingStyle, string> = {
  cond: "font-rc-cond text-[24px] leading-[1.25] tracking-[1.5px] uppercase tab:text-[32px]",
  med24: "font-rc-med text-[18px] leading-[1.25] tracking-[1.5px] uppercase tab:text-[24px] tab:tracking-[1px]",
  med16: "font-rc-med text-[16px] leading-8 tracking-[1.5px] uppercase tab:tracking-[1px]",
  editorial:
    "font-[Didot,'Bodoni_72','Times_New_Roman',serif] px-[26px] text-[32px] leading-[1.15] tracking-[1px] uppercase tab:px-0 tab:text-[48px] tab:leading-[1.2]",
  quote: "font-rc-med text-[24px] leading-[1.1] tracking-[1.5px] tab:text-[32px]",
};

function RichText({ section, ctx }: { section: Extract<PageSection, { type: "richText" }>; ctx: Ctx }) {
  const article = ctx.variant === "article";
  const style = headingStyle(section, ctx);
  const HeadingTag = ctx.index === 0 ? "h1" : "h2";
  const policy = isPolicyPage(ctx.handle) && section.html.length > 2000;
  // Short heading-less lines in articles ("Watch the film") are left-aligned subtitles on the source.
  const articleLabel = article && !section.heading && section.html.replace(/<[^>]+>/g, "").trim().length < 60;

  if (articleLabel) {
    return (
      <section className={cn(GUTTER, "pt-9 pb-6")}>
        <Html html={section.html} className={SUBTITLE} />
      </section>
    );
  }
  const largeBody = LARGE_BODY_PAGES.has(ctx.handle);

  // Spacing follows the source's per-template paddings (see docs/research/reigningchamp).
  const prevBanner = ctx.prev?.type === "banner";
  const pt =
    ctx.index === 0
      ? "pt-3"
      : prevBanner
        ? ctx.compact
          ? "pt-9"
          : "pt-12"
        : ctx.prev?.type === "richText"
          ? "pt-0"
          : ctx.handle === "stores"
            ? "pt-6"
            : "pt-12";
  const pb =
    ctx.index === 0
      ? ctx.next?.type === "tabs"
        ? section.html
          ? "pb-3"
          : "pb-6"
        : ctx.handle === "stores"
          ? "pb-0"
          : "pb-6"
      : ctx.next?.type === "accordion"
        ? "pb-0"
        : section.form
          ? "pb-6"
        : ctx.compact
          ? "pb-9"
          : "pb-12";

  if (policy) {
    return (
      <section className={cn(GUTTER, "pt-8 pb-16")}>
        <PolicyHtml html={section.html} handle={ctx.handle} />
      </section>
    );
  }

  return (
    <section
      id={ctx.anchorIds.get(ctx.index)}
      className={cn("scroll-mt-20", GUTTER, article ? "pt-12 pb-9 text-center" : cn(pt, pb))}
    >
      <div className={cn(article ? "mx-auto max-w-[917px]" : "tab:max-w-[66.67%]")}>
        {section.heading ? (
          <HeadingTag className={HEADING_CLASS[style]}>{section.heading}</HeadingTag>
        ) : null}
        <Html
          html={section.html}
          handle={ctx.handle}
          className={cn(
            section.heading && "mt-2",
            // The fine print under the newsletter form is small and grey on the source.
            ctx.prev?.type === "richText" && ctx.prev.form
              ? "text-[12px] leading-[18px] text-[#808080]"
              : largeBody
                ? "text-[16px] leading-6"
                : BODY,
            article && style === "editorial" && "tracking-[1.2px] uppercase",
            article && !section.heading && "mx-auto max-w-[640px] px-[26px] text-left tab:px-0",
            "[&_ul]:pl-[1.2px] [&_ul]:list-inside",
          )}
        />
        {section.form ? <NewsletterForm /> : null}
        {section.links.length ? (
          <div className="mt-5 flex flex-wrap gap-3">
            {section.links.map((link) => (
              <SmartLink
                key={link.href + link.label}
                href={link.href}
                className="inline-flex h-10 items-center justify-center bg-black px-4 tracking-[1.2px] text-white uppercase"
              >
                {link.label}
              </SmartLink>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- tabs */

function Tabs({ section, ctx }: { section: Extract<PageSection, { type: "tabs" }>; ctx: Ctx }) {
  const afterBanner = ctx.prev?.type === "banner";
  return (
    <nav aria-label="Page sections" className={cn(GUTTER, afterBanner && "pt-6")}>
      <ul className="rc-no-scrollbar flex gap-5 overflow-x-auto py-1.5 text-[12px] leading-[18px] whitespace-nowrap tab:text-[16px] tab:leading-6">
        {section.links.map((link) => (
          <li key={link.href}>
            {link.href.startsWith("#") ? (
              <a href={link.href} className="rc-hover-underline">
                {link.label}
              </a>
            ) : (
              <Link
                href={localizeHref(link.href)}
                aria-current={link.active ? "page" : undefined}
                className={link.active ? "rc-underline" : "rc-hover-underline"}
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ------------------------------------------------------------------- cards */

type CardItem = Extract<PageSection, { type: "cards" }>["items"][number];

/** Store pages draw their info blocks as text over plain white PNG panels ("stores-hours.png"). */
const isPanel = (item: CardItem) => !!item.image && /\/stores-[a-z]+\.png/i.test(item.image);

function Cards({ section, ctx }: { section: Extract<PageSection, { type: "cards" }>; ctx: Ctx }) {
  const id = ctx.anchorIds.get(ctx.index);
  const items = section.items;
  // Card rows that open a page (contact, fit guides, first store) hold the largest visible image.
  const preload = ctx.variant === "page" && ctx.index <= 2 && ctx.prev?.type !== "banner";
  const heading = section.heading ? (
    <h2 className={cn(GUTTER, SUBTITLE, "mb-3")}>{section.heading}</h2>
  ) : null;
  const hasText = items.some((i) => i.title || i.html.trim() || i.button);

  // Store info row: STORE HOURS / CONTACT / ABOUT THE STORE.
  if (items.every(isPanel)) {
    return (
      <section id={id} className="scroll-mt-20 grid tab:grid-cols-3">
        {items.map((item, i) => (
          <div key={i} className="px-[18px] pt-11 pb-8 tab:px-[38px] tab:pb-9">
            <CardText item={item} />
          </div>
        ))}
      </section>
    );
  }

  // Staff picks: text panel + wide photo.
  if (items.length === 2 && isPanel(items[0])) {
    return (
      <section id={id} className="scroll-mt-20 pt-9 pb-9">
        {heading}
        <div className={cn(GUTTER, "grid gap-1 tab:grid-cols-[1fr_2fr] tab:gap-1.5")}>
          <div className="px-[6px] pt-5 tab:px-[38px] tab:pt-11">
            <CardText item={items[0]} />
          </div>
          <CardImage item={items[1]} aspect="aspect-[3/2]" sizes="(min-width: 750px) 64vw, 100vw" />
        </div>
      </section>
    );
  }

  // Store gallery: three differently-proportioned photos in a horizontal row.
  if (section.heading.trim().toLowerCase() === "gallery") {
    const shapes = [
      "w-[50vw] aspect-[352/584] tab:w-[24.4vw]",
      "w-full aspect-[576/324] tab:w-[40vw]",
      "w-[70vw] aspect-[426/551] tab:w-[29.6vw]",
    ];
    return (
      <section id={id} className="scroll-mt-20 pt-9">
        {heading}
        <ul className="rc-no-scrollbar flex flex-col items-center gap-12 px-3 py-12 tab:flex-row tab:gap-[6.9vw] tab:overflow-x-auto tab:px-[10vw] tab:py-[7.8vw]">
          {items.map((item, i) => (
            <li key={i} className={cn("relative shrink-0 bg-[#f2f2f2]", shapes[i % shapes.length])}>
              {item.image ? <Image src={item.image} alt="" fill sizes="40vw" className="object-cover" /> : null}
            </li>
          ))}
        </ul>
      </section>
    );
  }

  // Full-bleed photo pairs (manufacturing): no gutter, no gap, 4:5.
  if (!hasText && ctx.variant === "page") {
    return (
      <section id={id} className={cn("scroll-mt-20", "grid", items.length > 1 && "tab:grid-cols-2")}>
        {items.map((item, i) => (
          <CardImage key={i} item={item} aspect="aspect-[4/5]" sizes="(min-width: 750px) 50vw, 100vw" />
        ))}
      </section>
    );
  }

  // Single feature card: the stores directory insets it; store pages run it full width.
  if (items.length === 1) {
    const inset = ctx.handle === "stores";
    return (
      <section id={id} className={cn("scroll-mt-20", GUTTER, inset ? "pb-6 tab:pb-[78px]" : "pt-9 pb-3")}>
        {heading}
        <div className={cn(inset && "px-[8.5%] pt-[8.5%] tab:px-[6.76%] tab:pt-[6.76%]")}>
          <CardImage item={items[0]} aspect="aspect-[16/9]" sizes="(min-width: 750px) 90vw, 100vw" preload={preload} />
          <div className="px-1.5 pt-3">
            <CardText item={items[0]} />
          </div>
        </div>
      </section>
    );
  }

  // Article "shoppable" photo sets: two staggered columns of inset images.
  if (ctx.variant === "article" && items.length >= 3 && !hasText) {
    return (
      <section id={id} className={cn("scroll-mt-20", GUTTER, "py-12")}>
        <ul className="grid gap-y-6 tab:grid-cols-2 tab:gap-x-1.5 tab:gap-y-[60px]">
          {items.map((item, i) => (
            <li key={i} className={cn("tab:px-[12.5%]", i % 2 === 1 && "tab:pt-[21px]", i % 4 === 2 && "tab:px-[14%]")}>
              <CardImage item={item} aspect="aspect-[4/5]" sizes="(min-width: 750px) 36vw, 100vw" />
            </li>
          ))}
        </ul>
      </section>
    );
  }

  // Wholesale/corporate landing: title + link overlaid on the photo.
  if (ctx.compact && items.every((i) => i.title && i.button && i.href && !i.html.trim())) {
    return (
      <section id={id} className={cn("scroll-mt-20", GUTTER, "pt-3 pb-6 tab:pb-3")}>
        <ul className={cn("grid gap-1 tab:gap-1.5", items.length === 2 && "tab:grid-cols-2")}>
          {items.map((item, i) => (
            <li key={i} className="relative text-white">
              <CardImage item={item} aspect="aspect-[4/5]" sizes="(min-width: 750px) 48vw, 100vw" />
              <div className="pointer-events-none absolute bottom-6 left-[18px] tab:bottom-[42px] tab:left-9 [&_a]:pointer-events-auto">
                <CardText item={item} />
              </div>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  // Grid of cards (contact, wholesale, fit guide, article image pairs).
  const slider = items.length >= 3 && ctx.variant !== "article";
  return (
    <section id={id} className={cn("scroll-mt-20", "pt-3", ctx.variant === "article" ? "pb-6" : "pb-6 tab:pb-12")}>
      {heading}
      <ul
        className={cn(
          GUTTER,
          slider
            ? "rc-no-scrollbar flex snap-x snap-mandatory scroll-px-3 gap-1 overflow-x-auto tab:grid tab:gap-1.5 tab:overflow-visible"
            : "grid gap-y-6 tab:gap-x-1.5",
          (items.length === 2 || ctx.variant === "article") && "tab:grid-cols-2",
          ctx.variant !== "article" && items.length === 3 && "tab:grid-cols-3",
          ctx.variant !== "article" && items.length >= 4 && "tab:grid-cols-4",
        )}
      >
        {items.map((item, i) => (
          <li key={i} className={cn(slider && "w-[67.7vw] shrink-0 snap-start tab:w-auto")}>
            <CardImage
              item={item}
              aspect="aspect-[4/5]"
              sizes={`(min-width: 750px) ${ctx.variant === "article" ? 48 : Math.round(96 / Math.min(items.length, 4))}vw, ${slider ? 68 : 100}vw`}
              preload={preload}
            />
            {item.title || item.html.trim() || (item.button && item.href) ? (
              <div className="px-1.5 pt-3">
                <CardText item={item} large />
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function CardImage({
  item,
  aspect,
  sizes,
  preload = false,
}: {
  item: CardItem;
  aspect: string;
  sizes: string;
  preload?: boolean;
}) {
  if (!item.image) return null;
  const media = (
    <span className={cn("relative block overflow-hidden bg-[#f2f2f2]", aspect)}>
      <Image src={item.image} alt={item.title || ""} fill sizes={sizes} preload={preload} className="object-cover" />
    </span>
  );
  return item.href ? (
    <SmartLink href={item.href} className="block">
      {media}
    </SmartLink>
  ) : (
    media
  );
}

function CardText({ item, large = false }: { item: CardItem; large?: boolean }) {
  const title = item.title ? (
    <h3 className={SUBTITLE}>{item.title}</h3>
  ) : null;
  return (
    <>
      {item.href && title ? <SmartLink href={item.href}>{title}</SmartLink> : title}
      <Html html={item.html} className={cn(item.title && "mt-2", BODY, "[&_p:empty]:hidden")} />
      {item.button && item.href ? (
        <SmartLink
          href={item.href}
          className={cn(
            "rc-underline mt-4 inline-block tracking-[1.2px] uppercase",
            large ? "text-[12px] leading-[18px] tab:text-[16px] tab:leading-6" : BODY,
          )}
        >
          {item.button}
        </SmartLink>
      ) : null}
    </>
  );
}

/* --------------------------------------------------------------- accordion */

function Accordion({ section, ctx }: { section: Extract<PageSection, { type: "accordion" }>; ctx: Ctx }) {
  return (
    <section id={ctx.anchorIds.get(ctx.index)} className={cn("scroll-mt-20", GUTTER, "pt-6 pb-9")}>
      {section.heading ? <h2 className={cn(SUBTITLE, "mb-3")}>{section.heading}</h2> : null}
      <div className="border-b border-black">
        {section.items.map((item) => (
          <details key={item.title} className="group border-t border-black">
            <summary className="flex cursor-pointer list-none items-center justify-between py-[22px] [&::-webkit-details-marker]:hidden">
              <h3 className="tracking-[1.2px] uppercase">{item.title}</h3>
              <svg aria-hidden="true" viewBox="0 0 12 12" className="size-3 shrink-0">
                <path d="M0 6h12" stroke="currentColor" />
                <path d="M6 0v12" stroke="currentColor" className="group-open:hidden" />
              </svg>
            </summary>
            <Html html={item.html} className={cn(BODY, "pb-6 [&>*+*]:mt-0! [&_p:empty]:h-[18px]")} />
          </details>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- products */

function Products({ section, ctx }: { section: Extract<PageSection, { type: "products" }>; ctx: Ctx }) {
  const all = getProducts();
  const products = section.handles.map((h) => all[h]).filter(Boolean).map(toSummary);
  if (!products.length) return null;
  return (
    <section id={ctx.anchorIds.get(ctx.index)} className={cn("scroll-mt-20", GUTTER, "pb-6")}>
      {section.heading ? <h2 className={cn(SUBTITLE, "mb-3")}>{section.heading}</h2> : null}
      <ul className="grid grid-cols-2 gap-x-1 gap-y-4 tab:grid-cols-3 tab:gap-x-1.5 tab:gap-y-3">
        {products.map((product) => (
          <li key={product.handle}>
            <ProductGridCard product={product} sizes="(min-width: 750px) 32vw, 48vw" />
          </li>
        ))}
      </ul>
    </section>
  );
}

/* -------------------------------------------------------------------- html */

const POLICY_CLASS = cn(
  "tracking-[1.33px] [&>*+*]:mt-0!",
  "[&_p]:my-3! [&_p]:text-[16px]! [&_p]:leading-[19px]! [&_li]:text-[16px]! [&_li]:leading-[19px]!",
  "[&_.rc-large]:text-[21.33px]! [&_.rc-large]:leading-[27px]!",
  "[&_b]:font-rc-med! [&_b]:font-normal! [&_strong]:font-rc-med! [&_strong]:font-normal!",
  "[&_h1]:font-rc-cond! [&_h1]:text-[24px]! tab:[&_h1]:text-[32px]! [&_h1]:tracking-[1.5px]! [&_h1]:leading-[1.25]!",
  "[&_h2]:mt-6! [&_h2]:text-[21.33px]! [&_h2]:leading-[27px]!",
  "[&_hr]:my-[84px]! [&_hr]:border-black/20!",
  "[&_table]:my-3! [&_table]:table-fixed! [&_td]:border-[#808080]/50! [&_td]:p-3! [&_td]:text-[16px]! [&_td]:leading-[19px]! [&_td]:align-top!",
  "[&_.rc-anchor]:scroll-mt-20! [&_p:has(>.rc-anchor:only-child)]:h-[18px]!",
  "[&_a]:break-words!",
);

function PolicyHtml({ html, handle }: { html: string; handle: string }) {
  return (
    <div className="overflow-x-auto">
      <Html html={html} handle={handle} className={POLICY_CLASS} />
    </div>
  );
}

function HtmlBlock({ section, ctx }: { section: Extract<PageSection, { type: "html" }>; ctx: Ctx }) {
  if (section.source === "featured_blog") {
    return <RelatedArticles articles={getBlog().articles.slice(0, 3)} />;
  }

  if (ctx.variant === "article" && section.source === "main") {
    return (
      <section className="pb-9">
        <Html
          html={section.html}
          className={cn(
            BODY,
            "[&>img:first-child]:w-full! [&>img:first-child]:max-w-none!",
            "[&>:not(img:first-child)]:mx-3! tab:[&>:not(img:first-child)]:mx-8! tab:[&>:not(img:first-child)]:max-w-[917px]!",
            "[&>h1]:mt-9! tab:[&>h1]:mt-[60px]! [&>h1]:font-rc-cond! [&>h1]:text-[24px]! tab:[&>h1]:text-[32px]! [&>h1]:leading-[1.25]! [&>h1]:tracking-[1.5px]! [&>h1]:font-normal!",
            "[&_p_img]:my-6!",
          )}
        />
      </section>
    );
  }

  if (isPolicyPage(ctx.handle)) {
    return (
      <section className={cn(GUTTER, "pt-8 pb-16")}>
        <PolicyHtml html={section.html} handle={ctx.handle} />
      </section>
    );
  }

  return (
    <section className={cn(GUTTER, "pt-3 pb-16")}>
      <div className="tab:max-w-[66.67%]">
        <Html
          html={section.html}
          handle={ctx.handle}
          className={cn(
            BODY,
            "[&_h1]:font-rc-cond! [&_h1]:font-normal! [&_h1]:text-[24px]! tab:[&_h1]:text-[32px]! [&_h1]:leading-[1.25]! [&_h1]:tracking-[1.5px]!",
            "[&_h2]:font-rc-med! [&_h2]:uppercase!",
          )}
        />
        {section.form ? <OptOutForm /> : null}
      </div>
    </section>
  );
}
