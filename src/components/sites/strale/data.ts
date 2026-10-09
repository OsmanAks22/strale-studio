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
 * "i" (SLIM, THE LIST…) are therefore written in capitals here so they stay correct.
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
          { label: "Bu Hafta Gelenler", href: "/koleksiyonlar/bu-hafta" },
          { label: "Son Bedenler", href: "/koleksiyonlar/son-bedenler" },
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
        heading: "Fırsatlar",
        links: [
          { label: "%50 ve Üzeri İndirim", href: "/koleksiyonlar/yuzde-50-ustu" },
          { label: "Son Bedenler", href: "/koleksiyonlar/son-bedenler" },
          { label: "Hafif Kusurlu", href: "/koleksiyonlar/hafif-kusurlu" },
          { label: "Eşofman & Sweat", href: "/koleksiyonlar/esofman-sweat" },
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
  { label: "Son Fırsatlar", href: "/koleksiyonlar/son-firsatlar" },
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

/**
 * Export-surplus listing. `listPrice` is the struck-through reference price: under Turkish price
 * labelling rules it must be the lowest price this store charged in the 30 days before the discount.
 * `image` is the file name in public/sites/strale/images/products (placeholder photography).
 */
export type Product = {
  name: string;
  handle: string;
  image: string;
  price: number;
  listPrice: number;
  stock: number;
  sizes: string[];
};

/** Show "Son N adet" at or below this many pieces. */
export const LOW_STOCK = 3;

export function discountPercent({ price, listPrice }: Pick<Product, "price" | "listPrice">) {
  return Math.round((1 - price / listPrice) * 100);
}

export const newArrivals: Product[] = [
  { name: "Yün Polar Ceket — Kahve", handle: "yun-polar-ceket-kahve", image: "wool-fleece-chore-jacket-heather-brown", price: 3490, listPrice: 6990, stock: 4, sizes: ["M", "L", "XL"] },
  { name: "Ekose Flanel Gömlek — Haki", handle: "ekose-flanel-gomlek-haki", image: "cotton-flannel-highland-shirt-arctic-wolf-oxide", price: 1290, listPrice: 2490, stock: 2, sizes: ["S", "M"] },
  { name: "Şeritli Eşofman Altı — Lacivert", handle: "seritli-esofman-alti-lacivert", image: "poly-pique-campo-standard-track-pant-5738-navy", price: 990, listPrice: 1990, stock: 7, sizes: ["S", "M", "L", "XL"] },
  { name: "Merinos Yarım Fermuarlı Triko — Gri", handle: "merinos-yarim-fermuar-triko-gri", image: "merino-kenny-quarter-zip-nep-heather-grey", price: 2190, listPrice: 4290, stock: 3, sizes: ["M", "L"] },
  { name: "Merinos Slim Tişört — Siyah", handle: "merinos-slim-tisort-siyah", image: "merino-jersey-vista-slim-t-shirt-black", price: 690, listPrice: 1290, stock: 12, sizes: ["S", "M", "L", "XL"] },
  { name: "Şeritli Eşofman Üstü — Lacivert", handle: "seritli-esofman-ustu-lacivert", image: "poly-pique-campo-standard-track-jacket-3235-navy", price: 1190, listPrice: 2290, stock: 5, sizes: ["M", "L", "XL"] },
  { name: "Yün Polar Fermuarlı Ceket — Siyah", handle: "yun-polar-fermuarli-ceket-siyah", image: "wool-fleece-ridge-zip-jacket-heather-black", price: 3490, listPrice: 6990, stock: 1, sizes: ["L"] },
  { name: "Merinos Slim Tişört — Antrasit", handle: "merinos-slim-tisort-antrasit", image: "merino-jersey-vista-slim-t-shirt-carbon", price: 690, listPrice: 1290, stock: 9, sizes: ["S", "M", "L"] },
  { name: "Şeritli Eşofman Altı — Petrol", handle: "seritli-esofman-alti-petrol", image: "poly-pique-campo-standard-track-pant-5738-petrol", price: 990, listPrice: 1990, stock: 6, sizes: ["M", "L", "XL"] },
  { name: "Uzun Kollu Basic Tişört — Siyah", handle: "uzun-kollu-basic-tisort-siyah", image: "midweight-jersey-standard-long-sleeve-2361-black", price: 490, listPrice: 990, stock: 18, sizes: ["S", "M", "L", "XL", "XXL"] },
  { name: "Şeritli Eşofman Üstü — Petrol", handle: "seritli-esofman-ustu-petrol", image: "poly-pique-campo-standard-track-jacket-3235-petrol", price: 1190, listPrice: 2290, stock: 2, sizes: ["M"] },
  { name: "Polar Rahat Eşofman Altı — Siyah", handle: "polar-rahat-esofman-alti-siyah", image: "dual-fleece-relaxed-sweatpant-black", price: 1090, listPrice: 2190, stock: 8, sizes: ["S", "M", "L", "XL"] },
];

/** Shown under the hero. */
export const trustItems = [
  { title: "İhracat kalitesi", text: "Yurt dışı siparişler için üretilmiş parçalar" },
  { title: `${formatPrice(FREE_SHIPPING_THRESHOLD)} üzeri ücretsiz kargo`, text: "1–3 iş gününde kargoda" },
  { title: "14 gün koşulsuz iade", text: "Beden olmazsa ücretsiz değişim" },
  { title: "Güvenli ödeme", text: "Kart, havale ve kapıda ödeme" },
];

/** "İhraç fazlası nedir?" explainer. */
export const surplusFacts = [
  {
    title: "Nereden geliyor?",
    text: "Türkiye’deki fabrikalarda yurt dışı siparişler için üretilen partilerden artan, sevkiyata girmeyen parçalar.",
  },
  {
    title: "Neden bu fiyat?",
    text: "Sezon kapanışı, fazla üretim ya da iptal edilen siparişler. Aracı ve mağaza maliyeti olmadan doğrudan stoktan satıyoruz.",
  },
  {
    title: "Nasıl kontrol ediyoruz?",
    text: "Her parça tek tek kontrol edilir. Hafif kusurlu ürünler açıkça etiketlenir; marka etiketi bulunan ürün satmayız.",
  },
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
    text: "Fabrika fazlası sweat ve eşofmanlar, etiket fiyatının yarısına.",
    image: `${ASSET_ROOT}/images/content/sweats.jpg`,
    href: "/koleksiyonlar/esofman-sweat",
  },
  {
    title: "Dış Giyim",
    text: "Avrupa siparişlerinden artan yün ve polar ceketler. Sınırlı adet.",
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
