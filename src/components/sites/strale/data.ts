/*
 * Labels are rendered uppercase under lang="tr", which maps "i" → "İ". English words containing an
 * "i" are therefore written in capitals here so they stay correct.
 */
export type MenuLink = { label: string; href: string };
export type MenuColumn = { heading: string; links: MenuLink[] };
export type NavItem = {
  label: string;
  href?: string;
  columns?: MenuColumn[];
  /** Mega-menu feature tile; its media is set in media.ts under the same label. */
  feature?: { caption: string; href: string };
};

const collection = (slug: string) => `/koleksiyonlar/${slug}`;

/* Mirrors the cloned nav: Latest · Clothing · Outerwear · Sweats · Accessories · Shop By. */
export const navItems: NavItem[] = [
  {
    label: "Yeni Gelenler",
    href: collection("yeni-gelenler"),
    columns: [
      {
        heading: "Öne Çıkanlar",
        links: [
          { label: "Yeni Gelenler", href: collection("yeni-gelenler") },
          { label: "Son Bedenler", href: collection("son-bedenler") },
          { label: "Dış Giyim", href: collection("dis-giyim") },
          { label: "Eşofman", href: collection("esofman") },
        ],
      },
      {
        heading: "Kategoriler",
        links: [
          { label: "Tişört", href: collection("tisort") },
          { label: "Gömlek", href: collection("gomlek") },
          { label: "Triko", href: collection("triko") },
          { label: "Sweatshirt", href: collection("sweatshirt") },
          { label: "Pantolon", href: collection("pantolon") },
          { label: "Aksesuar", href: collection("aksesuar") },
        ],
      },
    ],
    feature: { caption: "Yeni Gelenlere Göz At", href: collection("yeni-gelenler") },
  },
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
        heading: "Tümü",
        links: [{ label: "Tüm Ürünler", href: collection("tumu") }],
      },
    ],
    feature: { caption: "Trikolara Göz At", href: collection("triko") },
  },
  { label: "Dış Giyim", href: collection("dis-giyim") },
  { label: "Eşofman", href: collection("esofman") },
  { label: "Aksesuar", href: collection("aksesuar") },
  {
    label: "Fırsatlar",
    columns: [
      {
        heading: "İndirim",
        links: [
          { label: "%50 ve Üzeri İndirim", href: collection("yuzde-50-ustu") },
          { label: "Son Bedenler", href: collection("son-bedenler") },
          { label: "Hafif Kusurlu", href: collection("hafif-kusurlu") },
        ],
      },
    ],
    feature: { caption: "Son Bedenlere Göz At", href: collection("son-bedenler") },
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
