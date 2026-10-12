import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/yonetim", "/api/", "/sepet", "/odeme", "/siparis/", "/favoriler"] },
    sitemap: `${siteOrigin()}/sitemap.xml`,
  };
}
