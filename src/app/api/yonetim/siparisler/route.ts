import type { NextRequest } from "next/server";
import { requireAdminDb } from "@/lib/admin/db-guard";
import { errorResponse } from "@/lib/admin/repo";
import { ORDER_STATUSES, PAYMENT_STATUSES, query, RELEASED_STATUSES, type Order, type OrderStatus } from "@/lib/db";
import { applyStock } from "@/lib/stock";
import { storeChanged } from "@/lib/store-data";

export async function GET(request: NextRequest) {
  const denied = await requireAdminDb(request);
  if (denied) return denied;
  try {
    const orders = await query<Order>("select * from orders order by created_at desc limit 500");
    return Response.json({ orders });
  } catch (error) {
    return errorResponse(error);
  }
}

type Patch = {
  code?: string;
  status?: OrderStatus;
  payment_status?: keyof typeof PAYMENT_STATUSES;
  carrier?: string;
  tracking?: string;
  admin_note?: string;
};

/** Updates an order; cancelling/returning puts the pieces back in stock, re-opening takes them out again. */
export async function PATCH(request: NextRequest) {
  const denied = await requireAdminDb(request);
  if (denied) return denied;
  try {
    const patch = (await request.json()) as Patch;
    const [order] = await query<Order>("select * from orders where code = $1", [patch.code]);
    if (!order) return Response.json({ error: "Sipariş bulunamadı." }, { status: 404 });
    if (patch.status && !ORDER_STATUSES.some((s) => s.value === patch.status)) return Response.json({ error: "Geçersiz durum." }, { status: 400 });
    if (patch.payment_status && !(patch.payment_status in PAYMENT_STATUSES)) return Response.json({ error: "Geçersiz ödeme durumu." }, { status: 400 });

    let stockApplied = order.stock_applied;
    let stockNote: string | undefined;
    const lines = order.items.map((i) => ({ handle: i.handle, size: i.size, qty: i.qty }));
    const releasing = patch.status && RELEASED_STATUSES.includes(patch.status);
    if (releasing && order.stock_applied) {
      const result = await applyStock(lines, 1, `${order.code} ${patch.status === "iptal" ? "iptal" : "iade"}, stok geri eklendi`);
      if (result.ok) {
        stockApplied = false;
        storeChanged();
      } else stockNote = "Stok geri eklenemedi; ürün stoğunu panelden elle düzeltin.";
    } else if (patch.status && !releasing && !order.stock_applied) {
      const result = await applyStock(lines, -1, `${order.code} yeniden açıldı`);
      if (result.ok) {
        stockApplied = true;
        storeChanged();
      } else if (result.error === "short") return Response.json({ error: "Bu siparişi açmak için yeterli stok yok." }, { status: 409 });
      else stockNote = "Stok düşülemedi; ürün stoğunu panelden elle düzeltin.";
    }

    const text = (value: string | undefined, max: number) => (value === undefined ? undefined : value.trim().slice(0, max) || null);
    const [updated] = await query<Order>(
      `update orders set
         status = coalesce($2, status),
         payment_status = coalesce($3, payment_status),
         carrier = case when $4::boolean then $5 else carrier end,
         tracking = case when $6::boolean then $7 else tracking end,
         admin_note = case when $8::boolean then $9 else admin_note end,
         stock_applied = $10,
         updated_at = now()
       where code = $1 returning *`,
      [
        order.code,
        patch.status ?? null,
        patch.payment_status ?? null,
        patch.carrier !== undefined,
        text(patch.carrier, 40) ?? null,
        patch.tracking !== undefined,
        text(patch.tracking, 60) ?? null,
        patch.admin_note !== undefined,
        text(patch.admin_note, 1000) ?? null,
        stockApplied,
      ],
    );
    return Response.json({ order: updated, stockNote });
  } catch (error) {
    return errorResponse(error);
  }
}
