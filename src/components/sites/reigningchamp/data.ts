export const SOURCE_ORIGIN = "https://reigningchamp.com";
export const ASSET_ROOT = "/sites/reigningchamp";

/** Every destination outside this clone points back to the live store. */
export function sourceUrl(path: string) {
  return path.startsWith("http") ? path : `${SOURCE_ORIGIN}${path}`;
}

export type MenuLink = { label: string; href: string };
export type MenuColumn = { heading: string; links: MenuLink[] };
export type NavItem = {
  label: string;
  href?: string;
  columns?: MenuColumn[];
  feature?: { image: string; caption: string; href: string };
};

const latestFilter = (category: string) =>
  `/collections/mens-latest?sort_by=manual&filter.p.m.custom.sub_category_filter=${category}&filter.v.availability=1`;
const accessoriesFilter = (category: string) =>
  `/collections/mens-all-accessories?sort_by=manual&filter.p.m.custom.sub_category_filter=${category}&filter.v.availability=1`;

export const navItems: NavItem[] = [
  {
    label: "Latest",
    href: "/collections/mens-latest",
    columns: [
      {
        heading: "Featured",
        links: [
          { label: "New Arrivals", href: "/collections/mens-latest" },
          { label: "Fall '26 Lookbook", href: "/collections/fall-lookbook" },
          { label: "The Outerwear Shop", href: "/collections/mens-jackets" },
          { label: "Sweats", href: "/collections/mens-sweats" },
        ],
      },
      {
        heading: "New In",
        links: [
          { label: "Hoodies & Sweatshirts", href: latestFilter("Sweatshirts") },
          { label: "T-shirts", href: latestFilter("T-Shirts") },
          { label: "Pants", href: latestFilter("Pants") },
          { label: "Sweaters & Cardigans", href: "/collections/mens-sweaters" },
          {
            label: "Jackets & Outerwear",
            href: `${latestFilter("Coats")}&filter.p.m.custom.sub_category_filter=Jackets`,
          },
          { label: "Shirts & Overshirts", href: latestFilter("Shirts") },
          { label: "Polo Shirts", href: latestFilter("Polo+Shirts") },
          {
            label: "Accessories",
            href: `${latestFilter("Headwear")}&filter.p.m.custom.sub_category_filter=Robes&filter.p.m.custom.sub_category_filter=Scarves`,
          },
        ],
      },
    ],
    feature: {
      image: `${ASSET_ROOT}/images/menu/latest.jpg`,
      caption: "Shop New Arrivals",
      href: "/collections/mens-latest",
    },
  },
  {
    label: "Clothing",
    href: "/collections/mens-all-clothing",
    columns: [
      {
        heading: "Tops",
        links: [
          { label: "Hoodies & Sweatshirts", href: "/collections/mens-hoodies-sweatshirts" },
          { label: "T-Shirts", href: "/collections/mens-t-shirts" },
          { label: "Sweaters & Cardigans", href: "/collections/mens-sweaters" },
          { label: "Jackets & Outerwear", href: "/collections/mens-jackets" },
          { label: "Shirts & Overshirts", href: "/collections/mens-shirts" },
          { label: "Polo Shirts", href: "/collections/mens-polo-shirts" },
        ],
      },
      {
        heading: "Bottoms",
        links: [
          { label: "Pants", href: "/collections/mens-pants" },
          { label: "Sweatpants", href: "/collections/mens-sweatpants" },
          { label: "Shorts", href: "/collections/mens-shorts" },
        ],
      },
      {
        heading: "Departments",
        links: [
          { label: "Sweats", href: "/collections/mens-sweats" },
          { label: "Classics", href: "/collections/mens-classics-clothing" },
          { label: "Sportswear", href: "/collections/mens-sportswear-clothing" },
          { label: "Performance", href: "/collections/mens-performance-clothing" },
          { label: "Shop All", href: "/collections/mens-all-clothing" },
        ],
      },
    ],
    feature: {
      image: `${ASSET_ROOT}/images/menu/clothing.jpg`,
      caption: "Shop Knitwear",
      href: "/collections/mens-knitwear",
    },
  },
  { label: "The Outerwear Shop", href: "/collections/mens-jackets" },
  { label: "Sweats", href: "/collections/mens-sweats" },
  {
    label: "Accessories",
    href: "/collections/mens-all-accessories",
    columns: [
      {
        heading: "Featured",
        links: [
          { label: "Headwear", href: accessoriesFilter("Headwear") },
          { label: "Robes", href: accessoriesFilter("Robes") },
          { label: "Bags", href: accessoriesFilter("Bags") },
          { label: "Belts", href: accessoriesFilter("Belts") },
          { label: "Scarves", href: accessoriesFilter("Scarves") },
          {
            label: "Footwear & Socks",
            href: `${accessoriesFilter("Footwear")}&filter.p.m.custom.sub_category_filter=Socks`,
          },
          { label: "Shop All", href: "/collections/mens-all-accessories" },
        ],
      },
    ],
    feature: {
      image: `${ASSET_ROOT}/images/menu/accessories.jpg`,
      caption: "Shop Accessories",
      href: "/collections/mens-all-accessories",
    },
  },
  {
    label: "Shop By",
    columns: [
      {
        heading: "Fabric",
        links: [
          { label: "Midweight Terry", href: "/collections/mens-midweight-terry" },
          { label: "Midweight Jersey", href: "/collections/mens-midweight-jersey" },
          { label: "Cotton Chino", href: "/collections/cotton-chino" },
          { label: "Merino Wool", href: "/collections/merino" },
          { label: "Cashmere", href: "/collections/cashmere" },
        ],
      },
      {
        heading: "Fit",
        links: [
          { label: "Slim", href: "/collections/mens-slim-fit" },
          { label: "Standard", href: "/collections/mens-standard-fit" },
          { label: "Relaxed", href: "/collections/mens-relaxed-fit" },
        ],
      },
      {
        heading: "Brands & Collections",
        links: [{ label: "Puma Collection", href: "/collections/puma-reigning-champ-collection" }],
      },
    ],
    feature: {
      image: `${ASSET_ROOT}/images/menu/shop-by.jpg`,
      caption: "Shop Midweight Terry",
      href: "/collections/mens-midweight-terry",
    },
  },
];

export type Product = { name: string; handle: string; price: string };

export const newArrivals: Product[] = [
  { name: "Wool Fleece Chore Jacket", handle: "wool-fleece-chore-jacket-heather-brown", price: "$325 USD" },
  { name: "Cotton Flannel Highland Shirt", handle: "cotton-flannel-highland-shirt-arctic-wolf-oxide", price: "$138 USD" },
  { name: "Poly Pique Campo Standard Track Pant", handle: "poly-pique-campo-standard-track-pant-5738-navy", price: "$138 USD" },
  { name: "Merino Kenny Quarter Zip", handle: "merino-kenny-quarter-zip-nep-heather-grey", price: "$248 USD" },
  { name: "Merino Jersey Vista Slim T-Shirt", handle: "merino-jersey-vista-slim-t-shirt-black", price: "$98 USD" },
  { name: "Poly Pique Campo Standard Track Jacket", handle: "poly-pique-campo-standard-track-jacket-3235-navy", price: "$148 USD" },
  { name: "Wool Fleece Ridge Zip Jacket", handle: "wool-fleece-ridge-zip-jacket-heather-black", price: "$325 USD" },
  { name: "Merino Jersey Vista Slim T-Shirt", handle: "merino-jersey-vista-slim-t-shirt-carbon", price: "$98 USD" },
  { name: "Poly Pique Campo Standard Track Pant", handle: "poly-pique-campo-standard-track-pant-5738-petrol", price: "$138 USD" },
  { name: "Midweight Jersey Standard Long Sleeve", handle: "midweight-jersey-standard-long-sleeve-2361-black", price: "$68 USD" },
  { name: "Poly Pique Campo Standard Track Jacket", handle: "poly-pique-campo-standard-track-jacket-3235-petrol", price: "$148 USD" },
  { name: "Dual Fleece Relaxed Sweatpant", handle: "dual-fleece-relaxed-sweatpant-black", price: "$138 USD" },
];

export const categories = [
  { label: "T-Shirts", slug: "t-shirts", href: "/collections/mens-t-shirts" },
  { label: "Pants", slug: "pants", href: "/collections/mens-pants" },
  { label: "Knitwear", slug: "knitwear", href: "/collections/mens-knitwear" },
  { label: "Shirts", slug: "shirts", href: "/collections/mens-shirts" },
  { label: "Accessories", slug: "accessories", href: "/collections/mens-all-accessories" },
];

export const contentCards = [
  {
    title: "Sweats",
    text: "The foundations of the season.",
    image: `${ASSET_ROOT}/images/content/sweats.jpg`,
    href: "/collections/mens-sweats",
  },
  {
    title: "Jackets & Outerwear",
    text: "A renewed approach to classic fall silhouettes.",
    image: `${ASSET_ROOT}/images/content/jackets-outerwear.jpg`,
    href: "/collections/mens-jackets",
  },
];

export const footerColumns: MenuColumn[] = [
  {
    heading: "Reigning Champ",
    links: [
      { label: "About Us", href: "/pages/about-us" },
      { label: "Stores", href: "/pages/stores" },
      { label: "Careers", href: "/pages/careers" },
      { label: "The Intermission", href: "/blogs/the-intermission" },
      { label: "Manufacturing", href: "/pages/manufacturing" },
      { label: "Fit Guide", href: "/pages/fit-guide" },
      { label: "Gift Card", href: "/products/digital-gift-card" },
      { label: "Mailing List", href: "/pages/newsletter" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Contact Us", href: "/pages/contact" },
      { label: "Shipping", href: "/pages/shipping-policy" },
      { label: "Returns & Exchanges", href: "/pages/refund-policy" },
      { label: "Wholesale and Corporate Enquiries", href: "/pages/wholesale-and-corporate-enquiries" },
      { label: "Product Guarantee", href: "/pages/product-guarantee" },
      { label: "Fit Guide", href: "/pages/fit-guide" },
      { label: "Payment Options", href: "/pages/payment-method" },
      { label: "Terms of Service", href: "/pages/terms-of-service" },
      { label: "Privacy Policy", href: "/pages/privacy-policy" },
      { label: "Pre-Orders", href: "/pages/pre-orders" },
    ],
  },
];

export const legalLinks: MenuLink[] = [
  { label: "Terms of Service", href: "/pages/terms-of-service" },
  { label: "Privacy Policy", href: "/pages/privacy-policy" },
  { label: "Manage Cookies", href: "/pages/privacy-policy" },
  {
    label: "Do Not Sell or Share My Personal Information",
    href: "/pages/do-not-sell-or-share-my-personal-information",
  },
];

export const shippingRegions = ["US | International", "Canada", "United States", "International"];
