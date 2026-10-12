"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { categories, categoryLabel, formatPrice, type Product } from "@/components/sites/strale/catalog";
import { checkProduct, stockState, uniqueHandle, type StockState } from "@/components/sites/strale/product-rules";
import { AdminImage, useAdmin } from "./admin-state";

type Filter = "all" | StockState | "issues" | "changed";

const STATE_LABEL: Record<StockState, { text: string; className: string }> = {
  ok: { text: "Stokta", className: "bg-stone text-ink" },
  low: { text: "Az kaldı", className: "bg-[#f3dccf] text-rust" },
  soldout: { text: "Tükendi", className: "bg-sand text-graphite" },
  draft: { text: "Taslak", className: "border border-dashed border-graphite text-graphite" },
};

export function ProductTable({ onEdit }: { onEdit: (handle: string) => void }) {
  const { products, saved, setProducts, updateProduct } = useAdmin();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [percent, setPercent] = useState("");

  const savedByHandle = useMemo(() => new Map(saved.map((p) => [p.handle, JSON.stringify(p)])), [saved]);
  const issueCount = useMemo(
    () => new Map(products.map((p) => [p.handle, checkProduct(p, products).length])),
    [products],
  );

  const visible = products.filter((p) => {
    const haystack = `${p.name} ${p.color} ${p.sku ?? ""} ${p.handle} ${categoryLabel(p.category)}`.toLocaleLowerCase("tr-TR");
    if (query && !query.toLocaleLowerCase("tr-TR").split(/\s+/).every((t) => haystack.includes(t))) return false;
    if (category && p.category !== category) return false;
    if (filter === "issues") return (issueCount.get(p.handle) ?? 0) > 0;
    if (filter === "changed") return savedByHandle.get(p.handle) !== JSON.stringify(p);
    if (filter !== "all") return stockState(p) === filter;
    return true;
  });

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: products.length, ok: 0, low: 0, soldout: 0, draft: 0, issues: 0, changed: 0 };
    for (const p of products) {
      c[stockState(p)]++;
      if ((issueCount.get(p.handle) ?? 0) > 0) c.issues++;
      if (savedByHandle.get(p.handle) !== JSON.stringify(p)) c.changed++;
    }
    return c;
  }, [products, issueCount, savedByHandle]);

  const move = (handle: string, to: "up" | "down" | "top") =>
    setProducts((list) => {
      const index = list.findIndex((p) => p.handle === handle);
      const next = [...list];
      const [item] = next.splice(index, 1);
      const target = to === "top" ? 0 : to === "up" ? Math.max(0, index - 1) : Math.min(next.length, index + 1);
      next.splice(target, 0, item);
      return next;
    });

  const duplicate = (product: Product) => {
    const handle = uniqueHandle(`${product.handle}-kopya`, products.map((p) => p.handle));
    const copy: Product = { ...product, handle, color: "", draft: true, image: undefined, gallery: undefined, sku: undefined };
    setProducts((list) => {
      const next = [...list];
      next.splice(list.findIndex((p) => p.handle === product.handle) + 1, 0, copy);
      return next;
    });
    onEdit(handle);
  };

  const sellOne = (product: Product) => updateProduct(product.handle, { stock: Math.max(0, product.stock - 1) });

  const selectedProducts = products.filter((p) => selected.has(p.handle));
  const bulk = (update: (p: Product) => Product | null) => {
    setProducts((list) =>
      list.flatMap((p) => {
        if (!selected.has(p.handle)) return [p];
        const next = update(p);
        return next ? [next] : [];
      }),
    );
  };

  const allVisibleSelected = visible.length > 0 && visible.every((p) => selected.has(p.handle));

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ara: ad, renk, stok kodu…"
          className="h-10 min-w-0 flex-1 basis-56 border border-sand bg-white px-3 outline-none focus:border-ink"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 border border-sand bg-white px-2">
          <option value="">Tüm kategoriler</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {(
          [
            ["all", "Tümü"],
            ["ok", "Stokta"],
            ["low", "Az kaldı"],
            ["soldout", "Tükendi"],
            ["draft", "Taslak"],
            ["issues", "Eksikli"],
            ["changed", "Kaydedilmemiş"],
          ] as [Filter, string][]
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={cn(
              "cursor-pointer border px-3 py-1.5 text-[12px]",
              filter === value ? "border-ink bg-ink text-bone" : "border-sand bg-white hover:border-ink",
            )}
          >
            {label} <span className="opacity-60">{counts[value]}</span>
          </button>
        ))}
      </div>

      {selected.size ? (
        <div className="sticky top-[57px] z-10 mt-3 flex flex-wrap items-center gap-2 bg-ink px-3 py-2 text-bone">
          <span>{selected.size} ürün seçili</span>
          <button type="button" className="cursor-pointer underline" onClick={() => bulk((p) => ({ ...p, draft: undefined }))}>
            Yayınla
          </button>
          <button type="button" className="cursor-pointer underline" onClick={() => bulk((p) => ({ ...p, draft: true }))}>
            Taslağa al
          </button>
          <span className="flex items-center gap-1">
            <input
              value={percent}
              onChange={(e) => setPercent(e.target.value)}
              placeholder="-10"
              inputMode="numeric"
              className="h-8 w-14 bg-bone px-1.5 text-ink"
            />
            <button
              type="button"
              className="cursor-pointer underline"
              onClick={() => {
                const change = Number(percent.replace(",", "."));
                if (!change) return;
                // Round to the nearest 10 TL, like the rest of the price list.
                bulk((p) => ({ ...p, price: Math.max(10, Math.round((p.price * (1 + change / 100)) / 10) * 10) }));
                setPercent("");
              }}
            >
              % fiyat değiştir
            </button>
          </span>
          <button
            type="button"
            className="cursor-pointer underline"
            onClick={() => {
              if (window.confirm(`${selected.size} ürün silinsin mi? Kaydedene kadar geri alabilirsiniz (“Değişiklikleri at”).`)) {
                bulk(() => null);
                setSelected(new Set());
              }
            }}
          >
            Sil
          </button>
          <button type="button" className="ml-auto cursor-pointer opacity-70 hover:opacity-100" onClick={() => setSelected(new Set())}>
            Seçimi kaldır
          </button>
        </div>
      ) : null}

      <div className="mt-3 hidden grid-cols-[28px_56px_minmax(0,1fr)_110px_150px_150px_96px] items-center gap-3 border-b border-sand px-2 pb-2 text-[11px] text-graphite desk:grid">
        <input
          type="checkbox"
          aria-label="Görünenlerin hepsini seç"
          checked={allVisibleSelected}
          onChange={() =>
            setSelected((s) => {
              const next = new Set(s);
              visible.forEach((p) => (allVisibleSelected ? next.delete(p.handle) : next.add(p.handle)));
              return next;
            })
          }
          className="size-4 accent-ink"
        />
        <span />
        <span>Ürün</span>
        <span>Fiyat ₺</span>
        <span>Stok</span>
        <span>Durum</span>
        <span className="text-right">Sıra</span>
      </div>

      <ul className="flex flex-col">
        {visible.map((product) => {
          const state = STATE_LABEL[stockState(product)];
          const issues = issueCount.get(product.handle) ?? 0;
          const changed = savedByHandle.get(product.handle) !== JSON.stringify(product);
          const index = products.indexOf(product);
          return (
            <li
              key={product.handle}
              className={cn(
                "grid grid-cols-[28px_56px_minmax(0,1fr)] items-center gap-x-3 gap-y-2 border-b border-sand px-2 py-2.5 desk:grid-cols-[28px_56px_minmax(0,1fr)_110px_150px_150px_96px]",
                changed && "bg-[#fbf6e9]",
              )}
            >
              <input
                type="checkbox"
                aria-label={`${product.name} seç`}
                checked={selected.has(product.handle)}
                onChange={() =>
                  setSelected((s) => {
                    const next = new Set(s);
                    if (next.has(product.handle)) next.delete(product.handle);
                    else next.add(product.handle);
                    return next;
                  })
                }
                className="size-4 accent-ink"
              />
              <button type="button" onClick={() => onEdit(product.handle)} className="cursor-pointer">
                <AdminImage path={product.image} alt="" className="block aspect-[4/5] w-14" />
              </button>
              <div className="min-w-0">
                <button type="button" onClick={() => onEdit(product.handle)} className="block max-w-full cursor-pointer truncate text-left font-medium hover:underline">
                  {product.name || "İsimsiz ürün"}
                  {product.color ? <span className="font-normal text-graphite"> — {product.color}</span> : null}
                </button>
                <p className="truncate text-[11px] text-graphite">
                  {categoryLabel(product.category)} · {product.sizes.join(" ")}
                  {product.sku ? ` · ${product.sku}` : ""}
                  {changed ? " · kaydedilmedi" : ""}
                </p>
              </div>

              <div className="col-span-3 flex flex-wrap items-center gap-x-4 gap-y-2 pl-[40px] desk:contents">
                <label className="flex items-center gap-1.5 desk:block">
                  <span className="text-[11px] text-graphite desk:hidden">₺</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    aria-label="Satış fiyatı"
                    value={product.price || ""}
                    onChange={(e) => updateProduct(product.handle, { price: Number(e.target.value) || 0 })}
                    className="h-9 w-24 border border-sand bg-white px-2 outline-none focus:border-ink"
                  />
                  {product.listPrice ? (
                    <span className="ml-1 text-[11px] text-graphite line-through desk:ml-0 desk:block">{formatPrice(product.listPrice)}</span>
                  ) : null}
                </label>

                <div className="flex items-center gap-1.5">
                  {product.sizeStock ? (
                    <button
                      type="button"
                      onClick={() => onEdit(product.handle)}
                      title={Object.entries(product.sizeStock).map(([s, n]) => `${s}: ${n}`).join("  ")}
                      className="h-9 cursor-pointer border border-sand bg-white px-2 text-left text-[12px] hover:border-ink"
                    >
                      {product.stock} adet
                      <span className="block text-[10px] leading-3 text-graphite">beden bazlı</span>
                    </button>
                  ) : (
                    <>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        aria-label="Stok"
                        value={product.stock}
                        onChange={(e) => updateProduct(product.handle, { stock: Math.max(0, Math.floor(Number(e.target.value) || 0)) })}
                        className="h-9 w-14 border border-sand bg-white px-2 outline-none focus:border-ink"
                      />
                      <button
                        type="button"
                        title="1 adet satıldı"
                        disabled={product.stock <= 0}
                        onClick={() => sellOne(product)}
                        className="h-9 cursor-pointer border border-sand bg-white px-2 text-[12px] whitespace-nowrap hover:border-ink disabled:opacity-40"
                      >
                        Satıldı −1
                      </button>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={cn("px-2 py-0.5 text-[11px]", state.className)}>{state.text}</span>
                  {issues ? (
                    <button type="button" onClick={() => onEdit(product.handle)} className="cursor-pointer px-1 text-[11px] text-rust underline">
                      {issues} eksik
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => updateProduct(product.handle, { draft: product.draft ? undefined : true })}
                    className="cursor-pointer text-[11px] text-graphite underline"
                  >
                    {product.draft ? "Yayınla" : "Gizle"}
                  </button>
                </div>

                <div className="ml-auto flex items-center gap-0.5 text-[13px] desk:justify-end">
                  <button type="button" title="En üste (ana sayfada ilk görünenler)" onClick={() => move(product.handle, "top")} disabled={index === 0} className="cursor-pointer px-1.5 py-1 hover:bg-stone disabled:opacity-30">
                    ⤒
                  </button>
                  <button type="button" title="Yukarı" onClick={() => move(product.handle, "up")} disabled={index === 0} className="cursor-pointer px-1.5 py-1 hover:bg-stone disabled:opacity-30">
                    ↑
                  </button>
                  <button
                    type="button"
                    title="Aşağı"
                    onClick={() => move(product.handle, "down")}
                    disabled={index === products.length - 1}
                    className="cursor-pointer px-1.5 py-1 hover:bg-stone disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button type="button" title="Kopyala (başka renk için)" onClick={() => duplicate(product)} className="cursor-pointer px-1.5 py-1 hover:bg-stone">
                    ⧉
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {visible.length === 0 ? <p className="py-10 text-center text-graphite">Bu filtreye uyan ürün yok.</p> : null}
      {selectedProducts.length === 0 && products.length > 12 ? (
        <p className="mt-3 text-[11px] text-graphite">Ana sayfadaki “Bu Hafta Gelen Stoklar” listedeki ilk 12 stoktaki ürünü gösterir; sırayı ⤒ ↑ ↓ ile değiştirin.</p>
      ) : null}
    </div>
  );
}
