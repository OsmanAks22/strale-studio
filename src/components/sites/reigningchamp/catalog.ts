import fs from "node:fs";
import path from "node:path";

/**
 * Server-side access to the reigningchamp.com snapshot written by
 * scripts/reigningchamp/build_catalog.py. The JSON is read from disk (not imported)
 * so TypeScript does not have to infer types for several megabytes of data.
 */

export type ProductImage = { src: string; width: number; height: number; alt: string };

export type ProductVariant = {
  id: number;
  title: string;
  options: string[];
  price: number;
  compareAtPrice: number | null;
  available: boolean;
  image: string | null;
};

export type Product = {
  handle: string;
  title: string;
  productType: string;
  createdAt: string;
  publishedAt: string;
  subType: string | null;
  type: string | null;
  colour: string | null;
  colourHex: string | null;
  colourFilter: string | null;
  fit: string | null;
  neckline: string | null;
  sleeve: string | null;
  inseam: string | null;
  fastener: string | null;
  department: string | null;
  fabricGroup: string | null;
  fabric: string | null;
  isNew: boolean;
  price: number;
  compareAtPrice: number | null;
  available: boolean;
  options: { name: string; values: string[] }[];
  variants: ProductVariant[];
  images: ProductImage[];
};

export type Link = { label: string; href: string };

export type ProductDetails = {
  description: string;
  breadcrumbs: Link[];
  modelInfo: string;
  details: string;
  fit: string;
  fabricCare: string;
  shippingReturns: string;
  bodyMeasurements: { label: string; values: Record<string, string[]> }[];
  itemMeasurements: { keys: string[]; rows: string[][] } | null;
  related: { title: string; href: string | null; handles: string[] } | null;
};

export type Collection = {
  handle: string;
  title: string;
  heading: string;
  description: string;
  tabs: Link[];
  facets: string[];
  products: string[];
};

export type PageSection =
  | { type: "banner"; image: string | null; mobileImage: string | null; heading: string; html: string; links: Link[] }
  | { type: "richText"; heading: string; html: string; links: Link[]; form: boolean }
  | { type: "tabs"; links: (Link & { active: boolean })[] }
  | {
      type: "cards";
      heading: string;
      items: { image: string | null; href: string | null; title: string; html: string; button: string }[];
    }
  | { type: "accordion"; heading: string; items: { title: string; html: string }[] }
  | { type: "products"; heading: string; handles: string[] }
  | { type: "html"; source: string; html: string; form: boolean };

export type Page = { path: string; title: string; image: string | null; sections: PageSection[] };

export type BlogPost = Page & { handle: string };

export type Blog = {
  title: string;
  articles: { handle: string; title: string; image: string | null }[];
  posts: Record<string, BlogPost>;
};

const DIR = path.join(process.cwd(), "src/components/sites/reigningchamp/catalog");
const cache = new Map<string, unknown>();

function read<T>(file: string): T {
  if (!cache.has(file)) {
    cache.set(file, JSON.parse(fs.readFileSync(path.join(DIR, file), "utf8")));
  }
  return cache.get(file) as T;
}

export const getProducts = () => read<Record<string, Product>>("products.json");
export const getProductDetails = () => read<Record<string, ProductDetails>>("product-details.json");
export const getCollections = () => read<Record<string, Collection>>("collections.json");
export const getPages = () => read<Record<string, Page>>("pages.json");
export const getBlog = () => read<Blog>("blog.json");
export const getAliases = () =>
  read<{ collections: Record<string, string>; pages: Record<string, string> }>("aliases.json");

export function getProduct(handle: string): Product | undefined {
  return getProducts()[handle];
}

export function getCollection(handle: string): Collection | undefined {
  const collections = getCollections();
  return collections[handle] ?? collections[getAliases().collections[handle] ?? ""];
}

/** Same-title products are the colourways the source shows as swatches. */
export function getColourways(product: Product): Product[] {
  const all = getProducts();
  const group = colourGroups().get(product.title) ?? [product.handle];
  return group.map((h) => all[h]).filter(Boolean);
}

let groups: Map<string, string[]> | undefined;
function colourGroups() {
  if (!groups) {
    groups = new Map();
    for (const p of Object.values(getProducts())) {
      const list = groups.get(p.title) ?? [];
      list.push(p.handle);
      groups.set(p.title, list);
    }
  }
  return groups;
}

/** Light shape sent to client components (cards, grids, search). */
export type ProductSummary = {
  handle: string;
  title: string;
  price: number;
  compareAtPrice: number | null;
  image: ProductImage | null;
  hoverImage: ProductImage | null;
  isNew: boolean;
  available: boolean;
  colour: string | null;
  colourHex: string | null;
  swatches: { handle: string; colour: string | null; colourHex: string | null }[];
};

export function toSummary(product: Product): ProductSummary {
  return {
    handle: product.handle,
    title: product.title,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    image: cardImage(product),
    hoverImage: product.images[1] ?? null,
    isNew: product.isNew,
    available: product.available,
    colour: product.colour,
    colourHex: product.colourHex,
    swatches: getColourways(product).map((p) => ({ handle: p.handle, colour: p.colour, colourHex: p.colourHex })),
  };
}

/** Shopify lists the on-model shot first for some products; cards use the flat "_off_1" shot when present. */
function cardImage(product: Product): ProductImage | null {
  return product.images.find((i) => /_off_1[._]/i.test(i.src)) ?? product.images[0] ?? null;
}
