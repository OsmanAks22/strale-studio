import { categories, LOW_STOCK, type CategorySlug, type Product } from "./catalog";

/**
 * Rules shared by the admin panel (live checks), its save endpoint (hard errors) and CSV import/export.
 * Mirrors scripts/import-products.mjs so the spreadsheet and the panel accept the same data.
 */

export const IMAGE_DIR = "/sites/strale/products";

const TR_MAP: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u" };

export function slugify(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/[çğıöşü]/g, (c) => TR_MAP[c])
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function uniqueHandle(base: string, taken: Iterable<string>) {
  const used = new Set(taken);
  let handle = base || "urun";
  while (used.has(handle)) handle += "-2";
  return handle;
}

/** "3.490", "3490 TL", "₺1.290,50" → number; empty → undefined. */
export function toNumber(value: string | number | undefined) {
  if (value === undefined) return undefined;
  const cleaned = String(value)
    .replace(/[₺\s]|TL/gi, "")
    .replace(/\.(?=\d{3}\b)/g, "")
    .replace(",", ".");
  return cleaned === "" ? undefined : Number(cleaned);
}

export function parseSizes(value: string) {
  return value
    .split(/[|/,]/)
    .map((s) => s.trim().toLocaleUpperCase("tr-TR"))
    .filter(Boolean);
}

export const categoryBySlug = (slug: string) => categories.find((c) => c.slug === slug);

export function categoryFromLabel(label: string): CategorySlug | undefined {
  const key = label.trim().toLocaleLowerCase("tr-TR");
  return categories.find((c) => c.label.toLocaleLowerCase("tr-TR") === key || c.slug === key)?.slug;
}

/** Every image path a product uses (card image + gallery). */
export function productImages(product: Product) {
  const paths = new Set<string>();
  if (product.image) paths.add(product.image);
  product.gallery?.forEach((g) => paths.add(g.src));
  return [...paths];
}

/** Keeps `stock` equal to the per-size total and drops sizes no longer offered. */
export function normalizeProduct(product: Product): Product {
  const next: Product = { ...product, sizes: [...new Set(product.sizes.map((s) => s.trim()).filter(Boolean))] };
  if (next.sizeStock) {
    const sizeStock: Record<string, number> = {};
    for (const size of next.sizes) sizeStock[size] = Math.max(0, Math.floor(next.sizeStock[size] ?? 0));
    next.sizeStock = sizeStock;
    next.stock = Object.values(sizeStock).reduce((sum, n) => sum + n, 0);
  }
  if (next.gallery) {
    // The card image must be one of the gallery photos; a single plain photo needs no gallery.
    if (next.gallery.length === 0) {
      delete next.gallery;
      delete next.image;
    } else {
      if (!next.image || !next.gallery.some((g) => g.src === next.image)) next.image = next.gallery[0].src;
      if (next.gallery.length === 1 && !next.gallery[0].ai) delete next.gallery;
    }
  }
  if (next.listPrice !== undefined && !(next.listPrice > next.price)) delete next.listPrice;
  for (const key of ["fabric", "origin", "note", "sku", "color"] as const) {
    const value = next[key];
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) next[key] = trimmed;
      else if (key === "color") next.color = "";
      else delete next[key];
    }
  }
  if (!next.draft) delete next.draft;
  if (next.sizeStock && Object.keys(next.sizeStock).length === 0) delete next.sizeStock;
  return next;
}

export type Issue = { level: "error" | "warning"; field: string; message: string };

export function checkProduct(product: Product, all: Product[]): Issue[] {
  const issues: Issue[] = [];
  const error = (field: string, message: string) => issues.push({ level: "error", field, message });
  const warn = (field: string, message: string) => issues.push({ level: "warning", field, message });
  // Drafts are hidden from the site, so missing details only block publishing, not saving.
  const required = product.draft ? (field: string, message: string) => warn(field, `${message} (yayınlamadan önce)`) : error;

  if (!product.name?.trim()) required("name", "Ürün adı boş");
  if (!categoryBySlug(product.category)) error("category", "Kategori seçilmemiş");
  if (!(Number.isFinite(product.price) && product.price >= 0)) error("price", "Satış fiyatı geçerli bir sayı olmalı");
  else if (product.price === 0) required("price", "Satış fiyatı 0'dan büyük olmalı");
  if (!(Number.isInteger(product.stock) && product.stock >= 0)) error("stock", "Stok 0 veya pozitif tam sayı olmalı");
  if (product.sizes.length === 0) required("sizes", "En az bir beden girin (tek ebat için STD)");
  if (all.filter((p) => p.handle === product.handle).length > 1) error("handle", "Aynı adres (handle) iki üründe var");
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(product.handle)) error("handle", "Adres sadece küçük harf, rakam ve tire içerebilir");

  if (!product.image) warn("image", "Fotoğraf yok — sitede “Fotoğraf yakında” görünür");
  if (product.listPrice !== undefined && product.listPrice <= product.price)
    warn("listPrice", "Önceki fiyat satış fiyatından büyük değil; indirim rozeti çıkmaz");
  if (product.condition === "hafif-kusurlu" && !product.note?.trim())
    warn("note", "Hafif kusurlu ama kusur açıklaması (not) boş");
  if (!product.fabric?.trim()) warn("fabric", "Kumaş bilgisi boş");
  if (!product.color?.trim()) warn("color", "Renk boş");
  if (product.gallery?.some((g) => g.ai) && product.gallery.every((g) => g.ai))
    warn("gallery", "Sadece yapay zekâ görseli var; ürünün kendi fotoğrafını da ekleyin");
  return issues;
}

export type StockState = "draft" | "soldout" | "low" | "ok";

export function stockState(product: Product): StockState {
  if (product.draft) return "draft";
  if (product.stock <= 0) return "soldout";
  if (product.stock <= LOW_STOCK) return "low";
  return "ok";
}

/* ---------------------------------------------------------------- CSV */

export const CSV_COLUMNS = [
  "ad",
  "renk",
  "kategori",
  "indirimli_fiyat",
  "onceki_fiyat_son30gun_en_dusuk",
  "stok",
  "bedenler",
  "durum",
  "kumas",
  "mensei_uretim",
  "foto_dosyasi",
  "not",
  "gorsel",
  "manken",
  "beden_stok",
  "stok_kodu",
  "taslak",
] as const;

/** RFC 4180-ish parser: quoted fields, escaped quotes, comma or semicolon (Excel TR) separators. */
export function parseCsv(text: string) {
  const clean = text.replace(/^﻿/, "");
  const firstLine = clean.slice(0, clean.indexOf("\n") === -1 ? undefined : clean.indexOf("\n"));
  const sep = firstLine.split(";").length > firstLine.split(",").length ? ";" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (quoted) {
      if (ch === '"' && clean[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === sep) {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && clean[i + 1] === "\n") i++;
      row.push(field);
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  row.push(field);
  if (row.some((cell) => cell.trim())) rows.push(row);
  return rows;
}

/** "S:2|M:0|L:3" ↔ { S: 2, M: 0, L: 3 } */
export function formatSizeStock(sizeStock: Record<string, number>) {
  return Object.entries(sizeStock)
    .map(([size, n]) => `${size}:${n}`)
    .join("|");
}

function parseSizeStock(value: string) {
  if (!value.trim()) return undefined;
  const result: Record<string, number> = {};
  for (const part of value.split("|")) {
    const [size, count] = part.split(":").map((s) => s.trim());
    if (size) result[size.toLocaleUpperCase("tr-TR")] = Number(count) || 0;
  }
  return result;
}

const csvCell = (value: string | number | undefined) => {
  const text = value === undefined ? "" : String(value);
  return /[";\n,]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/** Semicolon-separated with BOM so Excel (Turkish locale) opens it in columns. */
export function productsToCsv(products: Product[]) {
  const label = (slug: string) => categoryBySlug(slug)?.label ?? slug;
  const lines = products.map((p) =>
    [
      p.name,
      p.color,
      label(p.category),
      p.price,
      p.listPrice,
      p.stock,
      p.sizes.join("|"),
      p.condition,
      p.fabric,
      p.origin,
      "",
      p.note,
      "",
      "",
      p.sizeStock ? formatSizeStock(p.sizeStock) : "",
      p.sku,
      p.draft ? "evet" : "",
    ]
      .map(csvCell)
      .join(";"),
  );
  return `﻿${[CSV_COLUMNS.join(";"), ...lines].join("\r\n")}\r\n`;
}

export type CsvRow = { line: number; product: Product; errors: string[] };

/** Rows → products (images are not part of the sheet; the importer keeps existing ones). */
export function csvToProducts(text: string): { rows: CsvRow[]; missing: string[] } {
  const [header = [], ...data] = parseCsv(text);
  const col = Object.fromEntries(header.map((name, index) => [name.trim().toLocaleLowerCase("tr-TR"), index]));
  const missing = ["ad", "kategori", "indirimli_fiyat", "stok", "bedenler"].filter((name) => !(name in col));
  if (missing.length) return { rows: [], missing };

  const seen = new Set<string>();
  const rows = data.map((cells, index) => {
    const get = (name: string) => (col[name] === undefined ? "" : (cells[col[name]] ?? "").trim());
    const errors: string[] = [];
    const name = get("ad");
    const color = get("renk");
    const category = categoryFromLabel(get("kategori"));
    const price = toNumber(get("indirimli_fiyat"));
    const listPrice = toNumber(get("onceki_fiyat_son30gun_en_dusuk"));
    const sizeStock = parseSizeStock(get("beden_stok"));
    const stock = toNumber(get("stok"));
    if (!name) errors.push("ad boş");
    if (!category) errors.push(`bilinmeyen kategori “${get("kategori")}”`);
    if (!Number.isFinite(price)) errors.push("indirimli_fiyat sayı değil");
    if (!sizeStock && !Number.isFinite(stock)) errors.push("stok sayı değil");

    const handle = uniqueHandle(slugify(`${name} ${color}`), seen);
    seen.add(handle);
    const sizes = parseSizes(get("bedenler"));
    const product = normalizeProduct({
      handle,
      name,
      color,
      category: category ?? "tisort",
      price: price ?? 0,
      listPrice,
      stock: stock ?? 0,
      sizes: sizes.length ? sizes : Object.keys(sizeStock ?? {}),
      condition: get("durum").toLocaleLowerCase("tr-TR") === "hafif-kusurlu" ? "hafif-kusurlu" : "kusursuz",
      fabric: get("kumas"),
      origin: get("mensei_uretim"),
      note: get("not"),
      sizeStock,
      sku: get("stok_kodu"),
      draft: ["evet", "e", "1", "x", "true"].includes(get("taslak").toLocaleLowerCase("tr-TR")),
    });
    return { line: index + 2, product, errors };
  });
  return { rows, missing };
}
