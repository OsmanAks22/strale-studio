export const ASSET_ROOT = "/sites/strale";
export const SITE_DOMAIN = "strale.studio";

/**
 * Store destinations (collections, products, account…) are not built yet; they resolve to local
 * paths that the catch-all route renders as "Coming soon". External URLs pass through untouched.
 */
export function storeUrl(path: string) {
  return path;
}

export type MenuLink = { label: string; href: string };
export type MenuColumn = { heading: string; links: MenuLink[] };
export type NavItem = {
  label: string;
  href?: string;
  columns?: MenuColumn[];
  feature?: { image: string; caption: string; href: string };
};

export const navItems: NavItem[] = [
  {
    label: "New In",
    href: "/collections/new-in",
    columns: [
      {
        heading: "Featured",
        links: [
          { label: "New Arrivals", href: "/collections/new-in" },
          { label: "Fall '26 Lookbook", href: "/collections/fall-26-lookbook" },
          { label: "Field Layers", href: "/collections/outerwear" },
          { label: "Sweats", href: "/collections/sweats" },
        ],
      },
      {
        heading: "New In",
        links: [
          { label: "Hoodies & Sweatshirts", href: "/collections/new-in/sweatshirts" },
          { label: "T-Shirts", href: "/collections/new-in/t-shirts" },
          { label: "Pants", href: "/collections/new-in/pants" },
          { label: "Knitwear", href: "/collections/new-in/knitwear" },
          { label: "Jackets & Outerwear", href: "/collections/new-in/outerwear" },
          { label: "Shirts & Overshirts", href: "/collections/new-in/shirts" },
          { label: "Accessories", href: "/collections/new-in/accessories" },
        ],
      },
    ],
    feature: {
      image: `${ASSET_ROOT}/images/menu/latest.jpg`,
      caption: "Shop New Arrivals",
      href: "/collections/new-in",
    },
  },
  {
    label: "Clothing",
    href: "/collections/clothing",
    columns: [
      {
        heading: "Tops",
        links: [
          { label: "Hoodies & Sweatshirts", href: "/collections/sweatshirts" },
          { label: "T-Shirts", href: "/collections/t-shirts" },
          { label: "Knitwear", href: "/collections/knitwear" },
          { label: "Jackets & Outerwear", href: "/collections/outerwear" },
          { label: "Shirts & Overshirts", href: "/collections/shirts" },
          { label: "Polo Shirts", href: "/collections/polo-shirts" },
        ],
      },
      {
        heading: "Bottoms",
        links: [
          { label: "Pants", href: "/collections/pants" },
          { label: "Sweatpants", href: "/collections/sweatpants" },
          { label: "Shorts", href: "/collections/shorts" },
        ],
      },
      {
        heading: "Lines",
        links: [
          { label: "Sweats", href: "/collections/sweats" },
          { label: "Essentials", href: "/collections/essentials" },
          { label: "Field", href: "/collections/field" },
          { label: "Motion", href: "/collections/motion" },
          { label: "Shop All", href: "/collections/clothing" },
        ],
      },
    ],
    feature: {
      image: `${ASSET_ROOT}/images/menu/clothing.jpg`,
      caption: "Shop Knitwear",
      href: "/collections/knitwear",
    },
  },
  { label: "Outerwear", href: "/collections/outerwear" },
  { label: "Sweats", href: "/collections/sweats" },
  {
    label: "Accessories",
    href: "/collections/accessories",
    columns: [
      {
        heading: "Featured",
        links: [
          { label: "Headwear", href: "/collections/accessories/headwear" },
          { label: "Bags", href: "/collections/accessories/bags" },
          { label: "Belts", href: "/collections/accessories/belts" },
          { label: "Scarves", href: "/collections/accessories/scarves" },
          { label: "Socks", href: "/collections/accessories/socks" },
          { label: "Shop All", href: "/collections/accessories" },
        ],
      },
    ],
    feature: {
      image: `${ASSET_ROOT}/images/menu/accessories.jpg`,
      caption: "Shop Accessories",
      href: "/collections/accessories",
    },
  },
  {
    label: "Shop By",
    columns: [
      {
        heading: "Fabric",
        links: [
          { label: "Loopback Terry", href: "/collections/loopback-terry" },
          { label: "Heavy Jersey", href: "/collections/heavy-jersey" },
          { label: "Cotton Twill", href: "/collections/cotton-twill" },
          { label: "Merino Wool", href: "/collections/merino" },
          { label: "Wool Fleece", href: "/collections/wool-fleece" },
        ],
      },
      {
        heading: "Fit",
        links: [
          { label: "Slim", href: "/collections/slim-fit" },
          { label: "Standard", href: "/collections/standard-fit" },
          { label: "Relaxed", href: "/collections/relaxed-fit" },
        ],
      },
    ],
    feature: {
      image: `${ASSET_ROOT}/images/menu/shop-by.jpg`,
      caption: "Shop Loopback Terry",
      href: "/collections/loopback-terry",
    },
  },
];

/** `image` is the file name in public/sites/strale/images/products (placeholder photography). */
export type Product = { name: string; handle: string; image: string; price: string };

export const newArrivals: Product[] = [
  { name: "Wool Fleece Vane Chore Jacket", handle: "vane-chore-jacket-umber", image: "wool-fleece-chore-jacket-heather-brown", price: "$320 USD" },
  { name: "Brushed Flannel Ridge Shirt", handle: "ridge-flannel-shirt-oxide", image: "cotton-flannel-highland-shirt-arctic-wolf-oxide", price: "$135 USD" },
  { name: "Tech Pique Arc Standard Track Pant", handle: "arc-track-pant-navy", image: "poly-pique-campo-standard-track-pant-5738-navy", price: "$135 USD" },
  { name: "Merino Quill Quarter Zip", handle: "quill-quarter-zip-grey", image: "merino-kenny-quarter-zip-nep-heather-grey", price: "$245 USD" },
  { name: "Merino Jersey Point Slim T-Shirt", handle: "point-slim-t-shirt-ink", image: "merino-jersey-vista-slim-t-shirt-black", price: "$95 USD" },
  { name: "Tech Pique Arc Standard Track Jacket", handle: "arc-track-jacket-navy", image: "poly-pique-campo-standard-track-jacket-3235-navy", price: "$145 USD" },
  { name: "Wool Fleece Vane Zip Jacket", handle: "vane-zip-jacket-ink", image: "wool-fleece-ridge-zip-jacket-heather-black", price: "$320 USD" },
  { name: "Merino Jersey Point Slim T-Shirt", handle: "point-slim-t-shirt-carbon", image: "merino-jersey-vista-slim-t-shirt-carbon", price: "$95 USD" },
  { name: "Tech Pique Arc Standard Track Pant", handle: "arc-track-pant-petrol", image: "poly-pique-campo-standard-track-pant-5738-petrol", price: "$135 USD" },
  { name: "Heavy Jersey Standard Long Sleeve", handle: "standard-long-sleeve-ink", image: "midweight-jersey-standard-long-sleeve-2361-black", price: "$68 USD" },
  { name: "Tech Pique Arc Standard Track Jacket", handle: "arc-track-jacket-petrol", image: "poly-pique-campo-standard-track-jacket-3235-petrol", price: "$145 USD" },
  { name: "Double Fleece Relaxed Sweatpant", handle: "relaxed-sweatpant-ink", image: "dual-fleece-relaxed-sweatpant-black", price: "$135 USD" },
];

export const categories = [
  { label: "T-Shirts", slug: "t-shirts", href: "/collections/t-shirts" },
  { label: "Pants", slug: "pants", href: "/collections/pants" },
  { label: "Knitwear", slug: "knitwear", href: "/collections/knitwear" },
  { label: "Shirts", slug: "shirts", href: "/collections/shirts" },
  { label: "Accessories", slug: "accessories", href: "/collections/accessories" },
];

export const contentCards = [
  {
    title: "Sweats",
    text: "The foundation of every wardrobe.",
    image: `${ASSET_ROOT}/images/content/sweats.jpg`,
    href: "/collections/sweats",
  },
  {
    title: "Field Layers",
    text: "Outerwear cut for cold mornings and long days.",
    image: `${ASSET_ROOT}/images/content/jackets-outerwear.jpg`,
    href: "/collections/outerwear",
  },
];

export const footerColumns: MenuColumn[] = [
  {
    heading: "Strale Studio",
    links: [
      { label: "About Us", href: "/pages/about" },
      { label: "Journal", href: "/journal" },
      { label: "Materials", href: "/pages/materials" },
      { label: "Fit Guide", href: "/pages/fit-guide" },
      { label: "Careers", href: "/pages/careers" },
      { label: "Gift Card", href: "/products/gift-card" },
      { label: "The List", href: "/pages/newsletter" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Contact Us", href: "/pages/contact" },
      { label: "Shipping", href: "/pages/shipping" },
      { label: "Returns & Exchanges", href: "/pages/returns" },
      { label: "Wholesale Enquiries", href: "/pages/wholesale" },
      { label: "Product Care", href: "/pages/product-care" },
      { label: "Payment Options", href: "/pages/payment" },
      { label: "Terms of Service", href: "/pages/terms" },
      { label: "Privacy Policy", href: "/pages/privacy" },
    ],
  },
];

export const legalLinks: MenuLink[] = [
  { label: "Terms of Service", href: "/pages/terms" },
  { label: "Privacy Policy", href: "/pages/privacy" },
  { label: "Manage Cookies", href: "/pages/privacy" },
];

export const shippingRegions = ["International", "Türkiye", "European Union", "United States"];
