"use client";

/**
 * Catalog imagery stays on Shopify's CDN, which resizes through a `width` query param.
 * Local files (the homepage assets) are served as-is.
 */
export default function shopifyImageLoader({ src, width }: { src: string; width: number }) {
  if (/(cdn\.shopify\.com|reigningchamp\.com\/cdn\/)/.test(src)) {
    const url = new URL(src.startsWith("//") ? `https:${src}` : src);
    url.searchParams.set("width", String(width));
    return url.toString();
  }
  return `${src}${src.includes("?") ? "&" : "?"}w=${width}`;
}
