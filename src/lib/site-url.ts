import { siteOriginFor } from "@/components/sites/strale/site-config";
import { getSettings } from "@/lib/store-data";

/** Public site origin from the current store settings (bought domain, else the Vercel URL). */
export async function siteOrigin() {
  return siteOriginFor(await getSettings());
}
