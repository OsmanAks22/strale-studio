import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/site-url";

export default async function robots(): Promise<MetadataRoute.Robots> {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/yonetim", "/api/", "/sepet", "/odeme", "/siparis/", "/favoriler"] },
    sitemap: `${await siteOrigin()}/sitemap.xml`,
  };
}
