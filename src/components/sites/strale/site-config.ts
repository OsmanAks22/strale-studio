import settings from "./store-settings.json";

/**
 * Store settings live in store-settings.json and are edited in the admin panel (/yonetim → Mağaza Ayarları).
 * Empty strings are hidden on the site (and legal pages show "[doldurulacak]").
 */
export type StoreSettings = {
  /** Domain without protocol, e.g. "strale.com.tr". Used for canonical URLs once bought. */
  domain: string;
  /** WhatsApp order line in international format without "+" or spaces, e.g. "905321234567". */
  whatsapp: string;
  /** Display phone, e.g. "0532 123 45 67". */
  phone: string;
  email: string;
  /** Customer-service hours shown on the contact page and footer. */
  hours: string;
  instagram: string;
  /** Legal seller details required on the distance-sales and KVKK pages. */
  company: { title: string; address: string; taxOffice: string; taxNumber: string; mersis: string };
  freeShippingThreshold: number;
  shippingFee: number;
  /** Business days until an order is handed to the carrier. */
  dispatchDays: string;
  returnDays: number;
  /** Offline payment options; card payment is switched on by the payment provider's env keys. */
  payment: { transfer: boolean; cod: boolean; codFee: number };
  /** Shown on the order confirmation for bank transfers. */
  bank: { name: string; accountHolder: string; iban: string };
  announcement: { enabled: boolean; text: string; linkText: string; linkHref: string };
  /** ETBİS verification link (shown in the footer once registered). */
  etbisUrl: string;
};

const stored = settings as StoreSettings;

export const siteConfig = {
  name: "STRALE",
  ...stored,
  /** Payment methods offered with WhatsApp / bank-transfer ordering. */
  paymentMethods: [stored.payment.transfer && stored.bank.iban ? "Havale / EFT" : "", stored.payment.cod ? "Kapıda ödeme (nakit veya kart)" : ""].filter(Boolean),
};

export function whatsappLink(message: string) {
  if (!siteConfig.whatsapp) return null;
  return `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function filled(value: string) {
  return value || "[doldurulacak]";
}

/** Shipping for a basket subtotal. */
export function shippingFor(subtotal: number) {
  return subtotal === 0 || subtotal >= siteConfig.freeShippingThreshold ? 0 : siteConfig.shippingFee;
}
