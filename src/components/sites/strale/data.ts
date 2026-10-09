import { formatPrice } from "./catalog";
import { siteConfig } from "./site-config";

/*
 * Labels are rendered uppercase under lang="tr", which maps "i" → "İ". English words containing an
 * "i" are therefore written in capitals here so they stay correct.
 */
export type MenuLink = { label: string; href: string };
export type MenuColumn = { heading: string; links: MenuLink[] };
export type NavItem = { label: string; href?: string; columns?: MenuColumn[] };

const collection = (slug: string) => `/koleksiyonlar/${slug}`;

export const navItems: NavItem[] = [
  { label: "Yeni Gelenler", href: collection("yeni-gelenler") },
  {
    label: "Giyim",
    href: collection("tumu"),
    columns: [
      {
        heading: "Üst Giyim",
        links: [
          { label: "Tişört", href: collection("tisort") },
          { label: "Gömlek", href: collection("gomlek") },
          { label: "Triko", href: collection("triko") },
          { label: "Sweatshirt", href: collection("sweatshirt") },
          { label: "Dış Giyim", href: collection("dis-giyim") },
        ],
      },
      {
        heading: "Alt Giyim",
        links: [
          { label: "Pantolon", href: collection("pantolon") },
          { label: "Eşofman", href: collection("esofman") },
        ],
      },
      {
        heading: "Fırsatlar",
        links: [
          { label: "%50 ve Üzeri İndirim", href: collection("yuzde-50-ustu") },
          { label: "Son Bedenler", href: collection("son-bedenler") },
          { label: "Hafif Kusurlu", href: collection("hafif-kusurlu") },
          { label: "Tüm Ürünler", href: collection("tumu") },
        ],
      },
    ],
  },
  { label: "Dış Giyim", href: collection("dis-giyim") },
  { label: "Aksesuar", href: collection("aksesuar") },
  { label: "Son Bedenler", href: collection("son-bedenler") },
];

/** Shown under the hero. */
export const trustItems = [
  { title: "İhracat kalitesi", text: "Yurt dışı siparişler için üretilmiş parçalar" },
  {
    title: `${formatPrice(siteConfig.freeShippingThreshold)} üzeri ücretsiz kargo`,
    text: `${siteConfig.dispatchDays} iş gününde kargoda`,
  },
  { title: `${siteConfig.returnDays} gün iade hakkı`, text: "Beden olmazsa değişim" },
  { title: "Kolay sipariş", text: "WhatsApp’tan yaz, havale veya kapıda öde" },
];

/** "İhraç fazlası nedir?" explainer. */
export const surplusFacts = [
  {
    title: "Nereden geliyor?",
    text: "Türkiye’deki fabrikalarda yurt dışı siparişler için üretilen partilerden artan, sevkiyata girmeyen parçalar.",
  },
  {
    title: "Neden bu fiyat?",
    text: "Sezon kapanışı, fazla üretim ya da iptal edilen siparişler. Aracı ve büyük mağaza maliyeti olmadan doğrudan stoktan satıyoruz.",
  },
  {
    title: "Nasıl kontrol ediyoruz?",
    text: "Her parça tek tek kontrol edilir. Hafif kusurlu ürünler açıkça etiketlenir; başka markaya ait logo veya etiket taşıyan ürün satmayız.",
  },
];

export const footerColumns: MenuColumn[] = [
  {
    heading: "STRALE",
    links: [
      { label: "Hakkımızda", href: "/sayfa/hakkimizda" },
      { label: "İletişim", href: "/sayfa/iletisim" },
      { label: "Sıkça Sorulan Sorular", href: "/sayfa/sss" },
      { label: "Beden Rehberi", href: "/sayfa/beden-rehberi" },
    ],
  },
  {
    heading: "Yardım",
    links: [
      { label: "Nasıl Sipariş Verilir?", href: "/sayfa/siparis" },
      { label: "Kargo & Teslimat", href: "/sayfa/kargo-teslimat" },
      { label: "İade & Değişim", href: "/sayfa/iade-degisim" },
      { label: "Ödeme Seçenekleri", href: "/sayfa/odeme" },
    ],
  },
];

export const legalLinks: MenuLink[] = [
  { label: "KVKK Aydınlatma Metni", href: "/sayfa/kvkk" },
  { label: "Mesafeli Satış Sözleşmesi", href: "/sayfa/mesafeli-satis-sozlesmesi" },
  { label: "Ön Bilgilendirme Formu", href: "/sayfa/on-bilgilendirme" },
  { label: "Çerez Politikası", href: "/sayfa/cerez-politikasi" },
];
