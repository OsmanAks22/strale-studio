"use client";

import { RecentlyViewed } from "../recently-viewed";
import { useRecentlyViewed } from "../stores";

/** The source only shows "Recently Viewed" on a product page once something else has been viewed. */
export function RecentlyViewedRow({ exclude }: { exclude: string }) {
  const others = useRecentlyViewed().filter((item) => item.handle !== exclude);
  return others.length ? <RecentlyViewed exclude={exclude} /> : null;
}
