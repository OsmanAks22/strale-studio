#!/usr/bin/env node
/**
 * Converts the stock spreadsheet (CSV, see docs/products/README.md) into
 * src/components/sites/strale/products.json.
 *
 *   npm run import-products -- docs/products/urun-listesi.csv
 *
 * Raw product photos go in docs/products/fotograflar/ (`foto_dosyasi` names the file); model photos for
 * on-model shots in docs/products/mankenler/. The `gorsel` column picks what the site shows:
 *   orijinal (default) your photo cropped to 4:5 · urun AI studio packshot · manken AI on-model + your photo
 *   · ikisi AI packshot on the card + AI on-model shot on the product page
 *
 *   npm run import-products -- docs/products/urun-listesi.csv --gorsel            # also produce the images
 *   npm run import-products -- docs/products/urun-listesi.csv --gorsel --dry-run  # show plan + AI cost only
 * Extra flags after --gorsel (--budget 3, --force, --quality low) go to scripts/urun_gorselleri.py.
 *
 * The admin panel (/yonetim) edits products.json directly, so this script merges instead of overwriting:
 * rows update the product with the same address (ad + renk), photos/draft/stock code set in the panel are kept,
 * and products that are only in products.json stay (pass --replace to drop them).
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const [input, ...flags] = process.argv.slice(2);
const generateImages = flags.includes("--gorsel");
const replace = flags.includes("--replace");
const imagerFlags = flags.filter((flag) => flag !== "--gorsel" && flag !== "--replace");
const PHOTOS = resolve(root, "docs/products/fotograflar");
const MODELS = resolve(root, "docs/products/mankenler");
const LOOKS = ["orijinal", "urun", "manken", "ikisi"];
const PUBLIC_PRODUCTS = "/sites/strale/products";
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
const jobs = [];
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
  if (!Number.isFinite(stock) && !get("beden_stok")) errors.push(`Satır ${line}: stok sayı değil`);
  if (listPrice !== undefined && !(listPrice > price)) warnings.push(`Satır ${line}: önceki fiyat indirimli fiyattan büyük değil, rozet gösterilmeyecek`);
  if (condition === "hafif-kusurlu" && !get("not")) warnings.push(`Satır ${line}: hafif kusurlu ama kusur açıklaması (not) boş`);

  const photo = get("foto_dosyasi");
  const look = get("gorsel").toLocaleLowerCase("tr-TR") || "orijinal";
  if (!LOOKS.includes(look)) errors.push(`Satır ${line}: gorsel "${look}" olamaz (${LOOKS.join(", ")})`);
  if (photo) {
    const photoPath = resolve(PHOTOS, photo);
    if (!existsSync(photoPath)) warnings.push(`Satır ${line}: fotoğraf bulunamadı: docs/products/fotograflar/${photo}`);
    else {
      const job = { handle, look, photo: photoPath };
      if (look === "manken" || look === "ikisi") {
        const modelName = get("manken") || "manken-1";
        const modelPath = [".jpg", ".jpeg", ".png", ".webp"].map((ext) => resolve(MODELS, modelName + ext)).find(existsSync);
        if (modelPath) job.model = modelPath;
        else errors.push(`Satır ${line}: manken fotoğrafı yok: docs/products/mankenler/${modelName}.jpg`);
      }
      jobs.push(job);
    }
  }

  const sizeStock = get("beden_stok")
    ? Object.fromEntries(
        get("beden_stok")
          .split("|")
          .map((part) => part.split(":").map((x) => x.trim()))
          .filter(([size]) => size)
          .map(([size, count]) => [size.toLocaleUpperCase("tr-TR"), Number(count) || 0]),
      )
    : undefined;
  const draftCell = get("taslak").toLocaleLowerCase("tr-TR");

  return Object.fromEntries(
    Object.entries({
      handle,
      name,
      color,
      category,
      price,
      listPrice: listPrice > price ? listPrice : undefined,
      stock: sizeStock ? Object.values(sizeStock).reduce((a, b) => a + b, 0) : stock,
      sizes: get("bedenler").split(/[|/,]/).map((s) => s.trim().toLocaleUpperCase("tr-TR")).filter(Boolean),
      sizeStock,
      sku: "stok_kodu" in col ? get("stok_kodu") || undefined : undefined,
      draft: "taslak" in col ? ["evet", "e", "1", "x", "true"].includes(draftCell) || undefined : undefined,
      condition,
      fabric: get("kumas") || undefined,
      origin: get("mensei_uretim") || undefined,
      look,
      note: get("not") || undefined,
    }).filter(([, value]) => value !== undefined && value !== ""),
  );
});

warnings.forEach((w) => console.warn(`⚠️  ${w}`));
if (errors.length) {
  errors.forEach((e) => console.error(`❌ ${e}`));
  process.exit(1);
}

if (generateImages && jobs.length) {
  const jobFile = resolve(root, "temp/urun-gorselleri/jobs.json");
  mkdirSync(dirname(jobFile), { recursive: true });
  writeFileSync(jobFile, JSON.stringify(jobs, null, 2));
  const run = spawnSync("python3", [resolve(root, "scripts/urun_gorselleri.py"), jobFile, ...imagerFlags], { stdio: "inherit" });
  if (run.status !== 0) console.warn("⚠️  Bazı görseller üretilemedi; mevcut olanlarla devam ediliyor.");
}

/**
 * Attach whatever images exist for each product. The card shows `image`; the product page opens on gallery[0].
 * manken: on-model shot on both. ikisi: packshot on the card, on-model shot first on the product page.
 */
const out = resolve(root, "src/components/sites/strale/products.json");
const existing = existsSync(out) ? JSON.parse(readFileSync(out, "utf8")) : [];
const previous = new Map(existing.map((product) => [product.handle, product]));

for (const product of products) {
  const before = previous.get(product.handle);
  // Columns missing from the sheet keep the value set in the admin panel.
  for (const [key, column] of [["sku", "stok_kodu"], ["draft", "taslak"], ["sizeStock", "beden_stok"]]) {
    if (!(column in col) && before?.[key] !== undefined) product[key] = before[key];
  }
  if (!("beden_stok" in col) && product.sizeStock) {
    const total = product.sizes.reduce((sum, size) => sum + (product.sizeStock[size] ?? 0), 0);
    if (total !== product.stock) {
      console.warn(`⚠️  ${product.name}: tablodaki stok (${product.stock}) beden stoklarından farklı; beden bazlı stok kaldırıldı.`);
      delete product.sizeStock;
    }
  }
  if (product.sizeStock) {
    product.sizeStock = Object.fromEntries(product.sizes.map((size) => [size, product.sizeStock[size] ?? 0]));
    product.stock = Object.values(product.sizeStock).reduce((a, b) => a + b, 0);
  }

  const files = { main: `${PUBLIC_PRODUCTS}/${product.handle}.jpg`, model: `${PUBLIC_PRODUCTS}/${product.handle}-manken.jpg` };
  const has = (path) => existsSync(resolve(root, "public", path.slice(1)));
  const gallery = [];
  if (has(files.main)) gallery.push({ src: files.main });
  if (has(files.model)) gallery[["manken", "ikisi"].includes(product.look) ? "unshift" : "push"]({ src: files.model, ai: true });
  // Photos added in the panel stay after the pipeline's own.
  const panelPhotos = (before?.gallery ?? (before?.image ? [{ src: before.image }] : [])).filter(
    (photo) => !gallery.some((g) => g.src === photo.src) && has(photo.src),
  );
  gallery.push(...panelPhotos);
  if (gallery.length) {
    const pipelineCover = product.look === "ikisi" && has(files.main) ? files.main : undefined;
    const panelCover = before?.image && gallery.some((g) => g.src === before.image) ? before.image : undefined;
    product.image = pipelineCover ?? panelCover ?? gallery[0].src;
    if (gallery.length > 1 || gallery[0].ai) product.gallery = gallery;
  }
  delete product.look;
}

const sheetHandles = new Set(products.map((product) => product.handle));
const onlyInPanel = existing.filter((product) => !sheetHandles.has(product.handle));
if (onlyInPanel.length) {
  console.log(
    replace
      ? `🗑  Tabloda olmayan ${onlyInPanel.length} ürün silindi (--replace).`
      : `ℹ️  Tabloda olmayan ${onlyInPanel.length} ürün korundu (panelden eklenmiş olabilir; silmek için --replace).`,
  );
}
const merged = replace ? products : [...products, ...onlyInPanel];
writeFileSync(out, `${JSON.stringify(merged, null, 2)}\n`);
console.log(`✅ ${merged.length} ürün → ${out}`);
