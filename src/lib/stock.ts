import type { Product } from "@/components/sites/strale/catalog";
import { dbApplyStock, dbReadCatalog } from "@/lib/catalog-db";
import { dbConfigured } from "@/lib/db";
import { getStoreData } from "@/lib/store-data";
import type { StockLine } from "@/lib/stock-math";

export { available, shortages, type StockLine } from "@/lib/stock-math";

/**
 * Freshest catalogue for pricing an order: straight from the database (not the page cache). Without a database
 * the catalogue only changes with a rebuild, so the built-in copy is current.
 */
export async function currentProducts(): Promise<{ products: Product[] }> {
  if (dbConfigured()) return { products: (await dbReadCatalog()).products };
  return { products: (await getStoreData()).products };
}

/**
 * Takes (`-1`) or returns (`+1`) stock for an order. Only orders saved in the database move stock, and with a
 * database the catalogue lives there too (row locks make concurrent orders queue up).
 */
export async function applyStock(lines: StockLine[], sign: 1 | -1, reason: string) {
  if (!dbConfigured()) return { ok: false as const, error: "no-db" as const };
  return dbApplyStock(lines, sign, reason);
}
