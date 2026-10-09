export const ASSET_ROOT = "/sites/strale";

/**
 * Store destinations (collections, products, account…) are not built yet; they resolve to local
 * paths that the catch-all route renders as "Yakında". External URLs pass through untouched.
 */
export function storeUrl(path: string) {
  return path;
}

const tryFormat = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

/** 12900 → "₺12.900" */
export function formatPrice(amount: number) {
  return tryFormat.format(amount);
}

export const FREE_SHIPPING_THRESHOLD = 2500;

/** Social accounts are not opened yet; add `{ label, href }` entries here once they exist. */
export const socialLinks: { label: "Instagram" | "X"; href: string }[] = [];

/*
 * Labels are rendered uppercase under lang="tr", which maps "i" → "İ". English words containing an
 * "i" (FIELD, MOTION, SLIM, THE LIST…) are therefore written in capitals here so they stay correct.
 */
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
    label: "Yeni Gelenler",
    href: "/koleksiyonlar/yeni-gelenler",
    columns: [
      {
        heading: "Öne Çıkanlar",
        links: [
          { label: "Yeni Gelenler", href: "/koleksiyonlar/yeni-gelenler" },
          { label: "Sonbahar ‘26 Lookbook", href: "/koleksiyonlar/sonbahar-26-lookbook" },
          { label: "FIELD Serisi", href: "/koleksiyonlar/dis-giyim" },
          { label: "Eşofman & Sweat", href: "/koleksiyonlar/esofman-sweat" },
        ],
      },
      {
        heading: "Yeni",
        links: [
          { label: "Kapüşonlu & Sweatshirt", href: "/koleksiyonlar/yeni-gelenler/sweatshirt" },
          { label: "Tişört", href: "/koleksiyonlar/yeni-gelenler/tisort" },
          { label: "Pantolon", href: "/koleksiyonlar/yeni-gelenler/pantolon" },
          { label: "Triko", href: "/koleksiyonlar/yeni-gelenler/triko" },
          { label: "Ceket & Dış Giyim", href: "/koleksiyonlar/yeni-gelenler/dis-giyim" },
          { label: "Gömlek & Overshirt", href: "/koleksiyonlar/yeni-gelenler/gomlek" },
          { label: "Aksesuar", href: "/koleksiyonlar/yeni-gelenler/aksesuar" },
        ],
      },
    ],
    feature: {
      image: `${ASSET_ROOT}/images/menu/latest.jpg`,
      caption: "Yeni Gelenleri Keşfet",
      href: "/koleksiyonlar/yeni-gelenler",
    },
  },
  {
    label: "Giyim",
    href: "/koleksiyonlar/giyim",
    columns: [
      {
        heading: "Üst Giyim",
        links: [
          { label: "Kapüşonlu & Sweatshirt", href: "/koleksiyonlar/sweatshirt" },
          { label: "Tişört", href: "/koleksiyonlar/tisort" },
          { label: "Triko", href: "/koleksiyonlar/triko" },
          { label: "Ceket & Dış Giyim", href: "/koleksiyonlar/dis-giyim" },
          { label: "Gömlek & Overshirt", href: "/koleksiyonlar/gomlek" },
          { label: "Polo Yaka", href: "/koleksiyonlar/polo-yaka" },
        ],
      },
      {
        heading: "Alt Giyim",
        links: [
          { label: "Pantolon", href: "/koleksiyonlar/pantolon" },
          { label: "Eşofman Altı", href: "/koleksiyonlar/esofman-alti" },
          { label: "Şort", href: "/koleksiyonlar/sort" },
        ],
      },
      {
        heading: "Seriler",
        links: [
          { label: "Eşofman & Sweat", href: "/koleksiyonlar/esofman-sweat" },
          { label: "ESSENTIALS", href: "/koleksiyonlar/essentials" },
          { label: "FIELD", href: "/koleksiyonlar/field" },
          { label: "MOTION", href: "/koleksiyonlar/motion" },
          { label: "Tümünü Gör", href: "/koleksiyonlar/giyim" },
        ],
      },
    ],
    feature: {
      image: `${ASSET_ROOT}/images/menu/clothing.jpg`,
      caption: "Trikoyu Keşfet",
      href: "/koleksiyonlar/triko",
    },
  },
  { label: "Dış Giyim", href: "/koleksiyonlar/dis-giyim" },
  { label: "Sweat", href: "/koleksiyonlar/esofman-sweat" },
  {
    label: "Aksesuar",
    href: "/koleksiyonlar/aksesuar",
    columns: [
      {
        heading: "Öne Çıkanlar",
        links: [
          { label: "Şapka & Bere", href: "/koleksiyonlar/aksesuar/sapka-bere" },
          { label: "Çanta", href: "/koleksiyonlar/aksesuar/canta" },
          { label: "Kemer", href: "/koleksiyonlar/aksesuar/kemer" },
          { label: "Atkı", href: "/koleksiyonlar/aksesuar/atki" },
          { label: "Çorap", href: "/koleksiyonlar/aksesuar/corap" },
          { label: "Tümünü Gör", href: "/koleksiyonlar/aksesuar" },
        ],
      },
    ],
    feature: {
      image: `${ASSET_ROOT}/images/menu/accessories.jpg`,
      caption: "Aksesuarları Keşfet",
      href: "/koleksiyonlar/aksesuar",
    },
  },
  {
    label: "Keşfet",
    columns: [
      {
        heading: "Kumaş",
        links: [
          { label: "Loopback Terry", href: "/koleksiyonlar/loopback-terry" },
          { label: "Kalın Süprem", href: "/koleksiyonlar/kalin-suprem" },
          { label: "Pamuk Gabardin", href: "/koleksiyonlar/pamuk-gabardin" },
          { label: "Merinos Yün", href: "/koleksiyonlar/merinos" },
          { label: "Yün Polar", href: "/koleksiyonlar/yun-polar" },
        ],
      },
      {
        heading: "Kalıp",
        links: [
          { label: "SLIM", href: "/koleksiyonlar/slim-kalip" },
          { label: "Standart", href: "/koleksiyonlar/standart-kalip" },
          { label: "Rahat", href: "/koleksiyonlar/rahat-kalip" },
        ],
      },
    ],
    feature: {
      image: `${ASSET_ROOT}/images/menu/shop-by.jpg`,
      caption: "Loopback Terry’yi Keşfet",
      href: "/koleksiyonlar/loopback-terry",
    },
  },
];

/** `image` is the file name in public/sites/strale/images/products (placeholder photography). */
export type Product = { name: string; handle: string; image: string; price: number };

export const newArrivals: Product[] = [
  { name: "Vane Yün Polar Ceket", handle: "vane-yun-polar-ceket-toprak", image: "wool-fleece-chore-jacket-heather-brown", price: 13900 },
  { name: "Ridge Fırçalanmış Flanel Gömlek", handle: "ridge-flanel-gomlek-oksit", image: "cotton-flannel-highland-shirt-arctic-wolf-oxide", price: 5900 },
  { name: "Arc Teknik Pike Eşofman Altı", handle: "arc-esofman-alti-lacivert", image: "poly-pique-campo-standard-track-pant-5738-navy", price: 5900 },
  { name: "Quill Merinos Yarım Fermuarlı Triko", handle: "quill-merinos-triko-gri", image: "merino-kenny-quarter-zip-nep-heather-grey", price: 10500 },
  { name: "Point Merinos Slim Tişört", handle: "point-merinos-tisort-siyah", image: "merino-jersey-vista-slim-t-shirt-black", price: 3900 },
  { name: "Arc Teknik Pike Eşofman Üstü", handle: "arc-esofman-ustu-lacivert", image: "poly-pique-campo-standard-track-jacket-3235-navy", price: 6200 },
  { name: "Vane Yün Polar Fermuarlı Ceket", handle: "vane-fermuarli-ceket-siyah", image: "wool-fleece-ridge-zip-jacket-heather-black", price: 13900 },
  { name: "Point Merinos Slim Tişört", handle: "point-merinos-tisort-antrasit", image: "merino-jersey-vista-slim-t-shirt-carbon", price: 3900 },
  { name: "Arc Teknik Pike Eşofman Altı", handle: "arc-esofman-alti-petrol", image: "poly-pique-campo-standard-track-pant-5738-petrol", price: 5900 },
  { name: "Kalın Süprem Uzun Kollu Tişört", handle: "suprem-uzun-kollu-siyah", image: "midweight-jersey-standard-long-sleeve-2361-black", price: 2900 },
  { name: "Arc Teknik Pike Eşofman Üstü", handle: "arc-esofman-ustu-petrol", image: "poly-pique-campo-standard-track-jacket-3235-petrol", price: 6200 },
  { name: "Çift Polar Rahat Eşofman Altı", handle: "cift-polar-esofman-alti-siyah", image: "dual-fleece-relaxed-sweatpant-black", price: 5900 },
];

/** `slug` is the image file name in public/sites/strale/images/categories. */
export const categories = [
  { label: "Tişört", slug: "t-shirts", href: "/koleksiyonlar/tisort" },
  { label: "Pantolon", slug: "pants", href: "/koleksiyonlar/pantolon" },
  { label: "Triko", slug: "knitwear", href: "/koleksiyonlar/triko" },
  { label: "Gömlek", slug: "shirts", href: "/koleksiyonlar/gomlek" },
  { label: "Aksesuar", slug: "accessories", href: "/koleksiyonlar/aksesuar" },
];

export const contentCards = [
  {
    title: "Eşofman & Sweat",
    text: "Her gardırobun temeli.",
    image: `${ASSET_ROOT}/images/content/sweats.jpg`,
    href: "/koleksiyonlar/esofman-sweat",
  },
  {
    title: "FIELD Serisi",
    text: "Soğuk sabahlar ve uzun günler için kesilmiş dış giyim.",
    image: `${ASSET_ROOT}/images/content/jackets-outerwear.jpg`,
    href: "/koleksiyonlar/dis-giyim",
  },
];

export const footerColumns: MenuColumn[] = [
  {
    heading: "STRALE STUDIO",
    links: [
      { label: "Hakkımızda", href: "/sayfa/hakkimizda" },
      { label: "Journal", href: "/journal" },
      { label: "Malzemeler", href: "/sayfa/malzemeler" },
      { label: "Beden Rehberi", href: "/sayfa/beden-rehberi" },
      { label: "Kariyer", href: "/sayfa/kariyer" },
      { label: "Hediye Kartı", href: "/urun/hediye-karti" },
      { label: "THE LIST", href: "/sayfa/bulten" },
    ],
  },
  {
    heading: "Yardım",
    links: [
      { label: "İletişim", href: "/sayfa/iletisim" },
      { label: "Kargo & Teslimat", href: "/sayfa/kargo-teslimat" },
      { label: "İade & Değişim", href: "/sayfa/iade-degisim" },
      { label: "Toptan Satış", href: "/sayfa/toptan-satis" },
      { label: "Ürün Bakımı", href: "/sayfa/urun-bakimi" },
      { label: "Ödeme Seçenekleri", href: "/sayfa/odeme-secenekleri" },
      { label: "Sipariş Takibi", href: "/sayfa/siparis-takibi" },
    ],
  },
];

export const legalLinks: MenuLink[] = [
  { label: "Kullanım Koşulları", href: "/sayfa/kullanim-kosullari" },
  { label: "KVKK Aydınlatma Metni", href: "/sayfa/kvkk" },
  { label: "Çerez Politikası", href: "/sayfa/cerez-politikasi" },
  { label: "Mesafeli Satış Sözleşmesi", href: "/sayfa/mesafeli-satis-sozlesmesi" },
];

export const shippingRegions = ["Türkiye", "Uluslararası"];
