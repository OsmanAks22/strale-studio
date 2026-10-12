import type { Product } from "@/components/sites/strale/catalog";
import type { StoreSettings } from "@/components/sites/strale/site-config";
import { dbHistory, dbReadCatalog, dbReadSettings, dbWriteCatalog, dbWriteSettings } from "@/lib/catalog-db";
import { dbConfigured } from "@/lib/db";
import { deleteImages, storageConfigured, storagePathOf } from "@/lib/storage";
import {
  getRepo,
  PRODUCTS_PATH,
  readProducts,
  readSettings,
  serializeJson,
  SETTINGS_PATH,
  tryGetRepo,
  type HistoryEntry,
  type Upload,
} from "./repo";

/**
 * Where the admin panel keeps the catalogue and settings:
 * - db: Postgres (Supabase…). Saves are live at once (pages refresh on the next visit).
 * - github / local: products.json + store-settings.json in the repo; each save is a commit and a rebuild.
 */

export type CatalogMode = "db" | "github" | "local";

export function catalogInfo(): { mode: CatalogMode; label: string; rawBase: string | null; photos: "storage" | "repo" | "none" } {
  const repo = tryGetRepo();
  const photos = storageConfigured() ? "storage" : repo ? "repo" : "none";
  if (dbConfigured()) {
    return { mode: "db", label: storageConfigured() ? "Supabase · anında yayın" : "Veritabanı · anında yayın", rawBase: repo?.rawBase ?? null, photos };
  }
  const github = getRepo();
  return { mode: github.mode, label: github.label, rawBase: github.rawBase, photos };
}

export async function readCatalog() {
  if (dbConfigured()) return dbReadCatalog();
  return readProducts(getRepo());
}

type SaveInput = {
  products: Product[];
  before: Product[];
  baseVersion: string;
  force?: boolean;
  /** Photos staged in the repo (only when photos are not in Supabase Storage). */
  uploads: Upload[];
  /** Image src values (repo paths or Storage URLs) no product uses any more. */
  removed: string[];
  message: string;
};

export async function saveCatalog(input: SaveInput): Promise<{ version: string; commit?: string; url?: string }> {
  const storagePaths = input.removed.flatMap((src) => {
    const path = storagePathOf(src);
    // A product photo and its uncropped original share the file name.
    return path ? [path, path.replace(/^urun\//, "orijinal/")] : [];
  });
  const repoDeletes = input.removed.filter((src) => src.startsWith("/sites/strale/products/")).map((src) => `public${src}`);

  let result: { version: string; commit?: string; url?: string };
  if (dbConfigured()) {
    const version = await dbWriteCatalog(input.products, input.baseVersion, Boolean(input.force), input.message);
    result = { version };
    // Photos that went into the repo (no Storage) still need a commit; old repo photos are left in place.
    if (input.uploads.length) {
      const commit = await getRepo().commit({ files: [], uploads: input.uploads, message: "Panel: yeni ürün fotoğrafları" });
      result = { ...result, commit: commit.commit, url: commit.url };
    }
  } else {
    const repo = getRepo();
    const commit = await repo.commit({
      files: [{ path: PRODUCTS_PATH, content: serializeJson(input.products), baseVersion: input.baseVersion }],
      force: input.force,
      uploads: input.uploads,
      deletes: repoDeletes,
      message: input.message,
    });
    result = { version: commit.versions[PRODUCTS_PATH], commit: commit.commit, url: commit.url };
  }
  // Only after the catalogue no longer points at them.
  await deleteImages(storagePaths).catch((error) => console.error(error));
  return result;
}

export async function readStoreSettings() {
  if (dbConfigured()) return dbReadSettings();
  return readSettings(getRepo());
}

export async function saveStoreSettings(settings: StoreSettings, baseVersion: string, force?: boolean) {
  if (dbConfigured()) return { version: await dbWriteSettings(settings, baseVersion, Boolean(force)) };
  const commit = await getRepo().commit({
    files: [{ path: SETTINGS_PATH, content: serializeJson(settings), baseVersion }],
    force,
    message: "Panel: mağaza ayarları güncellendi",
  });
  return { version: commit.versions[SETTINGS_PATH], commit: commit.commit, url: commit.url };
}

export async function catalogHistory(): Promise<HistoryEntry[]> {
  if (dbConfigured()) {
    return (await dbHistory()).map((row) => ({ sha: String(row.id), message: row.message, date: new Date(row.at).toISOString() }));
  }
  return getRepo().history();
}
