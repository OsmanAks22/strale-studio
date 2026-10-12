import { Pool, type PoolClient } from "pg";

/**
 * Postgres (Supabase, Neon or any other) for orders, back-in-stock requests, discount codes and — when connected —
 * the product catalogue and store settings. Personal data never goes to the public repo.
 * Set DATABASE_URL (or POSTGRES_URL, which the Vercel Supabase/Neon integrations add). Tables are created on first use.
 */

const connectionString = () => process.env.DATABASE_URL || process.env.POSTGRES_URL || "";

export const dbConfigured = () => Boolean(connectionString());

/** Which database (host + name) is connected, or "file"; used to keep caches of different sources apart. */
export function dbIdentity() {
  const url = connectionString();
  if (!url) return "file";
  const parsed = new URL(url);
  return `db:${parsed.host}${parsed.pathname}`;
}

const globalForDb = globalThis as unknown as { stralePool?: Pool; straleSchema?: Promise<void> };

/**
 * SSL is decided here, not by the URL: node-postgres lets `sslmode=require` in the URL override the `ssl` option
 * and then insists on a publicly trusted certificate, which Supabase (own CA) does not have.
 * - localhost: no SSL
 * - Supabase: encrypted; verified only when DATABASE_CA_CERT (the project's CA, PEM) is set
 * - others (Neon…): encrypted and verified
 */
export function connectionConfig(url: string) {
  const parsed = new URL(url);
  const host = parsed.hostname;
  const sslmode = parsed.searchParams.get("sslmode");
  for (const key of ["sslmode", "sslrootcert", "sslcert", "sslkey", "sslnegotiation", "uselibpqcompat", "supa", "pgbouncer"]) {
    parsed.searchParams.delete(key);
  }
  const local = host === "localhost" || host === "127.0.0.1" || host === "::1";
  const ca = process.env.DATABASE_CA_CERT?.replace(/\\n/g, "\n");
  const ssl =
    local || sslmode === "disable"
      ? false
      : ca
        ? { ca, rejectUnauthorized: true }
        : /(^|\.)supabase\.(co|com)$/.test(host)
          ? { rejectUnauthorized: false }
          : { rejectUnauthorized: true };
  return { connectionString: parsed.toString(), ssl };
}

function pool() {
  if (!globalForDb.stralePool) {
    globalForDb.stralePool = new Pool({ ...connectionConfig(connectionString()), max: 3, idleTimeoutMillis: 10_000 });
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
create table if not exists products (
  handle text primary key,
  position integer not null,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
create table if not exists store_meta (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
create table if not exists catalog_log (
  id serial primary key,
  at timestamptz not null default now(),
  message text not null
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
