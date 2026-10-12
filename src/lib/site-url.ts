import { siteConfig } from "@/components/sites/strale/site-config";

/** Public site origin: the bought domain, else Vercel's production URL, else localhost. */
export function siteOrigin() {
  if (siteConfig.domain) return `https://${siteConfig.domain}`;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  return vercel ? `https://${vercel}` : "http://localhost:3000";
}
