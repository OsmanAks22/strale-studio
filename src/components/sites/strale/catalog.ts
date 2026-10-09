import products from "./products.json";

/**
 * Product catalogue. `products.json` is generated from the stock spreadsheet by
 * `npm run import-products -- <file.csv>`; edit the spreadsheet, not the JSON.
 */

export const categories = [
  { slug: "tisort", label: "Tişört" },
  { slug: "gomlek", label: "Gömlek" },
  { slug: "triko", label: "Triko" },
  { slug: "sweatshirt", label: "Sweatshirt" },
  { slug: "esofman", label: "Eşofman" },
  { slug: "pantolon", label: "Pantolon" },
  { slug: "dis-giyim", label: "Dış Giyim" },
  { slug: "aksesuar", label: "Aksesuar" },
] as const;

export type CategorySlug = (typeof categories)[number]["slug"];

/**
 * `listPrice` is the struck-through reference price: under Turkish price-labelling rules it must be
 * the lowest price this store charged in the 30 days before the discount. Leave it out when unknown.
 */
export type Product = {
  handle: string;
  name: string;
  color: string;
  category: CategorySlug;
  price: number;
  listPrice?: number;
  stock: number;
  sizes: string[];
  condition: "kusursuz" | "hafif-kusurlu";
  fabric?: string;
  origin?: string;
  /** Path under /public, e.g. "/sites/strale/products/yun-polar-ceket-kahve.jpg". */
  image?: string;
  note?: string;
};

export const allProducts = products as Product[];

/** Show "Son N adet" at or below this many pieces. */
export const LOW_STOCK = 3;

const tryFormat = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

/** 12900 → "₺12.900" */
export function formatPrice(amount: number) {
  return tryFormat.format(amount);
}

export function discountPercent(product: Pick<Product, "price" | "listPrice">) {
  if (!product.listPrice || product.listPrice <= product.price) return 0;
  return Math.round((1 - product.price / product.listPrice) * 100);
}

export function categoryLabel(slug: CategorySlug) {
  return categories.find((c) => c.slug === slug)?.label ?? slug;
}

export function getProduct(handle: string) {
  return allProducts.find((p) => p.handle === handle);
}

export function productTitle(product: Product) {
  return product.color ? `${product.name} — ${product.color}` : product.name;
}

type Collection = { title: string; description: string; filter: (p: Product) => boolean };

const specialCollections: Record<string, Collection> = {
  tumu: { title: "Tüm Ürünler", description: "Stoktaki bütün ihraç fazlası parçalar.", filter: () => true },
  "yeni-gelenler": {
    title: "Yeni Gelenler",
    description: "Bu hafta stoğa giren parçalar. Sınırlı adet, yenisi gelmeyebilir.",
    filter: () => true,
  },
  "son-bedenler": {
    title: "Son Bedenler",
    description: `${LOW_STOCK} adet ve altında kalan parçalar.`,
    filter: (p) => p.stock <= LOW_STOCK,
  },
  "hafif-kusurlu": {
    title: "Hafif Kusurlu",
    description: "Küçük üretim kusuru olan, açıkça etiketlenmiş ve ekstra indirimli parçalar.",
    filter: (p) => p.condition === "hafif-kusurlu",
  },
  "yuzde-50-ustu": {
    title: "%50 ve Üzeri İndirim",
    description: "Önceki fiyatının en az yarısına satılan parçalar.",
    filter: (p) => discountPercent(p) >= 50,
  },
};

export const collectionSlugs = [...Object.keys(specialCollections), ...categories.map((c) => c.slug)];

export function getCollection(slug: string) {
  const special = specialCollections[slug];
  if (special) return { ...special, products: allProducts.filter((p) => p.stock > 0 && special.filter(p)) };
  const category = categories.find((c) => c.slug === slug);
  if (!category) return null;
  return {
    title: category.label,
    description: `İhraç fazlası ${category.label.toLocaleLowerCase("tr-TR")} modelleri.`,
    products: allProducts.filter((p) => p.stock > 0 && p.category === category.slug),
  };
}
