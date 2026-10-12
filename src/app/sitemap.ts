import type { MetadataRoute } from "next";
import { allProducts, collectionSlugs } from "@/components/sites/strale/catalog";
import { contentPages } from "@/components/sites/strale/content-pages";
import { siteOrigin } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = siteOrigin();
  return [
    { url: `${origin}/`, changeFrequency: "daily", priority: 1 },
    ...collectionSlugs.map((slug) => ({ url: `${origin}/koleksiyonlar/${slug}`, changeFrequency: "daily" as const, priority: 0.8 })),
    ...allProducts
      .filter((p) => p.stock > 0)
      .map((p) => ({ url: `${origin}/urun/${p.handle}`, changeFrequency: "weekly" as const, priority: 0.7, images: p.image ? [`${origin}${p.image}`] : undefined })),
    ...Object.keys(contentPages).map((slug) => ({ url: `${origin}/sayfa/${slug}`, changeFrequency: "monthly" as const, priority: 0.3 })),
  ];
}
