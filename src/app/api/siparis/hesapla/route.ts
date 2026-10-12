import { enabledPaymentMethods, quote, type CheckoutLine } from "@/lib/orders";
import { getSettings } from "@/lib/store-data";
import type { PaymentMethod } from "@/lib/db";

/** Live basket totals for the checkout page: current prices, stock problems, discount code result. */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { lines?: CheckoutLine[]; paymentMethod?: PaymentMethod; discountCode?: string };
    const lines = Array.isArray(body.lines) ? body.lines.slice(0, 30) : [];
    return Response.json({ ...(await quote(lines, body.paymentMethod, body.discountCode)), methods: enabledPaymentMethods(await getSettings()) });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Sepet hesaplanamadı." }, { status: 500 });
  }
}
