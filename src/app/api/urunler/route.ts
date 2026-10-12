import type { NextRequest } from "next/server";
import { getProducts } from "@/lib/store-data";

/** Public product data by handle for client components (basket, favourites, recently viewed). */
export async function GET(request: NextRequest) {
  const handles = (request.nextUrl.searchParams.get("h") ?? "")
    .split(",")
    .map((h) => h.trim())
    .filter((h) => /^[a-z0-9-]+$/.test(h))
    .slice(0, 60);
  const products = await getProducts();
  const found = handles.flatMap((handle) => {
    const product = products.find((p) => p.handle === handle);
    if (!product) return [];
    // The stock code is internal.
    const visible = { ...product };
    delete visible.sku;
    return [visible];
  });
  return Response.json(
    { products: found },
    { headers: { "Cache-Control": "public, max-age=0, s-maxage=30, stale-while-revalidate=300" } },
  );
}
