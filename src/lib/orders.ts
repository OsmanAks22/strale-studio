import { randomInt } from "node:crypto";
import { formatPrice } from "@/components/sites/strale/catalog";
import { shippingFor, siteConfig } from "@/components/sites/strale/site-config";
import {
  dbConfigured,
  evaluateDiscount,
  normalizePhone,
  PAYMENT_METHODS,
  query,
  type Customer,
  type DiscountCode,
  type OrderItem,
  type PaymentMethod,
} from "@/lib/db";
import { available, currentProducts } from "@/lib/stock";

export type CheckoutLine = { handle: string; size: string; qty: number };
export type CheckoutInput = {
  lines: CheckoutLine[];
  customer: Customer;
  paymentMethod: PaymentMethod;
  discountCode?: string;
};

export type Quote = {
  items: OrderItem[];
  subtotal: number;
  discount: number;
  discountCode: string | null;
  discountError?: string;
  shipping: number;
  codFee: number;
  total: number;
  /** Lines that cannot be ordered as asked (gone, size sold out, fewer pieces left). */
  problems: { handle: string; size: string; message: string; left: number }[];
};

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const newOrderCode = () => `ST-${Array.from({ length: 6 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("")}`;

export const cardPaymentEnabled = () => false;

export function enabledPaymentMethods(): PaymentMethod[] {
  return [
    // Bank transfer needs an IBAN to show the customer.
    ...(siteConfig.payment.transfer && siteConfig.bank.iban ? (["havale"] as const) : []),
    ...(siteConfig.payment.cod ? (["kapida"] as const) : []),
    ...(cardPaymentEnabled() ? (["kart"] as const) : []),
  ];
}

export async function findDiscount(code: string) {
  if (!dbConfigured() || !code.trim()) return undefined;
  const rows = await query<DiscountCode>("select * from discount_codes where code = $1", [code.trim().toLocaleUpperCase("tr-TR")]);
  return rows[0];
}

/** Prices and stock always come from the server's catalogue, never from the browser. */
export async function quote(lines: CheckoutLine[], paymentMethod: PaymentMethod | undefined, discountCode?: string): Promise<Quote> {
  const { products } = await currentProducts();
  const items: OrderItem[] = [];
  const problems: Quote["problems"] = [];
  const wanted = new Map<string, number>();
  for (const line of lines) {
    const product = products.find((p) => p.handle === line.handle && !p.draft);
    const qty = Math.max(1, Math.min(10, Math.floor(line.qty)));
    if (!product) {
      problems.push({ handle: line.handle, size: line.size, message: "Bu ürün artık satışta değil.", left: 0 });
      continue;
    }
    const key = `${line.handle}|${line.size}`;
    const total = (wanted.get(key) ?? 0) + qty;
    wanted.set(key, total);
    const left = available(product, line.size);
    if (left < total) {
      problems.push({
        handle: line.handle,
        size: line.size,
        message: left === 0 ? `${line.size} beden tükendi.` : `${line.size} bedenden sadece ${left} adet kaldı.`,
        left,
      });
      continue;
    }
    items.push({ handle: product.handle, name: product.name, color: product.color, size: line.size, price: product.price, qty });
  }
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  let discount = 0;
  let appliedCode: string | null = null;
  let discountError: string | undefined;
  if (discountCode?.trim()) {
    const result = evaluateDiscount(await findDiscount(discountCode), subtotal);
    if ("amount" in result) {
      discount = result.amount;
      appliedCode = discountCode.trim().toLocaleUpperCase("tr-TR");
    } else discountError = result.error;
  }
  const shipping = shippingFor(subtotal - discount);
  const codFee = paymentMethod === "kapida" ? siteConfig.payment.codFee : 0;
  return { items, subtotal, discount, discountCode: appliedCode, discountError, shipping, codFee, total: subtotal - discount + shipping + codFee, problems };
}

export function validateCustomer(input: Partial<Customer>): { customer: Customer } | { error: string } {
  const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");
  const phone = normalizePhone(text(input.phone, 30));
  const customer: Customer = {
    name: text(input.name, 80),
    phone: phone ?? "",
    email: text(input.email, 120) || undefined,
    city: text(input.city, 40),
    district: text(input.district, 60),
    address: text(input.address, 400),
    note: text(input.note, 400) || undefined,
  };
  if (customer.name.split(/\s+/).length < 2) return { error: "Ad ve soyadınızı yazın." };
  if (!phone) return { error: "Geçerli bir cep telefonu yazın (05XX XXX XX XX)." };
  if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) return { error: "E-posta adresi hatalı." };
  if (!customer.city || !customer.district) return { error: "İl ve ilçe seçin." };
  if (customer.address.length < 10) return { error: "Açık adresinizi yazın (mahalle, sokak, no)." };
  return { customer };
}

export function orderMessage(order: { code: string; items: OrderItem[]; total: number; shipping: number; discount: number; cod_fee: number; payment_method: PaymentMethod; customer: Customer }) {
  const lines = order.items.map((item) => `• ${item.name}${item.color ? ` (${item.color})` : ""} — ${item.size} × ${item.qty} = ${formatPrice(item.price * item.qty)}`);
  return [
    `Merhaba, siparişim: ${order.code}`,
    ...lines,
    order.discount ? `İndirim: −${formatPrice(order.discount)}` : "",
    `Kargo: ${order.shipping ? formatPrice(order.shipping) : "Ücretsiz"}`,
    order.cod_fee ? `Kapıda ödeme ücreti: ${formatPrice(order.cod_fee)}` : "",
    `Toplam: ${formatPrice(order.total)}`,
    `Ödeme: ${PAYMENT_METHODS[order.payment_method]}`,
    "",
    `${order.customer.name} · ${order.customer.phone.replace(/^90/, "0")}`,
    `${order.customer.address}, ${order.customer.district} / ${order.customer.city}`,
    order.customer.note ? `Not: ${order.customer.note}` : "",
  ]
    .filter((line, index, all) => line !== "" || all[index - 1] !== "")
    .join("\n");
}
