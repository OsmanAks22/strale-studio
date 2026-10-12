import type { Product } from "@/components/sites/strale/catalog";
import { checkProduct, IMAGE_DIR, normalizeProduct, productImages } from "@/components/sites/strale/product-rules";
import { requireAdmin } from "@/lib/admin/auth";
import { errorResponse, getRepo, PRODUCTS_PATH, readProducts, serializeJson, type Upload } from "@/lib/admin/repo";
import { withStockLock } from "@/lib/stock";

/** Latest catalogue straight from the repo (may be newer than what the deployed site shows). */
export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    const repo = getRepo();
    const { products, version } = await readProducts(repo);
    return Response.json({ products, version, mode: repo.mode, label: repo.label, rawBase: repo.rawBase });
  } catch (error) {
    return errorResponse(error);
  }
}

type SaveBody = { products?: Product[]; baseVersion?: string; force?: boolean; uploads?: Upload[] };

const repoPath = (publicPath: string) => `public${publicPath}`;

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

    const repo = getRepo();
    const { products: before } = await readProducts(repo);
    const used = new Set(products.flatMap(productImages));
    // Only publish photos a product still points at; an uncropped original (kept for the AI pipeline)
    // goes along with its cropped photo.
    const uploads = (body.uploads ?? []).filter((u) =>
      used.has(u.path.replace(/^public/, "").replace(/^docs\/products\/fotograflar\//, `${IMAGE_DIR}/`)),
    );
    // Photos no product uses any more are removed from the repo.
    const deletes = [...new Set(before.flatMap(productImages))]
      .filter((path) => !used.has(path) && path.startsWith(`${IMAGE_DIR}/`))
      .map(repoPath);

    // Same lock as orders, so a panel save and an order never write products.json at the same moment.
    const result = await withStockLock(() => repo.commit({
      files: [{ path: PRODUCTS_PATH, content: serializeJson(products), baseVersion: body.baseVersion }],
      force: body.force,
      uploads,
      deletes,
      message: summary(before, products),
    }));
    return Response.json({ version: result.versions[PRODUCTS_PATH], commit: result.commit, url: result.url, products });
  } catch (error) {
    return errorResponse(error);
  }
}
