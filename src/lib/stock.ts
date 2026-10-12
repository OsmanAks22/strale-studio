import { catalogFile, type Product } from "@/components/sites/strale/catalog";
import { ConflictError, PRODUCTS_PATH, readProducts, serializeJson, tryGetRepo } from "@/lib/admin/repo";
import { dbConfigured, transaction } from "@/lib/db";

/** Any constant; identifies the stock lock in Postgres. */
const STOCK_LOCK = 734_001;

/**
 * Runs stock changes one at a time across every server instance (Postgres advisory lock), so two customers
 * can never both buy the last piece.
 */
export async function withStockLock<T>(work: () => Promise<T>) {
  if (!dbConfigured()) return work();
  return transaction(async (client) => {
    await client.query("select pg_advisory_xact_lock($1)", [STOCK_LOCK]);
    return work();
  });
}

/** Pieces left for a product/size (per-size stock when the product tracks it). */
export function available(product: Product, size: string) {
  if (product.draft || !product.sizes.includes(size)) return 0;
  return product.sizeStock ? (product.sizeStock[size] ?? 0) : product.stock;
}

export type StockLine = { handle: string; size: string; qty: number };

/** Freshest catalogue: the repo (includes panel edits not deployed yet), else the one built into the site. */
export async function currentProducts() {
  const repo = tryGetRepo();
  if (!repo) return { products: catalogFile, live: false };
  return { products: (await readProducts(repo)).products, live: true };
}

/** Same handle + size lines added together (a basket can hold the same item twice). */
function merge(lines: StockLine[]) {
  const map = new Map<string, StockLine>();
  for (const line of lines) {
    const key = `${line.handle}\u0000${line.size}`;
    const existing = map.get(key);
    map.set(key, existing ? { ...existing, qty: existing.qty + line.qty } : { ...line });
  }
  return [...map.values()];
}

export function shortages(products: Product[], lines: StockLine[]) {
  return merge(lines).filter((line) => {
    const product = products.find((p) => p.handle === line.handle);
    return !product || available(product, line.size) < line.qty;
  });
}

function adjust(products: Product[], lines: StockLine[], sign: 1 | -1) {
  return products.map((product) => {
    const mine = lines.filter((l) => l.handle === product.handle);
    if (!mine.length) return product;
    const next = { ...product };
    if (next.sizeStock) {
      next.sizeStock = { ...next.sizeStock };
      for (const line of mine) next.sizeStock[line.size] = Math.max(0, (next.sizeStock[line.size] ?? 0) + sign * line.qty);
      next.stock = Object.values(next.sizeStock).reduce((a, b) => a + b, 0);
    } else {
      next.stock = Math.max(0, next.stock + sign * mine.reduce((sum, l) => sum + l.qty, 0));
    }
    return next;
  });
}

/**
 * Takes (`-1`) or returns (`+1`) stock in products.json with one commit, retrying when another save lands
 * first. Taking fails without changes if any line is short.
 */
export async function applyStock(lines: StockLine[], sign: 1 | -1, reason: string) {
  return withStockLock(() => applyStockUnlocked(lines, sign, reason));
}

async function applyStockUnlocked(lines: StockLine[], sign: 1 | -1, reason: string) {
  const repo = tryGetRepo();
  if (!repo) return { ok: false as const, error: "no-repo" as const };
  const merged = merge(lines);
  for (let attempt = 0; attempt < 4; attempt++) {
    const { products, version } = await readProducts(repo);
    if (sign === -1) {
      const short = shortages(products, merged);
      if (short.length) return { ok: false as const, error: "short" as const, short };
    }
    try {
      await repo.commit({
        files: [{ path: PRODUCTS_PATH, content: serializeJson(adjust(products, merged, sign)), baseVersion: version }],
        message: `Stok: ${reason}`,
      });
      return { ok: true as const };
    } catch (error) {
      if (!(error instanceof ConflictError)) throw error;
    }
  }
  throw new Error("Stok güncellenemedi (çok sayıda eşzamanlı değişiklik). Lütfen tekrar deneyin.");
}
