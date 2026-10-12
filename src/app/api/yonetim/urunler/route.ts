import type { Product } from "@/components/sites/strale/catalog";
import { checkProduct, IMAGE_DIR, normalizeProduct, productImages } from "@/components/sites/strale/product-rules";
import { requireAdmin } from "@/lib/admin/auth";
import { catalogInfo, readCatalog, saveCatalog } from "@/lib/admin/catalog-store";
import { errorResponse, type Upload } from "@/lib/admin/repo";
import { storeChanged } from "@/lib/store-data";

/** Latest catalogue straight from the database / repo (may be newer than the cached pages). */
export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    const info = catalogInfo();
    const { products, version } = await readCatalog();
    return Response.json({ products, version, ...info });
  } catch (error) {
    return errorResponse(error);
  }
}

type SaveBody = { products?: Product[]; baseVersion?: string; force?: boolean; uploads?: Upload[] };

function summary(before: Product[], after: Product[]) {
  const old = new Map(before.map((p) => [p.handle, p]));
  const added = after.filter((p) => !old.has(p.handle));
  const removed = before.filter((p) => !after.some((n) => n.handle === p.handle));
  const changed = after.filter((p) => old.has(p.handle) && JSON.stringify(old.get(p.handle)) !== JSON.stringify(p));
  const parts = [
    added.length ? `${added.length} ürün eklendi` : "",
    changed.length ? `${changed.length} ürün güncellendi` : "",
    removed.length ? `${removed.length} ürün silindi` : "",
  ].filter(Boolean);
  const names = [...added, ...changed, ...removed].slice(0, 6).map((p) => `- ${p.name}${p.color ? ` (${p.color})` : ""}`);
  return `Panel: ${parts.join(", ") || "sıralama değişti"}\n\n${names.join("\n")}`.trim();
}

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    const body = (await request.json()) as SaveBody;
    if (!Array.isArray(body.products) || typeof body.baseVersion !== "string") {
      return Response.json({ error: "Eksik veri." }, { status: 400 });
    }
    const products = body.products.map(normalizeProduct);
    const errors = products.flatMap((product) =>
      checkProduct(product, products)
        .filter((issue) => issue.level === "error")
        .map((issue) => `${product.name || product.handle}: ${issue.message}`),
    );
    if (errors.length) return Response.json({ error: "Kaydedilemedi", errors }, { status: 400 });

    const { products: before } = await readCatalog();
    const used = new Set(products.flatMap(productImages));
    // Only publish repo photos a product still points at; an uncropped original (kept for the AI pipeline)
    // goes along with its cropped photo. (Supabase Storage photos are uploaded straight away.)
    const uploads = (body.uploads ?? []).filter((u) =>
      used.has(u.path.replace(/^public/, "").replace(/^docs\/products\/fotograflar\//, `${IMAGE_DIR}/`)),
    );
    // Photos no product uses any more are removed.
    const removed = [...new Set(before.flatMap(productImages))].filter((src) => !used.has(src));

    // In the database, the catalogue version lock queues this save behind any order that is taking stock.
    const result = await saveCatalog({
      products,
      before,
      baseVersion: body.baseVersion!,
      force: body.force,
      uploads,
      removed,
      message: summary(before, products),
    });
    storeChanged();
    return Response.json({ ...result, products });
  } catch (error) {
    return errorResponse(error);
  }
}
