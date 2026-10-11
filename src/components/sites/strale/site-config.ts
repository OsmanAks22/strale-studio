/**
 * Store settings — the one file to fill in before going live.
 * Empty strings are hidden on the site (and legal pages show "[doldurulacak]").
 */
export const siteConfig = {
  name: "STRALE",
  /** Domain without protocol, e.g. "strale.com.tr". Used for canonical URLs once bought. */
  domain: "",

  /** WhatsApp order line in international format without "+" or spaces, e.g. "905321234567". */
  whatsapp: "",
  /** Display phone, e.g. "0532 123 45 67". */
  phone: "",
  email: "",
  /** Customer-service hours shown on the contact page and footer. */
  hours: "Pazartesi–Cumartesi 10:00–19:00",
  instagram: "",

  /** Legal seller details required on the distance-sales and KVKK pages. */
  company: {
    title: "",
    address: "",
    taxOffice: "",
    taxNumber: "",
    mersis: "",
  },

  freeShippingThreshold: 2500,
  shippingFee: 120,
  /** Business days until an order is handed to the carrier. */
  dispatchDays: "1–3",
  returnDays: 14,
  /** Payment methods offered with WhatsApp ordering (no card POS yet). */
  paymentMethods: ["Havale / EFT", "Kapıda ödeme (nakit veya kart)"],
};

export function whatsappLink(message: string) {
  if (!siteConfig.whatsapp) return null;
  return `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function filled(value: string) {
  return value || "[doldurulacak]";
}
