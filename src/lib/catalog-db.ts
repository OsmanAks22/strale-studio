import type { Product } from "@/components/sites/strale/catalog";
import seedProducts from "@/components/sites/strale/products.json";
import type { StoreSettings } from "@/components/sites/strale/site-config";
import seedSettings from "@/components/sites/strale/store-settings.json";
import { ConflictError } from "@/lib/admin/repo";
import { query, transaction } from "@/lib/db";
import { adjustStock, mergeLines, shortages, type StockLine } from "@/lib/stock-math";

/**
 * Product catalogue + store settings in Postgres (used whenever a database is connected).
 * The first time, products.json and store-settings.json from the repo are copied in.
 * `catalog_version` goes up on every change, so the admin panel can tell when someone else saved meanwhile.
 */

const SEED_LOCK = 734_002;
const globalForSeed = globalThis as unknown as { straleSeed?: Promise<void> };

async function seed() {
  await transaction(async (client) => {
    await client.query("select pg_advisory_xact_lock($1)", [SEED_LOCK]);
    const done = await client.query("select 1 from store_meta where key = 'seeded'");
    if (done.rowCount) return;
    await client.query(
      `insert into products (handle, position, data)
       select e->>'handle', (ord - 1)::int, e from jsonb_array_elements($1::jsonb) with ordinality as t(e, ord)
       on conflict (handle) do nothing`,
      [JSON.stringify(seedProducts)],
    );
    await client.query("insert into store_meta (key, value) values ('settings', $1::jsonb) on conflict (key) do nothing", [
      JSON.stringify(seedSettings),
    ]);
    await client.query("insert into store_meta (key, value) values ('catalog_version', '1') on conflict (key) do nothing");
    await client.query("insert into store_meta (key, value) values ('seeded', 'true')");
    await client.query("insert into catalog_log (message) values ($1)", [
      `İlk kurulum: ${seedProducts.length} ürün ve mağaza ayarları veritabanına aktarıldı`,
    ]);
  });
}

async function seeded() {
  globalForSeed.straleSeed ??= seed().catch((error) => {
    globalForSeed.straleSeed = undefined;
    throw error;
  });
  await globalForSeed.straleSeed;
}

export async function dbReadCatalog() {
  await seeded();
  const [rows, version] = await Promise.all([
    query<{ data: Product }>("select data from products order by position, handle"),
    query<{ value: number }>("select value from store_meta where key = 'catalog_version'"),
  ]);
  return { products: rows.map((r) => r.data), version: String(version[0]?.value ?? 0) };
}

async function bumpVersion(client: { query: (text: string, params?: unknown[]) => Promise<{ rows: { value: number }[] }> }, base: string | null, force: boolean) {
  const { rows } = await client.query("select value from store_meta where key = 'catalog_version' for update");
  const current = String(rows[0]?.value ?? 0);
  if (!force && base !== null && current !== base) {
    throw new ConflictError("Siz düzenlerken başka bir yerden değiştirilmiş.");
  }
  const next = String(Number(current) + 1);
  await client.query("update store_meta set value = $1::jsonb, updated_at = now() where key = 'catalog_version'", [next]);
  return next;
}

/** Replaces the whole catalogue (order = list order) in one transaction. */
export async function dbWriteCatalog(products: Product[], baseVersion: string, force: boolean, message: string) {
  await seeded();
  return transaction(async (client) => {
    const version = await bumpVersion(client, baseVersion, force);
    await client.query("delete from products where not (handle = any($1::text[]))", [products.map((p) => p.handle)]);
    await client.query(
      `insert into products (handle, position, data)
       select e->>'handle', (ord - 1)::int, e from jsonb_array_elements($1::jsonb) with ordinality as t(e, ord)
       on conflict (handle) do update set position = excluded.position, data = excluded.data,
         updated_at = case when products.data = excluded.data then products.updated_at else now() end`,
      [JSON.stringify(products)],
    );
    await client.query("insert into catalog_log (message) values ($1)", [message]);
    return version;
  });
}

/**
 * Takes (`-1`) or returns (`+1`) stock. Row locks + the version lock make concurrent orders queue up, so the
 * last piece can only be sold once.
 */
export async function dbApplyStock(lines: StockLine[], sign: 1 | -1, reason: string) {
  await seeded();
  const merged = mergeLines(lines);
  return transaction(async (client) => {
    await bumpVersion(client, null, true);
    const { rows } = await client.query<{ data: Product }>("select data from products where handle = any($1::text[]) for update", [
      [...new Set(merged.map((l) => l.handle))],
    ]);
    const products = rows.map((r) => r.data);
    if (sign === -1) {
      const short = shortages(products, merged);
      if (short.length) {
        // Nothing changed yet; abort the version bump too.
        throw new ShortageError(short);
      }
    }
    for (const product of adjustStock(products, merged, sign)) {
      await client.query("update products set data = $2::jsonb, updated_at = now() where handle = $1", [product.handle, JSON.stringify(product)]);
    }
    await client.query("insert into catalog_log (message) values ($1)", [`Stok: ${reason}`]);
    return { ok: true as const };
  }).catch((error) => {
    if (error instanceof ShortageError) return { ok: false as const, error: "short" as const, short: error.short };
    throw error;
  });
}

class ShortageError extends Error {
  constructor(public short: StockLine[]) {
    super("short");
  }
}

/** Stored settings on top of the defaults, so fields added later always exist. */
function withDefaults(value: Partial<StoreSettings>): StoreSettings {
  const base = seedSettings as StoreSettings;
  return {
    ...base,
    ...value,
    company: { ...base.company, ...value.company },
    payment: { ...base.payment, ...value.payment },
    bank: { ...base.bank, ...value.bank },
    announcement: { ...base.announcement, ...value.announcement },
  };
}

export async function dbReadSettings() {
  await seeded();
  const rows = await query<{ value: Partial<StoreSettings>; updated_at: Date }>("select value, updated_at from store_meta where key = 'settings'");
  return { settings: withDefaults(rows[0]?.value ?? {}), version: rows[0]?.updated_at ? new Date(rows[0].updated_at).toISOString() : "0" };
}

export async function dbWriteSettings(settings: StoreSettings, baseVersion: string, force: boolean) {
  await seeded();
  return transaction(async (client) => {
    const { rows } = await client.query<{ updated_at: Date }>("select updated_at from store_meta where key = 'settings' for update");
    const current = rows[0]?.updated_at ? new Date(rows[0].updated_at).toISOString() : "0";
    if (!force && current !== baseVersion) throw new ConflictError("Ayarlar siz düzenlerken başka bir yerden değiştirilmiş.");
    const saved = await client.query<{ updated_at: Date }>(
      `insert into store_meta (key, value, updated_at) values ('settings', $1::jsonb, clock_timestamp())
       on conflict (key) do update set value = excluded.value, updated_at = excluded.updated_at returning updated_at`,
      [JSON.stringify(settings)],
    );
    await client.query("insert into catalog_log (message) values ($1)", ["Panel: mağaza ayarları güncellendi"]);
    return new Date(saved.rows[0].updated_at).toISOString();
  });
}

export async function dbHistory(limit = 30) {
  await seeded();
  return query<{ id: number; at: Date; message: string }>("select id, at, message from catalog_log order by id desc limit $1", [limit]);
}
