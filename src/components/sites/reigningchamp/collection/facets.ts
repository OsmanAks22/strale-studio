import { toSummary, type Product, type ProductImage } from "../catalog";
import { sizeLabel } from "../format";

/**
 * Collection/search filtering driven by the source site's own query params
 * (`filter.p.m.custom.*`, `filter.v.option.*`, `filter.v.availability`, `sort_by`),
 * so links copied from reigningchamp.com (e.g. the sub-category tabs) keep working.
 * Values repeat within a group (OR) and combine across groups (AND); matching ignores
 * case and punctuation ("Zip-Up" matches "zip up").
 */

export type SearchParamsRecord = Record<string, string | string[] | undefined>;

export const AVAILABILITY_PARAM = "filter.v.availability";
const SIZE_PARAM = "filter.v.option.size";
const FIT_PARAM = "filter.v.option.fit";

type FacetKind = "list" | "colour" | "size";

type FacetDef = {
  name: string;
  param: string;
  kind: FacetKind;
  /** Display values a product contributes to the facet. */
  values: (product: Product) => string[];
  /** Normalised values a product matches (display values plus aliases). */
  matches?: (product: Product) => string[];
};

export const norm = (value: string) => value.toLowerCase().replace(/[^a-z0-9/.]+/g, "");

function titleCase(value: string) {
  return value.replace(/(^|[\s-])([a-z])/g, (_, sep: string, ch: string) => sep + ch.toUpperCase());
}

const DISPLAY_OVERRIDES: Record<string, string> = {
  "zip up": "Zip-Up",
  "button up": "Button-Up",
  polos: "Polo Shirts",
  "t-shirts": "T-Shirts",
};

const label = (value: string | null): string[] =>
  value ? [DISPLAY_OVERRIDES[value] ?? titleCase(value)] : [];

/** Category tab links use umbrella values the product data does not carry directly. */
const CATEGORY_ALIASES: Record<string, string[]> = {
  sweaters: ["Knitwear"],
  cardigans: ["Knitwear"],
  "polo shirts": ["Polos"],
  polos: ["Polo Shirts"],
};

function optionValues(product: Product, name: string) {
  return product.options.find((o) => o.name === name)?.values ?? [];
}

function fitValues(product: Product) {
  const fromOptions = optionValues(product, "Fit");
  return fromOptions.length ? fromOptions : label(product.fit);
}

const FACETS: FacetDef[] = [
  {
    name: "Category",
    param: "filter.p.m.custom.sub_category_filter",
    kind: "list",
    values: (p) => label(p.subType),
    matches: (p) => (p.subType ? [p.subType, ...(CATEGORY_ALIASES[p.subType] ?? [])] : []),
  },
  { name: "Colour", param: "filter.p.m.custom.colour_filter", kind: "colour", values: (p) => label(p.colourFilter) },
  { name: "Size", param: SIZE_PARAM, kind: "size", values: (p) => optionValues(p, "Size") },
  { name: "Fit", param: FIT_PARAM, kind: "list", values: fitValues },
  { name: "Neckline", param: "filter.p.m.custom.neckline_filter", kind: "list", values: (p) => label(p.neckline) },
  { name: "Sleeve Length", param: "filter.p.m.custom.sleeve_length_filter", kind: "list", values: (p) => label(p.sleeve) },
  { name: "Inseam", param: "filter.p.m.custom.inseam_length_filter", kind: "list", values: (p) => label(p.inseam) },
  { name: "Department", param: "filter.p.m.custom.department_filter", kind: "list", values: (p) => label(p.department) },
  { name: "Fabric", param: "filter.p.m.custom.fabric_group", kind: "list", values: (p) => label(p.fabricGroup) },
  { name: "Fastener", param: "filter.p.m.custom.fastener", kind: "list", values: (p) => label(p.fastener) },
];

const ALL_FACET_NAMES = FACETS.map((f) => f.name);

/** Swatch colours used by the source's colour facet. */
const COLOUR_SWATCHES: Record<string, string> = {
  black: "#1e1e1e",
  blue: "#24639d",
  brown: "#6d4831",
  green: "#1d5d43",
  grey: "#9c9c9c",
  natural: "#dbcab6",
  red: "#a73e50",
  white: "#ffffff",
  purple: "#5c4a7d",
};

type Selection = Map<string, Set<string>>;

export function readSelection(searchParams: SearchParamsRecord): Selection {
  const selection: Selection = new Map();
  for (const facet of FACETS) {
    const raw = searchParams[facet.param];
    const list = (Array.isArray(raw) ? raw : raw ? [raw] : []).filter(Boolean);
    if (list.length) selection.set(facet.param, new Set(list.map(norm)));
  }
  return selection;
}

const inStockOnly = (searchParams: SearchParamsRecord) => {
  const raw = searchParams[AVAILABILITY_PARAM];
  return (Array.isArray(raw) ? raw : [raw]).includes("1");
};

function matchesFacet(product: Product, facet: FacetDef, wanted: Set<string>) {
  const values = (facet.matches ?? facet.values)(product);
  return values.some((v) => wanted.has(norm(v)));
}

/** Size, Fit and availability are variant-level: one variant must satisfy all three. */
function matchesVariants(product: Product, selection: Selection, inStock: boolean, skip?: string) {
  const sizes = skip === SIZE_PARAM ? undefined : selection.get(SIZE_PARAM);
  const fits = skip === FIT_PARAM ? undefined : selection.get(FIT_PARAM);
  if (!sizes && !fits && !inStock) return true;
  const sizeIndex = product.options.findIndex((o) => o.name === "Size");
  const fitIndex = product.options.findIndex((o) => o.name === "Fit");
  const productFit = product.fit ? norm(product.fit) : null;
  return product.variants.some((variant) => {
    if (inStock && !variant.available) return false;
    if (sizes && (sizeIndex < 0 || !sizes.has(norm(variant.options[sizeIndex] ?? "")))) return false;
    if (fits) {
      const fit = fitIndex >= 0 ? norm(variant.options[fitIndex] ?? "") : productFit;
      if (!fit || !fits.has(fit)) return false;
    }
    return true;
  });
}

function matches(product: Product, selection: Selection, inStock: boolean, skip?: string) {
  for (const facet of FACETS) {
    if (facet.param === skip || facet.param === SIZE_PARAM || facet.param === FIT_PARAM) continue;
    const wanted = selection.get(facet.param);
    if (wanted && !matchesFacet(product, facet, wanted)) return false;
  }
  return matchesVariants(product, selection, inStock, skip);
}

export type FacetValue = {
  value: string;
  label: string;
  count: number;
  active: boolean;
  swatch?: string;
  group?: string;
};

export type FacetGroup = { name: string; param: string; kind: FacetKind; values: FacetValue[]; activeCount: number };

const GENERAL_SIZES = ["Extra Small", "Small", "Medium", "Large", "Extra Large", "XX Large", "XXX Large"];
const ACCESSORY_SIZES = ["S/M", "L/XL", "O/S", "One Size"];

function sizeGroup(value: string) {
  if (ACCESSORY_SIZES.includes(value)) return "Accessories";
  if (GENERAL_SIZES.includes(value)) return "General";
  const n = Number(value);
  if (!Number.isNaN(n)) return n >= 20 ? "Waist" : "Footwear";
  return "Other";
}

const SIZE_GROUP_ORDER = ["Accessories", "General", "Waist", "Footwear", "Other"];

function sizeRank(value: string) {
  const group = SIZE_GROUP_ORDER.indexOf(sizeGroup(value));
  const within = ACCESSORY_SIZES.includes(value)
    ? ACCESSORY_SIZES.indexOf(value)
    : GENERAL_SIZES.includes(value)
      ? GENERAL_SIZES.indexOf(value)
      : Number(value) || 0;
  return group * 1000 + within;
}

/**
 * Applies the URL's filters and builds the facet groups. Groups list every value present
 * among `products`; counts are computed against the other groups' active filters.
 */
export function applyFilters(products: Product[], searchParams: SearchParamsRecord, facetNames?: string[]) {
  const selection = readSelection(searchParams);
  const inStock = inStockOnly(searchParams);
  const filtered = products.filter((p) => matches(p, selection, inStock));

  const names = facetNames?.length ? facetNames : ALL_FACET_NAMES;
  const groups: FacetGroup[] = [];
  for (const name of names) {
    const facet = FACETS.find((f) => f.name === name);
    if (!facet) continue;
    const wanted = selection.get(facet.param) ?? new Set<string>();
    const counts = new Map<string, { label: string; count: number }>();
    for (const product of products) {
      for (const value of facet.values(product)) {
        if (!counts.has(value)) counts.set(value, { label: value, count: 0 });
      }
    }
    for (const product of products) {
      if (!matches(product, selection, inStock, facet.param)) continue;
      for (const value of new Set(facet.values(product))) {
        const entry = counts.get(value);
        if (entry) entry.count += 1;
      }
    }
    const values: FacetValue[] = [...counts.entries()].map(([value, { count }]) => ({
      value,
      label: facet.kind === "size" ? sizeLabel(value) : value,
      count,
      active: wanted.has(norm(value)),
      swatch: facet.kind === "colour" ? COLOUR_SWATCHES[value.toLowerCase()] ?? "#cccccc" : undefined,
      group: facet.kind === "size" ? sizeGroup(value) : undefined,
    }));
    values.sort((a, b) =>
      facet.kind === "size" ? sizeRank(a.value) - sizeRank(b.value) : a.label.localeCompare(b.label),
    );
    if (!values.length) continue;
    groups.push({
      name: facet.name,
      param: facet.param,
      kind: facet.kind,
      values,
      activeCount: values.filter((v) => v.active).length,
    });
  }

  return { products: filtered, groups };
}

export type SortOption = { value: string; label: string };

export const COLLECTION_SORTS: SortOption[] = [
  { value: "manual", label: "Featured" },
  { value: "best-selling", label: "Best selling" },
  { value: "title-ascending", label: "Alphabetically, A-Z" },
  { value: "title-descending", label: "Alphabetically, Z-A" },
  { value: "price-ascending", label: "Price, low to high" },
  { value: "price-descending", label: "Price, high to low" },
  { value: "created-ascending", label: "Date, old to new" },
  { value: "created-descending", label: "Date, new to old" },
];

export const SEARCH_SORTS: SortOption[] = [
  { value: "relevance", label: "Relevance" },
  { value: "price-ascending", label: "Price, low to high" },
  { value: "price-descending", label: "Price, high to low" },
];

export function readSort(searchParams: SearchParamsRecord, options: SortOption[]) {
  const raw = searchParams.sort_by;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return options.find((o) => o.value === value) ?? options[0];
}

/** Stable sort; "manual", "best-selling" and "relevance" keep the incoming order. */
export function sortProducts(products: Product[], sort: string) {
  const list = [...products];
  const byTime = (p: Product) => new Date(p.createdAt).getTime();
  switch (sort) {
    case "title-ascending":
      return list.sort((a, b) => a.title.localeCompare(b.title));
    case "title-descending":
      return list.sort((a, b) => b.title.localeCompare(a.title));
    case "price-ascending":
      return list.sort((a, b) => a.price - b.price);
    case "price-descending":
      return list.sort((a, b) => b.price - a.price);
    case "created-ascending":
      return list.sort((a, b) => byTime(a) - byTime(b));
    case "created-descending":
      return list.sort((a, b) => byTime(b) - byTime(a));
    default:
      return list;
  }
}

/** Every query word (or its singular) must appear in the title, colour, category or fabric. */
export function searchProducts(products: Product[], query: string) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const scored: { product: Product; score: number; index: number }[] = [];
  products.forEach((product, index) => {
    const title = product.title.toLowerCase();
    const haystack = [title, product.colour, product.subType, product.fabric, product.fabricGroup]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const variants = (word: string) => (word.length > 3 && word.endsWith("s") ? [word, word.slice(0, -1)] : [word]);
    if (!words.every((w) => variants(w).some((v) => haystack.includes(v)))) return;
    const score = words.filter((w) => variants(w).some((v) => title.includes(v))).length;
    scored.push({ product, score, index });
  });
  return scored.sort((a, b) => b.score - a.score || a.index - b.index).map((s) => s.product);
}

/** URL query as ordered [key, value] pairs, for the client to toggle filters on. */
export function toQueryPairs(searchParams: SearchParamsRecord): [string, string][] {
  const pairs: [string, string][] = [];
  for (const [key, raw] of Object.entries(searchParams)) {
    for (const value of Array.isArray(raw) ? raw : raw === undefined ? [] : [raw]) pairs.push([key, value]);
  }
  return pairs;
}

/** True when `href` points at this path with exactly the current query (order-insensitive). */
export function isCurrentHref(href: string, paths: string[], pairs: [string, string][]) {
  const url = new URL(href, "http://local");
  if (!paths.includes(url.pathname)) return false;
  const key = (list: [string, string][]) =>
    list
      .map(([k, v]) => `${k}=${v}`)
      .sort()
      .join("&");
  return key([...url.searchParams.entries()]) === key(pairs);
}

/**
 * Light card data for the client grid; "model" view prefers an "_on_" (on-model) shot.
 * Fields the card does not read (hover image, alt text, dimensions) are dropped to keep
 * 700+ product payloads small.
 */
export function toListingItem(product: Product) {
  const summary = toSummary(product);
  const slim = (image: ProductImage | null): ProductImage | null =>
    image ? { src: image.src, width: 0, height: 0, alt: "" } : null;
  return {
    ...summary,
    image: slim(summary.image),
    hoverImage: null,
    modelImage: slim(product.images.find((i) => /_on_/i.test(i.src)) ?? summary.hoverImage),
  };
}
