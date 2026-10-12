import type { Product } from "@/components/sites/strale/catalog";

/** Pure stock arithmetic shared by the database and the GitHub/file catalogue. */

export type StockLine = { handle: string; size: string; qty: number };

/** Pieces left for a product/size (per-size stock when the product tracks it). */
export function available(product: Product, size: string) {
  if (product.draft || !product.sizes.includes(size)) return 0;
  return product.sizeStock ? (product.sizeStock[size] ?? 0) : product.stock;
}

/** Same handle + size lines added together (a basket can hold the same item twice). */
export function mergeLines(lines: StockLine[]) {
  const map = new Map<string, StockLine>();
  for (const line of lines) {
    const key = `${line.handle}\u0000${line.size}`;
    const existing = map.get(key);
    map.set(key, existing ? { ...existing, qty: existing.qty + line.qty } : { ...line });
  }
  return [...map.values()];
}

export function shortages(products: Product[], lines: StockLine[]) {
  return mergeLines(lines).filter((line) => {
    const product = products.find((p) => p.handle === line.handle);
    return !product || available(product, line.size) < line.qty;
  });
}

/** Takes (`-1`) or returns (`+1`) the lines' pieces; products not in the lines are returned unchanged. */
export function adjustStock(products: Product[], lines: StockLine[], sign: 1 | -1) {
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
