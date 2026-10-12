import type { NextRequest } from "next/server";
import { dbConfigured, query, type Order } from "@/lib/db";
import { throttled } from "@/lib/throttle";

/** Order status for the customer: needs the order code and the phone's last 4 digits; never returns the address. */
export async function GET(request: NextRequest) {
  if (throttled(request, "track", 20, 10 * 60 * 1000)) return Response.json({ error: "Çok fazla deneme." }, { status: 429 });
  if (!dbConfigured()) return Response.json({ error: "Sipariş takibi henüz aktif değil." }, { status: 503 });
  const code = (request.nextUrl.searchParams.get("kod") ?? "").trim().toUpperCase();
  const last4 = (request.nextUrl.searchParams.get("tel") ?? "").replace(/\D/g, "").slice(-4);
  if (!/^ST-[A-Z0-9]{6}$/.test(code) || last4.length !== 4) {
    return Response.json({ error: "Sipariş kodunu (ST-XXXXXX) ve telefonunuzun son 4 hanesini yazın." }, { status: 400 });
  }
  const [order] = await query<Order>("select * from orders where code = $1", [code]);
  if (!order || !order.customer.phone.endsWith(last4)) {
    return Response.json({ error: "Bu bilgilerle sipariş bulunamadı." }, { status: 404 });
  }
  return Response.json({
    code: order.code,
    createdAt: order.created_at,
    status: order.status,
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status,
    items: order.items,
    total: order.total,
    carrier: order.carrier,
    tracking: order.tracking,
  });
}
