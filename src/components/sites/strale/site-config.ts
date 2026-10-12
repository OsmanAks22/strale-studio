/**
 * Store settings: types and pure helpers. The values come from the database (or store-settings.json when no
 * database is connected) and are edited in the admin panel (/yonetim → Mağaza Ayarları).
 * Server code reads them with `getSettings()` (src/lib/store-data.ts), client components with `useSettings()`.
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

export const STORE_NAME = "STRALE";

/** Bank transfer is only offered once an IBAN is set. */
export const transferEnabled = (s: StoreSettings) => s.payment.transfer && Boolean(s.bank.iban);

/** Payment methods offered with basket / WhatsApp ordering, as shown to customers. */
export function paymentMethodLabels(s: StoreSettings) {
  return [transferEnabled(s) ? "Havale / EFT" : "", s.payment.cod ? "Kapıda ödeme (nakit veya kart)" : ""].filter(Boolean);
}

export function whatsappLink(s: StoreSettings, message: string) {
  if (!s.whatsapp) return null;
  return `https://wa.me/${s.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function filled(value: string) {
  return value || "[doldurulacak]";
}

/** Shipping for a basket subtotal. */
export function shippingFor(s: StoreSettings, subtotal: number) {
  return subtotal === 0 || subtotal >= s.freeShippingThreshold ? 0 : s.shippingFee;
}

/** Public site origin: the bought domain, else Vercel's production URL, else localhost. */
export function siteOriginFor(s: StoreSettings) {
  if (s.domain) return `https://${s.domain}`;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  return vercel ? `https://${vercel}` : "http://localhost:3000";
}
