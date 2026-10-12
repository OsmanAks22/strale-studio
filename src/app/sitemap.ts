import type { MetadataRoute } from "next";
import { collectionSlugs } from "@/components/sites/strale/catalog";
import { contentPageSlugs } from "@/components/sites/strale/content-pages";
import { siteOrigin } from "@/lib/site-url";
import { getProducts } from "@/lib/store-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [origin, products] = await Promise.all([siteOrigin(), getProducts()]);
  const absolute = (src: string) => (src.startsWith("http") ? src : `${origin}${src}`);
  return [
    { url: `${origin}/`, changeFrequency: "daily", priority: 1 },
    ...collectionSlugs.map((slug) => ({ url: `${origin}/koleksiyonlar/${slug}`, changeFrequency: "daily" as const, priority: 0.8 })),
    ...products
      .filter((p) => p.stock > 0)
      .map((p) => ({
        url: `${origin}/urun/${p.handle}`,
        changeFrequency: "weekly" as const,
        priority: 0.7,
        images: p.image ? [absolute(p.image)] : undefined,
      })),
    ...contentPageSlugs.map((slug) => ({ url: `${origin}/sayfa/${slug}`, changeFrequency: "monthly" as const, priority: 0.3 })),
  ];
}
