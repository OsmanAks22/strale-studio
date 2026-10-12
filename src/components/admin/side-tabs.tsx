"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { type Product } from "@/components/sites/strale/catalog";
import { checkProduct, csvToProducts, productsToCsv, type CsvRow } from "@/components/sites/strale/product-rules";
import { api } from "./api";
import { useAdmin } from "./admin-state";

/* ---------------------------------------------------------- Kontrol listesi */

export function Checklist({ onEdit }: { onEdit: (handle: string) => void }) {
  const { products } = useAdmin();
  const rows = useMemo(
    () =>
      products
        .map((product) => ({ product, issues: checkProduct(product, products) }))
        .filter((row) => row.issues.length)
        .sort((a, b) => Number(b.issues.some((i) => i.level === "error")) - Number(a.issues.some((i) => i.level === "error"))),
    [products],
  );
  const homepage = products.filter((p) => !p.draft && p.stock > 0).slice(0, 12);
  const homepageMissing = homepage.filter((p) => !p.image);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-graphite">
        <span className="text-rust">✕ Hata</span> olan ürünler kaydedilemez. <span>! Uyarılar</span> kaydı engellemez ama sitede eksik görünür.
      </p>
      {homepageMissing.length ? (
        <p className="bg-[#f3dccf] px-3 py-2 text-rust">
          Ana sayfadaki ilk 12 üründen {homepageMissing.length} tanesinin fotoğrafı yok: {homepageMissing.map((p) => p.name).join(", ")}.
        </p>
      ) : null}
      {rows.length === 0 ? <p className="bg-stone px-3 py-6 text-center">Her şey tamam — eksik bilgi yok. ✓</p> : null}
      <ul className="flex flex-col gap-2">
        {rows.map(({ product, issues }) => (
          <li key={product.handle} className="bg-white p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium">
                {product.name || "İsimsiz ürün"}
                {product.color ? ` — ${product.color}` : ""}
                {product.draft ? <span className="ml-2 text-[11px] text-graphite">(taslak)</span> : null}
              </p>
              <button type="button" onClick={() => onEdit(product.handle)} className="st-label cursor-pointer border border-sand px-3 py-1.5 hover:border-ink">
                Düzelt
              </button>
            </div>
            <ul className="mt-1.5 flex flex-col gap-0.5 text-[13px]">
              {issues.map((issue) => (
                <li key={issue.field + issue.message} className={issue.level === "error" ? "text-rust" : "text-graphite"}>
                  {issue.level === "error" ? "✕" : "!"} {issue.message}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------------------------------------------------------- CSV */

function download(name: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

type Plan = { rows: CsvRow[]; added: Product[]; updated: Product[]; unchanged: number; removed: Product[] };

/** Fields the sheet owns; photos, AI flags and the address stay as they are in the panel. */
function mergeFromSheet(current: Product, sheet: Product): Product {
  return { ...current, ...sheet, handle: current.handle, image: current.image, gallery: current.gallery };
}

export function CsvTools() {
  const { products, setProducts } = useAdmin();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [missingColumns, setMissingColumns] = useState<string[]>([]);
  const [removeMissing, setRemoveMissing] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  const read = async (file: File) => {
    setDone(null);
    const { rows, missing } = csvToProducts(await file.text());
    setMissingColumns(missing);
    if (missing.length) return setPlan(null);
    const byHandle = new Map(products.map((p) => [p.handle, p]));
    const valid = rows.filter((r) => !r.errors.length).map((r) => r.product);
    const added = valid.filter((p) => !byHandle.has(p.handle));
    const updated = valid.filter((p) => {
      const current = byHandle.get(p.handle);
      return current && JSON.stringify(mergeFromSheet(current, p)) !== JSON.stringify(current);
    });
    const sheetHandles = new Set(valid.map((p) => p.handle));
    setPlan({
      rows,
      added,
      updated,
      unchanged: valid.length - added.length - updated.length,
      removed: products.filter((p) => !sheetHandles.has(p.handle)),
    });
  };

  const apply = () => {
    if (!plan) return;
    const sheet = new Map(plan.rows.filter((r) => !r.errors.length).map((r) => [r.product.handle, r.product]));
    setProducts((list) => {
      const kept = list
        .filter((p) => !removeMissing || sheet.has(p.handle))
        .map((p) => (sheet.has(p.handle) ? mergeFromSheet(p, sheet.get(p.handle)!) : p));
      // New rows go on top (newest first, like the homepage list).
      return [...plan.added, ...kept];
    });
    setDone(
      `${plan.added.length} ürün eklendi, ${plan.updated.length} güncellendi${removeMissing && plan.removed.length ? `, ${plan.removed.length} silindi` : ""}. Kontrol edip “Kaydet ve yayınla”ya basın.`,
    );
    setPlan(null);
  };

  const errors = plan?.rows.filter((r) => r.errors.length) ?? [];

  return (
    <div className="flex flex-col gap-5">
      <section className="bg-white p-4">
        <h3 className="st-label">Excel’e aktar</h3>
        <p className="mt-1 text-graphite">Tüm ürünleri Excel / Google Sheets’te açılan bir tabloya indirir. Stok sayımı veya toplu fiyat düzenlemesi için kullanın.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => download(`strale-urunler-${today}.csv`, productsToCsv(products))}
            className="st-label cursor-pointer bg-ink px-4 py-2.5 text-bone hover:bg-smoke"
          >
            Ürünleri indir (CSV)
          </button>
          <button
            type="button"
            onClick={() => download("strale-urun-sablonu.csv", productsToCsv([]))}
            className="st-label cursor-pointer border border-sand px-4 py-2.5 hover:border-ink"
          >
            Boş şablon
          </button>
        </div>
      </section>

      <section className="bg-white p-4">
        <h3 className="st-label">Excel’den içe aktar</h3>
        <p className="mt-1 text-graphite">
          Düzenlediğiniz tabloyu yükleyin. Ürünler “ad + renk” ile eşleşir; fotoğraflar korunur. Önce bir önizleme görürsünüz, hiçbir şey
          kendiliğinden kaydedilmez. <code>beden_stok</code> sütunu <code>S:2|M:0|L:3</code> biçiminde beden bazlı stok,
          <code> taslak</code> sütunu <code>evet</code> ise ürün gizli kalır.
        </p>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void read(file);
            e.target.value = "";
          }}
          className="mt-3 block text-[13px] file:mr-3 file:cursor-pointer file:border-0 file:bg-ink file:px-4 file:py-2 file:text-bone"
        />
        {missingColumns.length ? <p className="mt-3 text-rust">Eksik sütun: {missingColumns.join(", ")}</p> : null}

        {plan ? (
          <div className="mt-4 border-t border-sand pt-4">
            <ul className="flex flex-col gap-1">
              <li>+ {plan.added.length} yeni ürün {plan.added.length ? <span className="text-graphite">({plan.added.map((p) => p.name).slice(0, 5).join(", ")}{plan.added.length > 5 ? "…" : ""})</span> : null}</li>
              <li>~ {plan.updated.length} güncellenecek {plan.updated.length ? <span className="text-graphite">({plan.updated.map((p) => p.name).slice(0, 5).join(", ")}{plan.updated.length > 5 ? "…" : ""})</span> : null}</li>
              <li>= {plan.unchanged} değişmeyen</li>
              {errors.length ? <li className="text-rust">✕ {errors.length} satır hatalı, atlanacak</li> : null}
            </ul>
            {errors.length ? (
              <ul className="mt-2 text-[12px] text-rust">
                {errors.map((r) => (
                  <li key={r.line}>
                    Satır {r.line}: {r.errors.join(", ")}
                  </li>
                ))}
              </ul>
            ) : null}
            {plan.removed.length ? (
              <label className="mt-3 flex items-center gap-2">
                <input type="checkbox" checked={removeMissing} onChange={(e) => setRemoveMissing(e.target.checked)} className="size-4 accent-ink" />
                Tabloda olmayan {plan.removed.length} ürünü sil
              </label>
            ) : null}
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={apply} className="st-label cursor-pointer bg-ink px-4 py-2.5 text-bone hover:bg-smoke">
                Uygula
              </button>
              <button type="button" onClick={() => setPlan(null)} className="st-label cursor-pointer border border-sand px-4 py-2.5 hover:border-ink">
                Vazgeç
              </button>
            </div>
          </div>
        ) : null}
        {done ? <p className="mt-3 bg-stone px-3 py-2">{done}</p> : null}
      </section>
    </div>
  );
}

/* ------------------------------------------------------------- Geçmiş */

type HistoryEntry = { sha: string; message: string; date: string; url?: string };

export function History() {
  const { mode, label } = useAdmin();
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<{ history: HistoryEntry[] }>("gecmis")
      .then((data) => setEntries(data.history))
      .catch((err: Error) => setError(err.message));
  }, []);

  if (mode === "local") return <p className="text-graphite">Yerel modda geçmiş tutulmaz; değişiklikleri git ile commit edin.</p>;
  if (error) return <p className="text-rust">{error}</p>;
  if (!entries) return <p className="text-graphite">Yükleniyor…</p>;
  return (
    <div>
      <p className="text-graphite">
        Ürün listesindeki son değişiklikler ({label}). Bir değişikliği geri almak için GitHub’daki commit sayfasından “Revert” yapılabilir.
      </p>
      <ul className="mt-3 flex flex-col">
        {entries.map((entry) => (
          <li key={entry.sha} className="flex flex-wrap items-baseline gap-x-3 border-b border-sand py-2">
            <span className="w-36 shrink-0 text-[12px] text-graphite">
              {new Date(entry.date).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" })}
            </span>
            <span className={cn("min-w-0 flex-1", entry.message.startsWith("Panel:") ? "" : "text-graphite")}>{entry.message}</span>
            {entry.url ? (
              <a href={entry.url} target="_blank" rel="noreferrer" className="st-underline text-[12px] text-graphite">
                {entry.sha.slice(0, 7)}
              </a>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
