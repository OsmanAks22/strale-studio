#!/usr/bin/env node
/**
 * Converts the stock spreadsheet (CSV, see docs/products/README.md) into
 * src/components/sites/strale/products.json.
 *
 *   npm run import-products -- docs/products/urun-listesi.csv
 *
 * Product photos go in public/sites/strale/products/; the `foto_dosyasi` column names the file.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const input = process.argv[2];
if (!input) {
  console.error("Kullanım: npm run import-products -- <dosya.csv>");
  process.exit(1);
}

const CATEGORIES = {
  tişört: "tisort",
  gömlek: "gomlek",
  triko: "triko",
  sweatshirt: "sweatshirt",
  eşofman: "esofman",
  pantolon: "pantolon",
  "dış giyim": "dis-giyim",
  aksesuar: "aksesuar",
};

/** RFC 4180-ish parser: quoted fields, escaped quotes, comma or semicolon (Excel TR) separators. */
function parseCsv(text) {
  const clean = text.replace(/^﻿/, "");
  const firstLine = clean.slice(0, clean.indexOf("\n"));
  const sep = firstLine.split(";").length > firstLine.split(",").length ? ";" : ",";
  const rows = [];
  let row = [];
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

function slugify(value) {
  const map = { ç: "c", ğ: "g", ı: "i", i̇: "i", ö: "o", ş: "s", ü: "u" };
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/[çğıöşü]|i̇/g, (c) => map[c])
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function toNumber(value) {
  const cleaned = String(value).replace(/[₺\s]|TL/gi, "").replace(/\.(?=\d{3}\b)/g, "").replace(",", ".");
  return cleaned === "" ? undefined : Number(cleaned);
}

const [header, ...rows] = parseCsv(readFileSync(resolve(input), "utf8"));
const col = Object.fromEntries(header.map((name, index) => [name.trim().toLocaleLowerCase("tr-TR"), index]));
for (const required of ["ad", "kategori", "indirimli_fiyat", "stok", "bedenler"]) {
  if (!(required in col)) {
    console.error(`Eksik sütun: ${required}`);
    process.exit(1);
  }
}

const errors = [];
const warnings = [];
const seen = new Set();
const products = rows.map((cells, index) => {
  const line = index + 2;
  const get = (name) => (col[name] === undefined ? "" : (cells[col[name]] ?? "").trim());
  const name = get("ad");
  const color = get("renk");
  const categoryKey = get("kategori").toLocaleLowerCase("tr-TR");
  const category = CATEGORIES[categoryKey];
  const price = toNumber(get("indirimli_fiyat"));
  const listPrice = toNumber(get("onceki_fiyat_son30gun_en_dusuk"));
  const stock = toNumber(get("stok"));
  const condition = get("durum").toLocaleLowerCase("tr-TR") === "hafif-kusurlu" ? "hafif-kusurlu" : "kusursuz";
  let handle = slugify(`${name} ${color}`);
  while (seen.has(handle)) handle += "-2";
  seen.add(handle);

  if (!name) errors.push(`Satır ${line}: ad boş`);
  if (!category) errors.push(`Satır ${line}: bilinmeyen kategori "${get("kategori")}" (${Object.keys(CATEGORIES).join(", ")})`);
  if (!Number.isFinite(price)) errors.push(`Satır ${line}: indirimli_fiyat sayı değil`);
  if (!Number.isFinite(stock)) errors.push(`Satır ${line}: stok sayı değil`);
  if (listPrice !== undefined && !(listPrice > price)) warnings.push(`Satır ${line}: önceki fiyat indirimli fiyattan büyük değil, rozet gösterilmeyecek`);
  if (condition === "hafif-kusurlu" && !get("not")) warnings.push(`Satır ${line}: hafif kusurlu ama kusur açıklaması (not) boş`);

  const photo = get("foto_dosyasi");
  let image;
  if (photo) {
    image = `/sites/strale/products/${photo}`;
    if (!existsSync(resolve(root, "public", image.slice(1)))) warnings.push(`Satır ${line}: fotoğraf bulunamadı: public${image}`);
  }

  return Object.fromEntries(
    Object.entries({
      handle,
      name,
      color,
      category,
      price,
      listPrice: listPrice > price ? listPrice : undefined,
      stock,
      sizes: get("bedenler").split(/[|/,]/).map((s) => s.trim().toLocaleUpperCase("tr-TR")).filter(Boolean),
      condition,
      fabric: get("kumas") || undefined,
      origin: get("mensei_uretim") || undefined,
      image,
      note: get("not") || undefined,
    }).filter(([, value]) => value !== undefined && value !== ""),
  );
});

warnings.forEach((w) => console.warn(`⚠️  ${w}`));
if (errors.length) {
  errors.forEach((e) => console.error(`❌ ${e}`));
  process.exit(1);
}
const out = resolve(root, "src/components/sites/strale/products.json");
writeFileSync(out, `${JSON.stringify(products, null, 2)}\n`);
console.log(`✅ ${products.length} ürün → ${out}`);
