import type { NextRequest } from "next/server";
import { requireAdminDb } from "@/lib/admin/db-guard";
import { errorResponse } from "@/lib/admin/repo";
import { query, type StockAlert } from "@/lib/db";

export async function GET(request: NextRequest) {
  const denied = await requireAdminDb(request);
  if (denied) return denied;
  try {
    return Response.json({ alerts: await query<StockAlert>("select * from stock_alerts order by created_at desc limit 1000") });
  } catch (error) {
    return errorResponse(error);
  }
}

/** Mark as messaged (or undo). */
export async function PATCH(request: NextRequest) {
  const denied = await requireAdminDb(request);
  if (denied) return denied;
  try {
    const { ids, notified } = (await request.json()) as { ids?: number[]; notified?: boolean };
    if (!Array.isArray(ids) || !ids.length) return Response.json({ error: "Kayıt seçin." }, { status: 400 });
    await query(`update stock_alerts set notified_at = ${notified ? "now()" : "null"} where id = any($1::int[])`, [ids]);
    return Response.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest) {
  const denied = await requireAdminDb(request);
  if (denied) return denied;
  try {
    const { ids } = (await request.json()) as { ids?: number[] };
    if (!Array.isArray(ids) || !ids.length) return Response.json({ error: "Kayıt seçin." }, { status: 400 });
    await query("delete from stock_alerts where id = any($1::int[])", [ids]);
    return Response.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
