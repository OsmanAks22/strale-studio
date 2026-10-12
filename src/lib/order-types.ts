/** Order constants, types and pure helpers — safe to import in browser code (no database driver here). */

export const ORDER_STATUSES = [
  { value: "yeni", label: "Yeni" },
  { value: "onaylandi", label: "Onaylandı" },
  { value: "hazirlaniyor", label: "Hazırlanıyor" },
  { value: "kargoda", label: "Kargoda" },
  { value: "teslim", label: "Teslim edildi" },
  { value: "iptal", label: "İptal" },
  { value: "iade", label: "İade edildi" },
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number]["value"];
/** Orders in these states no longer hold stock. */
export const RELEASED_STATUSES: OrderStatus[] = ["iptal", "iade"];

export const PAYMENT_METHODS = { havale: "Havale / EFT", kapida: "Kapıda ödeme", kart: "Kredi / banka kartı" } as const;
export type PaymentMethod = keyof typeof PAYMENT_METHODS;
export const PAYMENT_STATUSES = { bekliyor: "Ödeme bekleniyor", odendi: "Ödendi", iade: "İade edildi" } as const;
export type PaymentStatus = keyof typeof PAYMENT_STATUSES;

export type OrderItem = { handle: string; name: string; color: string; size: string; price: number; qty: number };
export type Customer = { name: string; phone: string; email?: string; city: string; district: string; address: string; note?: string };

export type Order = {
  id: number;
  code: string;
  created_at: string;
  updated_at: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  customer: Customer;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  discount_code: string | null;
  shipping: number;
  cod_fee: number;
  total: number;
  carrier: string | null;
  tracking: string | null;
  admin_note: string | null;
  stock_applied: boolean;
};

export type StockAlert = { id: number; created_at: string; handle: string; size: string | null; name: string; phone: string; notified_at: string | null };

export type DiscountCode = {
  code: string;
  kind: "yuzde" | "tutar";
  value: number;
  min_total: number;
  active: boolean;
  expires_at: string | null;
  usage_limit: number | null;
  used_count: number;
};

/** Discount for a subtotal, or the reason the code does not apply. */
export function evaluateDiscount(code: DiscountCode | undefined, subtotal: number): { amount: number } | { error: string } {
  if (!code || !code.active) return { error: "Bu indirim kodu geçerli değil." };
  if (code.expires_at && new Date(code.expires_at) < new Date()) return { error: "Bu indirim kodunun süresi dolmuş." };
  if (code.usage_limit !== null && code.used_count >= code.usage_limit) return { error: "Bu indirim kodunun kullanım hakkı dolmuş." };
  if (subtotal < code.min_total) return { error: `Bu kod ${code.min_total} TL ve üzeri siparişlerde geçerli.` };
  const amount = code.kind === "yuzde" ? Math.round((subtotal * Math.min(code.value, 90)) / 100) : Math.min(code.value, subtotal);
  return { amount };
}

/** Turkish mobile numbers → 905XXXXXXXXX (also accepts 05…, 5…, +90…). */
export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  const local = digits.replace(/^90/, "").replace(/^0/, "");
  return /^5\d{9}$/.test(local) ? `90${local}` : null;
}

export const formatPhone = (phone: string) => phone.replace(/^90(\d{3})(\d{3})(\d{2})(\d{2})$/, "0$1 $2 $3 $4");
