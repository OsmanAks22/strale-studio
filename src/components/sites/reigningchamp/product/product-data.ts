import {
  getColourways,
  getProductDetails,
  getProducts,
  toSummary,
  type Product,
  type ProductDetails,
  type ProductImage,
  type ProductSummary,
} from "../catalog";
import { sizeLabel } from "../format";
import type { ProductTab } from "./product-tabs-drawer";
import type { OptionValue, ProductViewData } from "./product-view";
import type { SizeGuideData } from "./size-guide";
import { bodySlides, itemSlides } from "./size-guides";

const titleCase = (value: string) => value.replace(/\b([a-z])/g, (c) => c.toUpperCase());

/** The flat "_off_1" shot used by cards and colour swatches. */
export function flatImage(product: Product): ProductImage | null {
  return product.images.find((i) => /_off_1[._]/i.test(i.src)) ?? product.images[0] ?? null;
}

/** The square "_jp" shot is a feed image; the source gallery leaves it out. */
function galleryImages(product: Product) {
  const images = product.images.filter((i) => !/_jp\.[a-z]+(\?|$)/i.test(i.src));
  return images.length ? images : product.images;
}

function buildOption(product: Product): ProductViewData["option"] {
  const option = product.options[0];
  if (!option) return null;
  const values: OptionValue[] = option.values.flatMap((value) => {
    const variants = product.variants.filter((v) => v.options[0] === value);
    const variant = variants.find((v) => v.available) ?? variants[0];
    if (!variant) return [];
    return [
      {
        value,
        label: sizeLabel(value),
        available: variants.some((v) => v.available),
        variantId: variant.id,
        variantTitle: variant.title,
        price: variant.price,
      },
    ];
  });
  return values.length ? { name: option.name, values } : null;
}

function buildSizeGuide(product: Product, details: ProductDetails): SizeGuideData | null {
  const body = details.bodyMeasurements;
  const item = details.itemMeasurements && details.itemMeasurements.rows.some((r) => r.length > 1)
    ? details.itemMeasurements
    : null;
  if (!body.length && !item) return null;

  const productSizes = (product.options.find((o) => o.name === "Size")?.values ?? []).map((value) => ({
    value: sizeLabel(value),
    label: value,
  }));
  const known = new Set([...Object.keys(body[0]?.values ?? {}), ...(item?.rows.map((r) => r[0]) ?? [])]);
  let sizes = productSizes.filter((s) => known.has(s.value));
  if (!sizes.length) sizes = [...known].filter(Boolean).map((value) => ({ value, label: value }));

  const modelSize = /wears size (.+)$/i.exec(details.modelInfo)?.[1]?.trim();
  const initial =
    sizes.find((s) => s.label === modelSize || s.value === modelSize)?.value ??
    sizes[Math.floor((sizes.length - 1) / 2)]?.value ??
    "";

  return {
    sizes,
    initialSize: initial,
    modelInfo: details.modelInfo,
    body,
    item,
    bodySlides: bodySlides(body.map((b) => b.label)),
    itemSlides: item ? itemSlides(product.subType, item.keys) : [],
  };
}

export function buildProductView(product: Product, details: ProductDetails): ProductViewData {
  const sizeGuide = buildSizeGuide(product, details);
  const tabs: ProductTab[] = [
    { key: "details" as const, label: "Details", html: details.details },
    { key: "size-guide" as const, label: "Size Guide", html: sizeGuide ? "guide" : "" },
    { key: "fit" as const, label: "Fit", html: details.fit },
    { key: "fabric-care" as const, label: "Fabric & Care", html: details.fabricCare },
    { key: "shipping-returns" as const, label: "Shipping & Returns", html: details.shippingReturns },
  ].filter((tab) => tab.html.trim());

  const colourIndex = product.options.findIndex((o) => o.name === "Colour");
  const colourName =
    (colourIndex >= 0 ? product.options[colourIndex].values[0] : null) ??
    (product.colour ? titleCase(product.colour) : null);
  const colourways = getColourways(product);

  return {
    handle: product.handle,
    title: product.title,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    colour: product.colour,
    colourName,
    giftCard: product.options[0]?.name === "Amount",
    images: galleryImages(product),
    cardImage: flatImage(product)?.src ?? null,
    breadcrumbs: details.breadcrumbs,
    colourways:
      colourways.length > 1 || colourName
        ? colourways.map((p) => ({
            handle: p.handle,
            colour: p.options.find((o) => o.name === "Colour")?.values[0] ?? (p.colour ? titleCase(p.colour) : null),
            image: flatImage(p)?.src ?? null,
          }))
        : [],
    option: buildOption(product),
    modelInfo: details.modelInfo,
    description: details.description,
    tabs: tabs.map((tab) => (tab.key === "size-guide" ? { key: tab.key, label: tab.label } : tab)),
    sizeGuide,
  };
}

export function relatedProducts(details: ProductDetails) {
  if (!details.related) return null;
  const all = getProducts();
  const items = details.related.handles.map((h) => all[h]).filter(Boolean).map(toSummary);
  return items.length ? { title: details.related.title, href: details.related.href, items } : null;
}

/**
 * "Expand your lineup": the source uses Shopify recommendations (other colourways, same fabric,
 * then complementary categories). Rebuilt from the catalog: one product per title, in-stock only.
 */
export function lineupProducts(product: Product, limit = 8): ProductSummary[] {
  const all = Object.values(getProducts()).filter(
    (p) => p.available && p.images.length && p.productType === product.productType && p.title !== "Gift Card",
  );
  const picked: Product[] = [];
  const titles = new Set([product.title]);
  const take = (p: Product | undefined) => {
    if (!p || picked.length >= limit || picked.includes(p) || p.handle === product.handle) return;
    if (titles.has(p.title) && (p.title !== product.title || picked.some((q) => q.title === p.title))) return;
    picked.push(p);
    titles.add(p.title);
  };

  // 1. another colourway of this product
  take(getColourways(product).find((p) => p.handle !== product.handle && p.available));
  // 2. same fabric, different style
  if (product.fabricGroup) {
    all.filter((p) => p.fabricGroup === product.fabricGroup && p.title !== product.title).slice(0, 2).forEach(take);
  }
  // 3. newest product from each other sub-type in the same department/category
  const newest = [...all].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const seenTypes = new Set([product.subType]);
  for (const p of newest) {
    if (picked.length >= limit) break;
    if (seenTypes.has(p.subType)) continue;
    seenTypes.add(p.subType);
    take(p);
  }
  for (const p of newest) take(p);

  return picked.map(toSummary);
}

export function getProductDetail(handle: string): ProductDetails | undefined {
  return getProductDetails()[handle];
}
