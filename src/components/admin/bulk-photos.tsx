"use client";

import { useState } from "react";
import type { Product } from "@/components/sites/strale/catalog";
import { slugify, uniqueHandle } from "@/components/sites/strale/product-rules";
import { photosOf, useAdmin } from "./admin-state";
import { emptyProduct } from "./product-editor";
import { DropZone, filesToQueue, NEW_PRODUCT, PhotoQueueGrid, type QueuedPhoto } from "./photo-queue";

/**
 * Picks the product a file belongs to from its name: "yun-polar-ceket-kahve-2.jpg" → yun-polar-ceket-kahve.
 * The longest matching handle (or name slug) wins.
 */
function matchProduct(fileName: string, products: Product[]) {
  const slug = slugify(fileName.replace(/\.[a-z0-9]+$/i, ""));
  let best = "";
  let bestLength = 0;
  for (const p of products) {
    for (const key of [p.handle, p.sku ? slugify(p.sku) : "", slugify(p.name)]) {
      if (key && key.length > bestLength && (slug === key || slug.startsWith(`${key}-`) || slug.includes(key))) {
        best = p.handle;
        bestLength = key.length;
      }
    }
  }
  return best;
}

const prettyName = (fileName: string) => {
  const base = fileName.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ").replace(/\b(img|dsc|photo)\s*\d*/gi, "").trim();
  return base ? base.charAt(0).toLocaleUpperCase("tr-TR") + base.slice(1) : "";
};

export function BulkPhotos({ onEdit }: { onEdit: (handle: string) => void }) {
  const { products, setProducts, uploadPhotos, keepOriginals, setKeepOriginals } = useAdmin();
  const [queue, setQueue] = useState<QueuedPhoto[]>([]);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const targets = products.map((p) => ({ value: p.handle, label: `${p.name}${p.color ? ` — ${p.color}` : ""}${photosOf(p).length ? "" : " (fotoğrafsız)"}` }));
  const unassigned = queue.filter((p) => !p.target).length;

  const run = async () => {
    setError(null);
    setMessage(null);
    const total = queue.length;
    setProgress({ done: 0, total });
    let done = 0;
    const handles = new Set(products.map((p) => p.handle));
    const created: Product[] = [];
    const additions = new Map<string, { src: string }[]>();
    try {
      // Group by product so each product's photos keep the dropped order.
      const groups = new Map<string, QueuedPhoto[]>();
      for (const photo of queue) {
        let key = photo.target;
        if (key === NEW_PRODUCT) {
          const product = emptyProduct(uniqueHandle(slugify(prettyName(photo.name)) || "yeni-urun", handles));
          product.name = prettyName(photo.name);
          handles.add(product.handle);
          created.push(product);
          key = product.handle;
        }
        groups.set(key, [...(groups.get(key) ?? []), photo]);
      }
      for (const [handle, photos] of groups) {
        const added = await uploadPhotos(handle, photos, () => setProgress({ done: ++done, total }));
        additions.set(handle, added);
      }
      setProducts((list) =>
        [...created, ...list].map((p) => {
          const added = additions.get(p.handle);
          if (!added) return p;
          const gallery = [...photosOf(p), ...added];
          return { ...p, gallery, image: p.image ?? gallery[0].src };
        }),
      );
      setQueue([]);
      setMessage(
        `${total} fotoğraf ${additions.size} ürüne eklendi${created.length ? `, ${created.length} yeni taslak ürün oluşturuldu (bilgilerini doldurun)` : ""}. Yayına almak için üstten “Kaydet ve yayınla”ya basın.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setProgress(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white p-4 text-[13px] leading-5">
        <p className="font-medium">Toplu fotoğraf yükleme</p>
        <ol className="mt-1 list-decimal pl-5 text-graphite">
          <li>Fotoğrafları sürükleyin. Dosya adı ürün adresini içeriyorsa (ör. <code>yun-polar-ceket-kahve-2.jpg</code>) ürün kendiliğinden seçilir.</li>
          <li>Eşleşmeyenler için listeden ürün seçin ya da “Yeni taslak ürün” deyin.</li>
          <li>Gerekirse “Kırp” ile ürünü çerçeveye ortalayın, sonra “Yükle”ye basın.</li>
        </ol>
      </div>

      <DropZone
        onFiles={async (files) => {
          const { queued, failed } = await filesToQueue(files, (name) => matchProduct(name, products));
          setQueue((q) => [...q, ...queued]);
          setError(failed.length ? `Açılamayan dosyalar: ${failed.join(", ")} (iPhone HEIC ise JPEG olarak gönderin)` : null);
          setMessage(null);
        }}
      />

      {queue.length ? (
        <>
          <PhotoQueueGrid photos={queue} onChange={setQueue} targets={targets} />
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={run}
              disabled={Boolean(progress) || unassigned > 0}
              className="st-label cursor-pointer bg-ink px-5 py-3 text-bone hover:bg-smoke disabled:opacity-40"
            >
              {progress ? `Yükleniyor ${progress.done}/${progress.total}…` : `${queue.length} fotoğrafı yükle`}
            </button>
            {unassigned ? <span className="text-rust">{unassigned} fotoğrafa ürün seçin</span> : null}
            <button type="button" onClick={() => setQueue([])} className="st-underline cursor-pointer text-graphite">
              Listeyi temizle
            </button>
          </div>
        </>
      ) : null}

      <label className="flex items-center gap-2 text-[12px] text-graphite">
        <input type="checkbox" checked={keepOriginals} onChange={(e) => setKeepOriginals(e.target.checked)} className="size-4 accent-ink" />
        Kırpılmamış orijinali de sakla (yapay zekâ ile packshot / manken görseli üretmek için)
      </label>
      {message ? <p className="bg-stone px-3 py-2">{message}</p> : null}
      {error ? <p className="text-rust">{error}</p> : null}

      <MissingPhotos onEdit={onEdit} />
    </div>
  );
}

function MissingPhotos({ onEdit }: { onEdit: (handle: string) => void }) {
  const { products } = useAdmin();
  const missing = products.filter((p) => !p.image);
  if (!missing.length) return null;
  return (
    <section className="mt-2">
      <h3 className="st-label">Fotoğrafı olmayan ürünler ({missing.length})</h3>
      <ul className="mt-2 flex flex-wrap gap-2">
        {missing.map((p) => (
          <li key={p.handle}>
            <button type="button" onClick={() => onEdit(p.handle)} className="cursor-pointer border border-sand bg-white px-3 py-1.5 text-[12px] hover:border-ink">
              {p.name || "İsimsiz"}
              {p.color ? ` — ${p.color}` : ""}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
