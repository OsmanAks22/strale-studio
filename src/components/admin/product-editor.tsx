"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { categories, discountPercent, formatPrice, LOW_STOCK, type Product } from "@/components/sites/strale/catalog";
import { checkProduct, normalizeProduct, slugify, uniqueHandle } from "@/components/sites/strale/product-rules";
import { AdminImage, photosOf, useAdmin, type Photo } from "./admin-state";
import { DropZone, filesToQueue, PhotoQueueGrid, type QueuedPhoto } from "./photo-queue";

const SIZE_PRESETS = [
  { label: "S–XL", sizes: ["S", "M", "L", "XL"] },
  { label: "XS–XXL", sizes: ["XS", "S", "M", "L", "XL", "XXL"] },
  { label: "30–36", sizes: ["30", "32", "34", "36"] },
  { label: "Tek ebat", sizes: ["STD"] },
];

const inputClass = "h-10 w-full border border-sand bg-white px-2.5 outline-none focus:border-ink";

export function emptyProduct(handle: string): Product {
  return { handle, name: "", color: "", category: "tisort", price: 0, stock: 1, sizes: ["S", "M", "L", "XL"], condition: "kusursuz", draft: true };
}

function Field({ label, hint, error, children }: { label: string; hint?: React.ReactNode; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="st-micro text-[10px] text-graphite">{label}</span>
      <span className="mt-1 block">{children}</span>
      {error ? <span className="mt-1 block text-[12px] text-rust">{error}</span> : null}
      {hint && !error ? <span className="mt-1 block text-[11px] text-graphite">{hint}</span> : null}
    </label>
  );
}

export function Stepper({ value, onChange, min = 0 }: { value: number; onChange: (value: number) => void; min?: number }) {
  return (
    <span className="inline-flex h-10 items-stretch border border-sand bg-white">
      <button type="button" aria-label="Azalt" onClick={() => onChange(Math.max(min, value - 1))} className="w-9 cursor-pointer hover:bg-stone">
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        value={value}
        onChange={(event) => onChange(Math.max(min, Math.floor(Number(event.target.value) || 0)))}
        className="w-12 border-x border-sand text-center outline-none [appearance:textfield]"
      />
      <button type="button" aria-label="Arttır" onClick={() => onChange(value + 1)} className="w-9 cursor-pointer hover:bg-stone">
        +
      </button>
    </span>
  );
}

/** Edits a copy; nothing reaches the list until “Uygula”. */
export function ProductEditor({ product, onClose }: { product: Product; onClose: () => void }) {
  const { products, setProducts, uploadPhotos, isNew, keepOriginals, setKeepOriginals } = useAdmin();
  const [draft, setDraft] = useState<Product>(product);
  const [queue, setQueue] = useState<QueuedPhoto[]>([]);
  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [sizeInput, setSizeInput] = useState("");
  const fresh = isNew(product.handle);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !document.querySelector('[aria-label="Fotoğrafı kırp"]')) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const set = (patch: Partial<Product>) => setDraft((d) => ({ ...d, ...patch }));
  const others = products.filter((p) => p.handle !== product.handle);
  const preview = normalizeProduct(draft);
  const issues = checkProduct(preview, [...others, preview]);
  const errorFor = (field: string) => issues.find((i) => i.field === field && i.level === "error")?.message;
  const photos = photosOf(draft);
  const discount = discountPercent(preview);

  const setPhotos = (next: Photo[]) => {
    const image = next.some((p) => p.src === draft.image) ? draft.image : next[0]?.src;
    set({ gallery: next, image });
  };

  const setSizes = (sizes: string[]) => {
    const unique = [...new Set(sizes.map((s) => s.trim().toLocaleUpperCase("tr-TR")).filter(Boolean))];
    if (draft.sizeStock) {
      const sizeStock = Object.fromEntries(unique.map((s) => [s, draft.sizeStock?.[s] ?? 0]));
      set({ sizes: unique, sizeStock, stock: Object.values(sizeStock).reduce((a, b) => a + b, 0) });
    } else set({ sizes: unique });
  };

  const apply = () => {
    let next = normalizeProduct(draft);
    // New products get their address from name + colour (it never changes after the first save).
    if (fresh && next.name) {
      next = { ...next, handle: uniqueHandle(slugify(`${next.name} ${next.color}`), others.map((p) => p.handle)) };
    }
    setProducts((list) => list.map((p) => (p.handle === product.handle ? next : p)));
    onClose();
  };

  const addQueued = async () => {
    setUploadError(null);
    setUploading({ done: 0, total: queue.length });
    try {
      const added = await uploadPhotos(draft.handle, queue, (done) => setUploading({ done, total: queue.length }));
      setPhotos([...photos, ...added]);
      setQueue([]);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : String(error));
    } finally {
      setUploading(null);
    }
  };

  const move = (index: number, delta: number) => {
    const next = [...photos];
    const [item] = next.splice(index, 1);
    next.splice(Math.max(0, Math.min(next.length, index + delta)), 0, item);
    setPhotos(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/40" role="dialog" aria-modal="true" aria-label="Ürünü düzenle">
      <button type="button" aria-label="Kapat" tabIndex={-1} className="hidden flex-1 cursor-default tab:block" onClick={onClose} />
      <div className="flex h-full w-full flex-col bg-bone tab:max-w-[760px]">
        <header className="flex items-center gap-3 border-b border-sand px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="st-micro text-[10px] text-graphite">{fresh ? "Yeni ürün" : "Ürünü düzenle"}</p>
            <h2 className="truncate font-medium">{draft.name || "İsimsiz ürün"}{draft.color ? ` — ${draft.color}` : ""}</h2>
          </div>
          {!fresh ? (
            <a href={`/urun/${product.handle}`} target="_blank" rel="noreferrer" className="st-underline hidden text-graphite tab:inline">
              Sitede gör
            </a>
          ) : null}
          <button type="button" onClick={onClose} className="st-label cursor-pointer border border-sand px-3 py-2 hover:border-ink">
            Vazgeç
          </button>
          <button
            type="button"
            onClick={apply}
            disabled={Boolean(uploading)}
            className="st-label cursor-pointer bg-ink px-4 py-2 text-bone hover:bg-smoke disabled:opacity-50"
          >
            Uygula
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <section className="grid gap-4 tab:grid-cols-2">
            <Field label="Ürün adı (markasız)" error={errorFor("name")}>
              <input className={inputClass} value={draft.name} onChange={(e) => set({ name: e.target.value })} placeholder="Yün Polar Ceket" />
            </Field>
            <Field label="Renk">
              <input className={inputClass} value={draft.color} onChange={(e) => set({ color: e.target.value })} placeholder="Kahve" />
            </Field>
            <Field label="Kategori" error={errorFor("category")}>
              <select className={inputClass} value={draft.category} onChange={(e) => set({ category: e.target.value as Product["category"] })}>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Stok kodu (isteğe bağlı, sitede görünmez)">
              <input className={inputClass} value={draft.sku ?? ""} onChange={(e) => set({ sku: e.target.value })} placeholder="RAF-A3-012" />
            </Field>
            <Field label="Satış fiyatı (₺)" error={errorFor("price")}>
              <input
                className={inputClass}
                type="number"
                inputMode="decimal"
                min={0}
                value={draft.price || ""}
                onChange={(e) => set({ price: Number(e.target.value) || 0 })}
              />
            </Field>
            <Field
              label="Önceki fiyat (₺) — son 30 günün en düşüğü"
              hint={
                discount
                  ? `Sitede %${discount} indirim rozeti çıkar.`
                  : "Yönetmelik: indirimden önceki 30 günde bu mağazadaki en düşük fiyat. Bilmiyorsanız boş bırakın."
              }
              error={issues.find((i) => i.field === "listPrice")?.message}
            >
              <input
                className={inputClass}
                type="number"
                inputMode="decimal"
                min={0}
                value={draft.listPrice ?? ""}
                onChange={(e) => set({ listPrice: e.target.value === "" ? undefined : Number(e.target.value) })}
              />
            </Field>
          </section>

          <section className="mt-6 border-t border-sand pt-5">
            <h3 className="st-label">Beden ve stok</h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {draft.sizes.map((size) => (
                <span key={size} className="inline-flex h-9 items-center gap-1.5 border border-ink bg-white pl-3">
                  {size}
                  <button
                    type="button"
                    aria-label={`${size} bedenini kaldır`}
                    onClick={() => setSizes(draft.sizes.filter((s) => s !== size))}
                    className="h-full cursor-pointer px-2 text-graphite hover:text-rust"
                  >
                    ×
                  </button>
                </span>
              ))}
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  setSizes([...draft.sizes, ...sizeInput.split(/[\s|,/]+/)]);
                  setSizeInput("");
                }}
                className="inline-flex"
              >
                <input
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value)}
                  placeholder="Beden ekle"
                  className="h-9 w-28 border border-sand bg-white px-2 outline-none focus:border-ink"
                />
                <button type="submit" className="h-9 cursor-pointer border border-l-0 border-sand px-3 hover:border-ink">
                  Ekle
                </button>
              </form>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5 text-[12px]">
              <span className="text-graphite">Hazır:</span>
              {SIZE_PRESETS.map((preset) => (
                <button key={preset.label} type="button" onClick={() => setSizes(preset.sizes)} className="st-underline cursor-pointer">
                  {preset.label}
                </button>
              ))}
            </div>
            {errorFor("sizes") ? <p className="mt-1 text-[12px] text-rust">{errorFor("sizes")}</p> : null}

            <label className="mt-4 flex items-center gap-2">
              <input
                type="checkbox"
                checked={Boolean(draft.sizeStock)}
                onChange={(e) => {
                  if (e.target.checked) {
                    // Spread the current total over the sizes as a starting point.
                    const each = Math.floor(draft.stock / Math.max(1, draft.sizes.length));
                    const sizeStock = Object.fromEntries(draft.sizes.map((s, i) => [s, each + (i < draft.stock % Math.max(1, draft.sizes.length) ? 1 : 0)]));
                    set({ sizeStock });
                  } else set({ sizeStock: undefined });
                }}
                className="size-4 accent-ink"
              />
              Her bedenin stoğunu ayrı tut (tükenen beden sitede seçilemez)
            </label>

            {draft.sizeStock ? (
              <div className="mt-3 grid grid-cols-2 gap-3 tab:grid-cols-4">
                {draft.sizes.map((size) => (
                  <label key={size} className="flex items-center justify-between gap-2 bg-white px-3 py-2">
                    <span className="font-medium">{size}</span>
                    <Stepper
                      value={draft.sizeStock?.[size] ?? 0}
                      onChange={(n) => {
                        const sizeStock = { ...draft.sizeStock, [size]: n };
                        set({ sizeStock, stock: Object.values(sizeStock).reduce((a, b) => a + b, 0) });
                      }}
                    />
                  </label>
                ))}
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-3">
                <span className="text-graphite">Toplam stok</span>
                <Stepper value={draft.stock} onChange={(stock) => set({ stock })} />
              </div>
            )}
            <p className="mt-2 text-[12px] text-graphite">
              Toplam {preview.stock} adet ·{" "}
              {preview.stock === 0 ? "sitede “Tükendi”, listelerde görünmez" : preview.stock <= LOW_STOCK ? `sitede “Son ${preview.stock} adet” yazar` : "stokta"}
              {preview.price ? ` · stok değeri ${formatPrice(preview.price * preview.stock)}` : ""}
            </p>
          </section>

          <section className="mt-6 grid gap-4 border-t border-sand pt-5 tab:grid-cols-2">
            <Field label="Durum">
              <select className={inputClass} value={draft.condition} onChange={(e) => set({ condition: e.target.value as Product["condition"] })}>
                <option value="kusursuz">Kusursuz</option>
                <option value="hafif-kusurlu">Hafif kusurlu</option>
              </select>
            </Field>
            <Field label="Kumaş">
              <input className={inputClass} value={draft.fabric ?? ""} onChange={(e) => set({ fabric: e.target.value })} placeholder="%100 pamuk" />
            </Field>
            <Field label="Kaynak / üretim">
              <input className={inputClass} value={draft.origin ?? ""} onChange={(e) => set({ origin: e.target.value })} placeholder="Türkiye - AB siparişi fazlası" />
            </Field>
            <Field label="Not / kusur açıklaması" error={issues.find((i) => i.field === "note")?.message}>
              <input className={inputClass} value={draft.note ?? ""} onChange={(e) => set({ note: e.target.value })} placeholder="Sol kol manşetinde hafif renk farkı" />
            </Field>
            <label className="flex items-center gap-2 tab:col-span-2">
              <input type="checkbox" checked={Boolean(draft.draft)} onChange={(e) => set({ draft: e.target.checked })} className="size-4 accent-ink" />
              Taslak — sitede gizle (fotoğraflar ve bilgiler hazır olunca kaldırın)
            </label>
          </section>

          <section className="mt-6 border-t border-sand pt-5">
            <h3 className="st-label">Fotoğraflar</h3>
            <p className="mt-1 text-[12px] text-graphite">
              Sıra = ürün sayfasındaki sıra. ★ ile seçilen kartlarda (ana sayfa, listeler) görünür. Yapay zekâ görsellerini “AI” ile
              işaretleyin; sitede “Yapay zekâ ile mankene giydirilmiştir” notu çıkar.
            </p>
            {photos.length ? (
              <ul className="mt-3 grid grid-cols-3 gap-2 tab:grid-cols-5">
                {photos.map((photo, index) => {
                  const cover = (draft.image ?? photos[0]?.src) === photo.src;
                  return (
                    <li key={photo.src} className={cn("bg-white p-1.5", cover && "outline-2 outline-ink")}>
                      <AdminImage path={photo.src} className="block aspect-[4/5] w-full" />
                      <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[12px]">
                        <button
                          type="button"
                          title="Kart görseli yap"
                          onClick={() => set({ image: photo.src, gallery: photos })}
                          className={cn("cursor-pointer px-1", cover ? "text-ink" : "text-ash hover:text-ink")}
                        >
                          ★
                        </button>
                        <button type="button" title="Sola al" disabled={index === 0} onClick={() => move(index, -1)} className="cursor-pointer px-1 disabled:opacity-30">
                          ←
                        </button>
                        <button
                          type="button"
                          title="Sağa al"
                          disabled={index === photos.length - 1}
                          onClick={() => move(index, 1)}
                          className="cursor-pointer px-1 disabled:opacity-30"
                        >
                          →
                        </button>
                        <button
                          type="button"
                          title="Yapay zekâ görseli mi?"
                          onClick={() => setPhotos(photos.map((p) => (p.src === photo.src ? { ...p, ai: !p.ai || undefined } : p)))}
                          className={cn("cursor-pointer border px-1 text-[10px]", photo.ai ? "border-ink bg-ink text-bone" : "border-sand text-graphite")}
                        >
                          AI
                        </button>
                        <button
                          type="button"
                          title="Fotoğrafı kaldır"
                          onClick={() => setPhotos(photos.filter((p) => p.src !== photo.src))}
                          className="ml-auto cursor-pointer px-1 text-graphite hover:text-rust"
                        >
                          Sil
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : null}

            <div className="mt-4">
              {queue.length ? (
                <div className="flex flex-col gap-3">
                  <PhotoQueueGrid photos={queue} onChange={setQueue} />
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      disabled={Boolean(uploading)}
                      onClick={addQueued}
                      className="st-label cursor-pointer bg-ink px-4 py-2.5 text-bone hover:bg-smoke disabled:opacity-50"
                    >
                      {uploading ? `Yükleniyor ${uploading.done}/${uploading.total}…` : `${queue.length} fotoğrafı ekle`}
                    </button>
                    <button type="button" onClick={() => setQueue([])} className="st-underline cursor-pointer text-graphite">
                      Vazgeç
                    </button>
                  </div>
                </div>
              ) : (
                <DropZone
                  compact
                  onFiles={async (files) => {
                    const { queued, failed } = await filesToQueue(files, () => draft.handle);
                    setQueue((q) => [...q, ...queued]);
                    setUploadError(failed.length ? `Açılamayan dosyalar: ${failed.join(", ")} (iPhone HEIC ise JPEG olarak gönderin)` : null);
                  }}
                />
              )}
              <label className="mt-3 flex items-center gap-2 text-[12px] text-graphite">
                <input type="checkbox" checked={keepOriginals} onChange={(e) => setKeepOriginals(e.target.checked)} className="size-4 accent-ink" />
                Kırpılmamış orijinali de sakla (yapay zekâ ile packshot / manken görseli üretmek için)
              </label>
              {uploadError ? <p className="mt-2 text-[12px] text-rust">{uploadError}</p> : null}
            </div>
          </section>

          {issues.length ? (
            <section className="mt-6 border-t border-sand pt-5">
              <h3 className="st-label">Kontrol</h3>
              <ul className="mt-2 flex flex-col gap-1">
                {issues.map((issue) => (
                  <li key={issue.field + issue.message} className={issue.level === "error" ? "text-rust" : "text-graphite"}>
                    {issue.level === "error" ? "✕" : "!"} {issue.message}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          <p className="mt-6 text-[11px] text-graphite">Adres: /urun/{fresh ? (draft.name ? uniqueHandle(slugify(`${draft.name} ${draft.color}`), others.map((p) => p.handle)) : "(addan oluşturulur)") : product.handle}</p>
        </div>
      </div>
    </div>
  );
}
