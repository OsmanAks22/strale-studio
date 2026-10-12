"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/components/sites/strale/catalog";
import { IMAGE_DIR } from "@/components/sites/strale/product-rules";
import { api, ApiError } from "./api";
import { blobToBase64, renderCrop, renderOriginal, type Crop } from "./image-tools";

type Upload = { ref: string };
type Deploy = { commit: string; url?: string; state: "pending" | "success" | "failure" | "unknown"; startedAt: number };

export type Photo = { src: string; ai?: boolean };

type State = {
  loading: boolean;
  loadError: string | null;
  products: Product[];
  saved: Product[];
  version: string;
  mode: "github" | "local";
  label: string;
  rawBase: string | null;
  dirty: boolean;
  saving: boolean;
  saveError: { message: string; errors?: string[]; conflict?: boolean } | null;
  deploy: Deploy | null;
  keepOriginals: boolean;
  setKeepOriginals: (value: boolean) => void;
  setProducts: (update: (products: Product[]) => Product[]) => void;
  updateProduct: (handle: string, patch: Partial<Product>) => void;
  replaceProduct: (handle: string, product: Product) => void;
  save: (force?: boolean) => Promise<void>;
  discard: () => void;
  reload: () => Promise<void>;
  uploadPhotos: (handle: string, photos: { image: HTMLImageElement; crop: Crop }[], onProgress?: (done: number) => void) => Promise<Photo[]>;
  imageSrc: (path: string) => string;
  rawSrc: (path: string) => string | null;
  isNew: (handle: string) => boolean;
};

const AdminContext = createContext<State | null>(null);

export function useAdmin() {
  const value = useContext(AdminContext);
  if (!value) throw new Error("useAdmin outside AdminProvider");
  return value;
}

/** Card image + gallery as one ordered list (what the product page shows). */
export function photosOf(product: Product): Photo[] {
  if (product.gallery?.length) return product.gallery;
  return product.image ? [{ src: product.image }] : [];
}

/**
 * Three-way merge of the panel's edits (`mine`, made on top of `base`) onto the latest saved list (`theirs`).
 * Stock changes are applied as differences so pieces sold meanwhile are not lost; other edited fields win.
 */
export function rebase(mine: Product[], base: Product[], theirs: Product[]): Product[] {
  const baseBy = new Map(base.map((p) => [p.handle, p]));
  const theirsBy = new Map(theirs.map((p) => [p.handle, p]));
  const mineHandles = new Set(mine.map((p) => p.handle));
  const result: Product[] = [];
  // Products created elsewhere since we loaded go first (newest on top).
  for (const p of theirs) if (!baseBy.has(p.handle) && !mineHandles.has(p.handle)) result.push(p);
  for (const p of mine) {
    const before = baseBy.get(p.handle);
    const latest = theirsBy.get(p.handle);
    if (!before) {
      result.push(p);
      continue;
    }
    if (!latest) continue; // deleted elsewhere
    if (JSON.stringify(p) === JSON.stringify(before)) {
      result.push(latest);
      continue;
    }
    const merged: Product = { ...p };
    if (p.sizeStock && before.sizeStock && latest.sizeStock) {
      merged.sizeStock = Object.fromEntries(
        p.sizes.map((size) => [size, Math.max(0, (latest.sizeStock?.[size] ?? 0) + (p.sizeStock![size] ?? 0) - (before.sizeStock?.[size] ?? 0))]),
      );
      merged.stock = Object.values(merged.sizeStock).reduce((a, b) => a + b, 0);
    } else if (!p.sizeStock && !latest.sizeStock) {
      merged.stock = Math.max(0, latest.stock + p.stock - before.stock);
    }
    result.push(merged);
  }
  return result;
}

const randomId = () => Math.random().toString(36).slice(2, 8);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [products, setProductsState] = useState<Product[]>([]);
  const [saved, setSaved] = useState<Product[]>([]);
  const [version, setVersion] = useState("");
  const [meta, setMeta] = useState<{ mode: "github" | "local"; label: string; rawBase: string | null }>({
    mode: "local",
    label: "",
    rawBase: null,
  });
  const [uploads, setUploads] = useState<Record<string, Upload>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<State["saveError"]>(null);
  const [deploy, setDeploy] = useState<Deploy | null>(null);
  const [keepOriginals, setKeepOriginals] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await api<{ products: Product[]; version: string; mode: "github" | "local"; label: string; rawBase: string | null }>(
        "urunler",
      );
      setProductsState(data.products);
      setSaved(data.products);
      setVersion(data.version);
      setMeta({ mode: data.mode, label: data.label, rawBase: data.rawBase });
      setUploads({});
      setSaveError(null);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) window.location.reload();
      setLoadError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch of the catalogue from the repo.
    void reload();
  }, [reload]);

  const dirty = useMemo(() => JSON.stringify(products) !== JSON.stringify(saved), [products, saved]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // Poll Vercel's deploy status for the last save until it finishes (max ~10 min).
  const deployCommit = deploy?.state === "pending" ? deploy.commit : null;
  useEffect(() => {
    if (!deployCommit) return;
    let stopped = false;
    const started = Date.now();
    const tick = async () => {
      if (stopped) return;
      try {
        const status = await api<{ state: Deploy["state"]; url?: string }>(`durum?sha=${deployCommit}`);
        if (stopped) return;
        if (status.state !== "pending" || Date.now() - started > 10 * 60 * 1000) {
          setDeploy((d) => (d ? { ...d, state: status.state === "pending" ? "unknown" : status.state, url: status.url ?? d.url } : d));
          return;
        }
        setDeploy((d) => (d ? { ...d, url: status.url ?? d.url } : d));
      } catch {
        // Network hiccup: keep polling.
      }
      timer = window.setTimeout(tick, 8000);
    };
    let timer = window.setTimeout(tick, 5000);
    return () => {
      stopped = true;
      window.clearTimeout(timer);
    };
  }, [deployCommit]);

  const setProducts = useCallback((update: (products: Product[]) => Product[]) => setProductsState(update), []);
  const updateProduct = useCallback(
    (handle: string, patch: Partial<Product>) =>
      setProductsState((list) => list.map((p) => (p.handle === handle ? { ...p, ...patch } : p))),
    [],
  );
  const replaceProduct = useCallback(
    (handle: string, product: Product) => setProductsState((list) => list.map((p) => (p.handle === handle ? product : p))),
    [],
  );

  const save = useCallback(
    async (force = false) => {
      setSaving(true);
      setSaveError(null);
      const send = (list: Product[], baseVersion: string) =>
        api<{ version: string; commit?: string; url?: string; products: Product[] }>("urunler", {
          body: {
            products: list,
            baseVersion,
            force,
            uploads: Object.entries(uploads).map(([path, upload]) => ({ path, ref: upload.ref })),
          },
        });
      try {
        let result;
        try {
          result = await send(products, version);
        } catch (error) {
          if (!(error instanceof ApiError && error.details.conflict)) throw error;
          // Usually an order took stock while the panel was open: replay our edits on the latest list and retry once.
          const latest = await api<{ products: Product[]; version: string }>("urunler");
          const merged = rebase(products, saved, latest.products);
          result = await send(merged, latest.version);
        }
        setProductsState(result.products);
        setSaved(result.products);
        setVersion(result.version);
        setUploads({});
        setDeploy(result.commit ? { commit: result.commit, url: result.url, state: "pending", startedAt: Date.now() } : null);
      } catch (error) {
        if (error instanceof ApiError) {
          setSaveError({ message: error.message, errors: error.details.errors, conflict: error.details.conflict });
        } else setSaveError({ message: error instanceof Error ? error.message : String(error) });
      } finally {
        setSaving(false);
      }
    },
    [products, saved, version, uploads],
  );

  const discard = useCallback(() => {
    setProductsState(saved);
    setUploads({});
    setSaveError(null);
  }, [saved]);

  const uploadPhotos = useCallback<State["uploadPhotos"]>(
    async (handle, photos, onProgress) => {
      const added: Photo[] = [];
      for (const [index, photo] of photos.entries()) {
        const name = `${handle}-${randomId()}`;
        const cropped = await renderCrop(photo.image, photo.crop);
        const { ref } = await api<{ ref: string }>("yukle", { body: { data: await blobToBase64(cropped) } });
        const src = `${IMAGE_DIR}/${name}.jpg`;
        const entries: Record<string, Upload> = { [`public${src}`]: { ref } };
        if (keepOriginals) {
          const original = await renderOriginal(photo.image, photo.crop.rotate);
          const res = await api<{ ref: string }>("yukle", { body: { data: await blobToBase64(original) } });
          entries[`docs/products/fotograflar/${name}.jpg`] = { ref: res.ref };
        }
        setUploads((current) => ({ ...current, ...entries }));
        setPreviews((current) => ({ ...current, [src]: URL.createObjectURL(cropped) }));
        added.push({ src });
        onProgress?.(index + 1);
      }
      return added;
    },
    [keepOriginals],
  );

  const imageSrc = useCallback((path: string) => previews[path] ?? path, [previews]);
  const rawSrc = useCallback((path: string) => (meta.rawBase ? `${meta.rawBase}${path}` : null), [meta.rawBase]);
  const savedHandles = useMemo(() => new Set(saved.map((p) => p.handle)), [saved]);
  const isNew = useCallback((handle: string) => !savedHandles.has(handle), [savedHandles]);

  const value: State = {
    loading,
    loadError,
    products,
    saved,
    version,
    ...meta,
    dirty,
    saving,
    saveError,
    deploy,
    keepOriginals,
    setKeepOriginals,
    setProducts,
    updateProduct,
    replaceProduct,
    save,
    discard,
    reload,
    uploadPhotos,
    imageSrc,
    rawSrc,
    isNew,
  };
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

/** Product photo for the panel: local preview → deployed file → raw GitHub copy (saved, not deployed yet). */
export function AdminImage({ path, alt = "", className }: { path?: string; alt?: string; className?: string }) {
  const { imageSrc, rawSrc } = useAdmin();
  const [fallback, setFallback] = useState<string | null>(null);
  if (!path) {
    return <span className={`${className ?? ""} flex items-center justify-center bg-stone text-[10px] text-graphite`}>Foto yok</span>;
  }
  const src = fallback ?? imageSrc(path);
  return (
    // eslint-disable-next-line @next/next/no-img-element -- previews are blob: URLs and not-yet-deployed files
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={`${className ?? ""} bg-stone object-cover`}
      onError={() => {
        const raw = rawSrc(path);
        if (raw && fallback !== raw) setFallback(raw);
      }}
    />
  );
}
