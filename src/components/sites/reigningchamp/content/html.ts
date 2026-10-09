import { getAliases, getBlog, getCollection, getPages, getProducts } from "../catalog";
import { policyAnchors, policyLargeText } from "./policy-format";

const ORIGIN_RE = /^https?:\/\/(?:www\.)?reigningchamp\.com/i;

/**
 * Maps a source link onto the clone's routes. Anything the snapshot does not contain
 * (a product that has since been removed) falls back to a search for its name, so no
 * internal link dead-ends in a 404.
 */
export function localizeHref(href: string): string {
  if (!href) return href;
  const local = href.replace(ORIGIN_RE, "") || "/";
  if (!local.startsWith("/") || local.startsWith("//")) return href;

  const [pathAndQuery, hash = ""] = local.split("#");
  const [rawPath, query = ""] = pathAndQuery.split("?");
  const path = rawPath.replace(/\/$/, "") || "/";
  const suffix = `${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`;

  const alias = getAliases().pages[path];
  if (alias) return alias + suffix;

  const nested = path.match(/^\/collections\/[^/]+\/products\/([^/]+)$/);
  const product = nested?.[1] ?? path.match(/^\/products\/([^/]+)$/)?.[1];
  if (product) {
    if (getProducts()[product]) return `/products/${product}${suffix}`;
    return `/search?q=${encodeURIComponent(product.replace(/-/g, " "))}`;
  }

  const collection = path.match(/^\/collections\/([^/]+)$/)?.[1];
  if (collection) {
    const found = getCollection(collection);
    return found ? `/collections/${found.handle}${suffix}` : `/search?q=${encodeURIComponent(collection.replace(/-/g, " "))}`;
  }

  const page = path.match(/^\/pages\/([^/]+)$/)?.[1];
  if (page && page !== "wishlist" && !getPages()[page]) return "/";

  const article = path.match(/^\/blogs\/the-intermission\/([^/]+)$/)?.[1];
  if (article && !getBlog().posts[article]) return "/blogs/the-intermission";

  return path + suffix;
}

export function isExternal(href: string) {
  return /^(https?:)?\/\//.test(href) || href.startsWith("mailto:") || href.startsWith("tel:");
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", nbsp: " " };

/** Visible text of an HTML fragment with whitespace removed (used to match paragraphs). */
function textKey(html: string) {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (_, name: string) => ENTITIES[name])
    .replace(/\s+/g, "");
}

/**
 * Prepares snapshot HTML for rendering: localizes links, opens external links in a new tab,
 * and for policy pages restores the in-page anchor targets and 16pt headings the sanitiser dropped.
 */
export function prepareHtml(html: string, handle?: string) {
  let out = html.replace(/<a href="([^"]*)"/g, (_, href: string) => {
    const decoded = href.replace(/&amp;/g, "&");
    if (decoded.startsWith("#")) return `<a href="${href}"`;
    const local = localizeHref(decoded);
    if (isExternal(local)) {
      return `<a href="${local.replace(/&/g, "&amp;")}" target="_blank" rel="noreferrer"`;
    }
    return `<a href="${local.replace(/&/g, "&amp;")}"`;
  });
  // The sanitiser keeps target/rel from some sources; avoid duplicated attributes.
  out = out.replace(/(target="_blank" rel="noreferrer")((?:\s+(?:rel|target)="[^"]*")+)/g, "$1");

  if (handle) {
    const anchors = policyAnchors[handle];
    if (anchors) {
      let index = 0;
      out = out.replace(/<a><\/a>/g, () => {
        const id = anchors[index++];
        return id ? `<a id="${id}" class="rc-anchor"></a>` : "";
      });
    }
    const large = policyLargeText[handle];
    if (large?.length) {
      // Walk paragraphs in order so a repeated title ("Shipping Options" as a section heading and
      // later as a sub-heading) is only enlarged where the source enlarges it.
      const keys = large.map(textKey);
      let next = 0;
      out = out.replace(/<p>([\s\S]*?)<\/p>/g, (match, inner: string) => {
        // A table-of-contents link repeats its heading's text; only the heading itself is large.
        if (next >= keys.length || /^\s*<a [^>]*>[^<]*<\/a>\s*$/.test(inner)) return match;
        const key = textKey(inner);
        const found = keys.slice(next, next + 4).indexOf(key);
        if (found < 0) return match;
        next += found + 1;
        return `<p class="rc-large">${inner}</p>`;
      });
    }
  }
  return out;
}

export function isPolicyPage(handle: string) {
  return handle in policyLargeText;
}
