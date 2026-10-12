/**
 * Product photos in Supabase Storage (public bucket), used when SUPABASE_URL + a secret key are set.
 * Without it, photos go into the GitHub repo like before.
 *
 * Keys: the new secret key (sb_secret_…) goes only in the `apikey` header; a legacy service_role key (a JWT)
 * also goes in `Authorization: Bearer`.
 */

const BUCKET = process.env.SUPABASE_BUCKET || "urunler";

function config() {
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "");
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return url && key ? { url, key } : null;
}

export const storageConfigured = () => Boolean(config());

function headers(key: string, extra: Record<string, string> = {}) {
  return { apikey: key, ...(key.startsWith("sb_") ? {} : { Authorization: `Bearer ${key}` }), ...extra };
}

function required() {
  const c = config();
  if (!c) throw new Error("Supabase Storage ayarlı değil (SUPABASE_URL ve SUPABASE_SECRET_KEY).");
  return c;
}

const publicPrefix = (url: string) => `${url}/storage/v1/object/public/${BUCKET}/`;

export function storagePublicUrl(path: string) {
  return `${publicPrefix(required().url)}${path}`;
}

/** Object path ("urun/x.jpg") for one of our public URLs, else null. */
export function storagePathOf(src: string) {
  const c = config();
  if (!c || !src.startsWith(publicPrefix(c.url))) return null;
  return decodeURIComponent(src.slice(publicPrefix(c.url).length));
}

async function createBucket() {
  const { url, key } = required();
  const response = await fetch(`${url}/storage/v1/bucket`, {
    method: "POST",
    headers: headers(key, { "Content-Type": "application/json" }),
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true, allowed_mime_types: ["image/jpeg"], file_size_limit: 5 * 1024 * 1024 }),
  });
  if (!response.ok && !/already exists/i.test(await response.text())) {
    throw new Error(`Supabase Storage klasörü oluşturulamadı (${response.status}).`);
  }
}

/** Uploads a JPEG and returns its public URL (file names are unique, so it can be cached forever). */
export async function uploadImage(path: string, bytes: Buffer, attempt = 0): Promise<string> {
  const { url, key } = required();
  const response = await fetch(`${url}/storage/v1/object/${BUCKET}/${path}`, {
    method: "POST",
    headers: headers(key, { "Content-Type": "image/jpeg", "x-upsert": "true", "cache-control": "max-age=31536000" }),
    body: new Uint8Array(bytes),
  });
  if (!response.ok) {
    const text = await response.text();
    if (attempt === 0 && /bucket not found/i.test(text)) {
      await createBucket();
      return uploadImage(path, bytes, 1);
    }
    throw new Error(`Fotoğraf yüklenemedi (Supabase ${response.status}): ${text.slice(0, 200)}`);
  }
  return storagePublicUrl(path);
}

export async function deleteImages(paths: string[]) {
  if (!paths.length || !config()) return;
  const { url, key } = required();
  const response = await fetch(`${url}/storage/v1/object/${BUCKET}`, {
    method: "DELETE",
    headers: headers(key, { "Content-Type": "application/json" }),
    body: JSON.stringify({ prefixes: paths }),
  });
  if (!response.ok) console.error("Supabase delete failed", response.status, await response.text());
}

export type StoredObject = { name: string; created_at: string };

/** Files in one folder ("urun" or "orijinal"), oldest first, for the daily clean-up. */
export async function listImages(folder: string) {
  const { url, key } = required();
  const all: StoredObject[] = [];
  for (let offset = 0; ; offset += 1000) {
    const response = await fetch(`${url}/storage/v1/object/list/${BUCKET}`, {
      method: "POST",
      headers: headers(key, { "Content-Type": "application/json" }),
      body: JSON.stringify({ prefix: folder, limit: 1000, offset, sortBy: { column: "created_at", order: "asc" } }),
    });
    if (!response.ok) {
      if (/bucket not found/i.test(await response.text())) return all;
      throw new Error(`Supabase list ${response.status}`);
    }
    const page = (await response.json()) as (StoredObject & { id: string | null })[];
    // Folders come back with id null.
    all.push(...page.filter((o) => o.id).map((o) => ({ name: `${folder}/${o.name}`, created_at: o.created_at })));
    if (page.length < 1000) return all;
  }
}
