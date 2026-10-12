"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/components/sites/strale/catalog";
import { checkProduct, stockState } from "@/components/sites/strale/product-rules";
import { AdminProvider, useAdmin } from "./admin-state";
import { BulkPhotos } from "./bulk-photos";
import { emptyProduct, ProductEditor } from "./product-editor";
import { ProductTable } from "./product-table";
import { Checklist, CsvTools, History } from "./side-tabs";

type Tab = "urunler" | "fotograflar" | "kontrol" | "csv" | "gecmis";

export function AdminApp() {
  return (
    <AdminProvider>
      <Dashboard />
    </AdminProvider>
  );
}

function Dashboard() {
  const admin = useAdmin();
  const { products, loading, loadError, setProducts } = admin;
  const [tab, setTab] = useState<Tab>("urunler");
  const [editing, setEditing] = useState<string | null>(null);
  const editingProduct = products.find((p) => p.handle === editing);

  const stats = useMemo(() => {
    const live = products.filter((p) => !p.draft);
    return {
      products: live.length,
      units: live.reduce((sum, p) => sum + p.stock, 0),
      value: live.reduce((sum, p) => sum + p.stock * p.price, 0),
      soldout: products.filter((p) => stockState(p) === "soldout").length,
      low: products.filter((p) => stockState(p) === "low").length,
      drafts: products.length - live.length,
      issues: products.filter((p) => checkProduct(p, products).length).length,
    };
  }, [products]);

  const addProduct = () => {
    let n = 1;
    while (products.some((p) => p.handle === `yeni-urun-${n}`)) n++;
    const product = emptyProduct(`yeni-urun-${n}`);
    setProducts((list) => [product, ...list]);
    setEditing(product.handle);
  };

  if (loading && !products.length) return <p className="p-8 text-graphite">Ürünler yükleniyor…</p>;
  if (loadError) {
    return (
      <div className="mx-auto max-w-xl p-8">
        <p className="text-rust">Ürünler okunamadı: {loadError}</p>
        <button type="button" onClick={() => void admin.reload()} className="st-label mt-4 cursor-pointer bg-ink px-4 py-2.5 text-bone">
          Tekrar dene
        </button>
      </div>
    );
  }

  const tabs: [Tab, string][] = [
    ["urunler", "Ürünler & Stok"],
    ["fotograflar", "Toplu Fotoğraf"],
    ["kontrol", `Kontrol${stats.issues ? ` (${stats.issues})` : ""}`],
    ["csv", "Excel / CSV"],
    ["gecmis", "Geçmiş"],
  ];

  return (
    <div className="min-h-screen bg-bone pb-24">
      <SaveBar />

      <div className="mx-auto max-w-[1280px] px-3 tab:px-6">
        <dl className="mt-4 grid grid-cols-2 gap-2 tab:grid-cols-4 desk:grid-cols-7">
          {[
            ["Yayındaki ürün", String(stats.products)],
            ["Toplam adet", String(stats.units)],
            ["Stok değeri", formatPrice(stats.value)],
            ["Tükenen", String(stats.soldout)],
            ["Az kalan", String(stats.low)],
            ["Taslak", String(stats.drafts)],
            ["Eksikli", String(stats.issues)],
          ].map(([label, value]) => (
            <div key={label} className="bg-white px-3 py-2.5">
              <dt className="text-[11px] text-graphite">{label}</dt>
              <dd className="text-[18px] font-medium">{value}</dd>
            </div>
          ))}
        </dl>

        <nav className="st-no-scrollbar mt-5 flex gap-1 overflow-x-auto border-b border-sand">
          {tabs.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={cn(
                "shrink-0 cursor-pointer border-b-2 px-3 py-2.5 whitespace-nowrap",
                tab === value ? "border-ink font-medium" : "border-transparent text-graphite hover:text-ink",
              )}
            >
              {label}
            </button>
          ))}
          <button type="button" onClick={addProduct} className="st-label my-1 ml-auto shrink-0 cursor-pointer bg-ink px-4 text-bone hover:bg-smoke">
            + Yeni ürün
          </button>
        </nav>

        <div className="mt-4">
          {tab === "urunler" ? <ProductTable onEdit={setEditing} /> : null}
          {tab === "fotograflar" ? <BulkPhotos onEdit={setEditing} /> : null}
          {tab === "kontrol" ? <Checklist onEdit={setEditing} /> : null}
          {tab === "csv" ? <CsvTools /> : null}
          {tab === "gecmis" ? <History /> : null}
        </div>
      </div>

      {editingProduct ? <ProductEditor key={editingProduct.handle} product={editingProduct} onClose={() => setEditing(null)} /> : null}
    </div>
  );
}

function SaveBar() {
  const { dirty, saving, save, discard, saveError, deploy, mode, label, products, saved, reload } = useAdmin();
  const changed = useMemo(() => {
    const before = new Map(saved.map((p) => [p.handle, JSON.stringify(p)]));
    const added = products.filter((p) => !before.has(p.handle)).length;
    const removed = saved.filter((p) => !products.some((n) => n.handle === p.handle)).length;
    const edited = products.filter((p) => before.has(p.handle) && before.get(p.handle) !== JSON.stringify(p)).length;
    return { added, removed, edited };
  }, [products, saved]);

  return (
    <header className="sticky top-0 z-20 border-b border-sand bg-bone/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-x-4 gap-y-2 px-3 py-2.5 tab:px-6">
        <div className="min-w-0">
          <p className="st-label">STRALE · Yönetim</p>
          <p className="truncate text-[11px] text-graphite">{label}</p>
        </div>
        <a href="/" target="_blank" rel="noreferrer" className="st-underline text-[12px] text-graphite">
          Siteyi aç
        </a>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {dirty ? (
            <span className="text-[12px] text-graphite">
              Kaydedilmemiş: {[changed.added && `${changed.added} yeni`, changed.edited && `${changed.edited} değişiklik`, changed.removed && `${changed.removed} silme`].filter(Boolean).join(", ") || "sıralama"}
            </span>
          ) : (
            <DeployState deploy={deploy} mode={mode} />
          )}
          {dirty ? (
            <button type="button" onClick={discard} disabled={saving} className="cursor-pointer px-2 py-2 text-[12px] text-graphite underline hover:text-ink">
              Değişiklikleri at
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => void save()}
            disabled={!dirty || saving}
            className="st-label cursor-pointer bg-ink px-4 py-2.5 text-bone hover:bg-smoke disabled:cursor-default disabled:bg-sand disabled:text-graphite"
          >
            {saving ? "Kaydediliyor…" : mode === "github" ? "Kaydet ve yayınla" : "Kaydet"}
          </button>
          <form action="/api/yonetim/cikis" method="post" onSubmit={async (event) => {
            event.preventDefault();
            await fetch("/api/yonetim/cikis", { method: "POST" });
            window.location.reload();
          }}>
            <button type="submit" className="cursor-pointer px-2 py-2 text-[12px] text-graphite hover:text-ink">
              Çıkış
            </button>
          </form>
        </div>
      </div>
      {saveError ? (
        <div className="bg-[#f3dccf] px-3 py-2 text-rust tab:px-6">
          <div className="mx-auto max-w-[1280px]">
            <p className="font-medium">{saveError.message}</p>
            {saveError.errors?.length ? (
              <ul className="mt-1 text-[12px]">
                {saveError.errors.slice(0, 8).map((e) => (
                  <li key={e}>✕ {e}</li>
                ))}
              </ul>
            ) : null}
            {saveError.conflict ? (
              <p className="mt-1 flex flex-wrap gap-3 text-[12px]">
                <span>Başka bir sekmede veya cihazda kaydedilmiş olabilir.</span>
                <button type="button" onClick={() => void reload()} className="cursor-pointer underline">
                  Benimkileri at, son hali yükle
                </button>
                <button type="button" onClick={() => void save(true)} className="cursor-pointer underline">
                  Benimkilerle üzerine yaz
                </button>
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}

function DeployState({ deploy, mode }: { deploy: ReturnType<typeof useAdmin>["deploy"]; mode: "github" | "local" }) {
  if (mode === "local") return <span className="text-[12px] text-graphite">Yerel mod · dosyalara yazılır</span>;
  if (!deploy) return <span className="text-[12px] text-graphite">Tüm değişiklikler kaydedildi</span>;
  const text = {
    pending: "Kaydedildi · site güncelleniyor (1–2 dk)…",
    success: "Kaydedildi · sitede yayında ✓",
    failure: "Kaydedildi ama site derlemesi başarısız",
    unknown: "Kaydedildi · yayın durumu bilinmiyor",
  }[deploy.state];
  return (
    <span className={cn("text-[12px]", deploy.state === "failure" ? "text-rust" : "text-graphite")}>
      {text}
      {deploy.url ? (
        <>
          {" "}
          <a href={deploy.url} target="_blank" rel="noreferrer" className="underline">
            ayrıntı
          </a>
        </>
      ) : null}
    </span>
  );
}
