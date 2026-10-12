import { Pool, type PoolClient } from "pg";

/**
 * Postgres for orders, back-in-stock requests and discount codes (personal data never goes to the public repo).
 * Set DATABASE_URL (or POSTGRES_URL, which Vercel's Neon integration adds). Tables are created on first use.
 */

const connectionString = () => process.env.DATABASE_URL || process.env.POSTGRES_URL || "";

export const dbConfigured = () => Boolean(connectionString());

const globalForDb = globalThis as unknown as { stralePool?: Pool; straleSchema?: Promise<void> };

function pool() {
  if (!globalForDb.stralePool) {
    const url = connectionString();
    const local = /@(localhost|127\.0\.0\.1)[:/]/.test(url);
    globalForDb.stralePool = new Pool({
      connectionString: url,
      ssl: local ? undefined : { rejectUnauthorized: false },
      max: 3,
      idleTimeoutMillis: 10_000,
    });
  }
  return globalForDb.stralePool;
}

const SCHEMA = `
create table if not exists orders (
  id serial primary key,
  code text unique not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'yeni',
  payment_method text not null,
  payment_status text not null default 'bekliyor',
  customer jsonb not null,
  items jsonb not null,
  subtotal integer not null,
  discount integer not null default 0,
  discount_code text,
  shipping integer not null,
  cod_fee integer not null default 0,
  total integer not null,
  carrier text,
  tracking text,
  admin_note text,
  stock_applied boolean not null default false,
  payment_ref text
);
create index if not exists orders_created_idx on orders (created_at desc);
create table if not exists stock_alerts (
  id serial primary key,
  created_at timestamptz not null default now(),
  handle text not null,
  size text,
  name text not null,
  phone text not null,
  notified_at timestamptz
);
create table if not exists discount_codes (
  code text primary key,
  kind text not null check (kind in ('yuzde', 'tutar')),
  value integer not null check (value > 0),
  min_total integer not null default 0,
  active boolean not null default true,
  expires_at timestamptz,
  usage_limit integer,
  used_count integer not null default 0,
  created_at timestamptz not null default now()
);
`;

async function ready() {
  globalForDb.straleSchema ??= pool()
    .query(SCHEMA)
    .then(() => undefined)
    .catch((error) => {
      globalForDb.straleSchema = undefined;
      throw error;
    });
  await globalForDb.straleSchema;
}

export async function query<T = Record<string, unknown>>(text: string, params: unknown[] = []) {
  await ready();
  const result = await pool().query(text, params);
  return result.rows as T[];
}

export async function transaction<T>(work: (client: PoolClient) => Promise<T>) {
  await ready();
  const client = await pool().connect();
  try {
    await client.query("begin");
    const result = await work(client);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export * from "./order-types";
