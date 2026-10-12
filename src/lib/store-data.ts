import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { cache } from "react";
import type { Product } from "@/components/sites/strale/catalog";
import seedProducts from "@/components/sites/strale/products.json";
import type { StoreSettings } from "@/components/sites/strale/site-config";
import seedSettings from "@/components/sites/strale/store-settings.json";
import { dbReadCatalog, dbReadSettings } from "@/lib/catalog-db";
import { dbConfigured, dbIdentity } from "@/lib/db";

/**
 * What the storefront shows. With a database connected (Supabase…) products and settings come from it and pages
 * are cached until something changes (`storeChanged()` after every save/order, at the latest hourly).
 * Without one, the JSON files built into the site are used.
 */

const STORE_TAG = "store";

const loadStore = unstable_cache(
  async (): Promise<{ products: Product[]; settings: StoreSettings }> => {
    if (!dbConfigured()) return { products: seedProducts as Product[], settings: seedSettings as StoreSettings };
    const [catalog, settings] = await Promise.all([dbReadCatalog(), dbReadSettings()]);
    return { products: catalog.products, settings: settings.settings };
  },
  // The source is part of the key: the data cache survives deploys, so connecting a database must not serve the
  // file-based result (and vice versa).
  ["strale-store", dbIdentity()],
  { tags: [STORE_TAG], revalidate: 3600 },
);

/** All products incl. drafts + settings (deduplicated within one render). */
export const getStoreData = cache(() => loadStore());

/** Products visible on the site (drafts hidden). */
export async function getProducts() {
  return (await getStoreData()).products.filter((product) => !product.draft);
}

export async function getSettings() {
  return (await getStoreData()).settings;
}

/** Call after any change to products, stock or settings: the next visit renders fresh pages. */
export function storeChanged() {
  revalidateTag(STORE_TAG, { expire: 0 });
  revalidatePath("/", "layout");
}
