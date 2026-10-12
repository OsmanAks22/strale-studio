import type { NextRequest } from "next/server";
import { requireAdminDb } from "@/lib/admin/db-guard";
import { errorResponse } from "@/lib/admin/repo";
import { query, type DiscountCode } from "@/lib/db";

export async function GET(request: NextRequest) {
  const denied = await requireAdminDb(request);
  if (denied) return denied;
  try {
    return Response.json({ codes: await query<DiscountCode>("select * from discount_codes order by created_at desc") });
  } catch (error) {
    return errorResponse(error);
  }
}

/** Create or update a code. */
export async function POST(request: NextRequest) {
  const denied = await requireAdminDb(request);
  if (denied) return denied;
  try {
    const input = (await request.json()) as Partial<DiscountCode>;
    const code = (input.code ?? "").trim().toLocaleUpperCase("tr-TR");
    if (!/^[A-Z0-9ÇĞİÖŞÜ_-]{3,24}$/.test(code)) return Response.json({ error: "Kod 3–24 karakter; harf, rakam, - veya _ olabilir." }, { status: 400 });
    if (input.kind !== "yuzde" && input.kind !== "tutar") return Response.json({ error: "İndirim türü seçin." }, { status: 400 });
    const value = Math.round(Number(input.value));
    if (!(value > 0) || (input.kind === "yuzde" && value > 90)) return Response.json({ error: "İndirim değeri geçersiz (yüzde en fazla 90)." }, { status: 400 });
    const [saved] = await query<DiscountCode>(
      `insert into discount_codes (code, kind, value, min_total, active, expires_at, usage_limit)
       values ($1, $2, $3, $4, $5, $6, $7)
       on conflict (code) do update set kind = $2, value = $3, min_total = $4, active = $5, expires_at = $6, usage_limit = $7
       returning *`,
      [
        code,
        input.kind,
        value,
        Math.max(0, Math.round(Number(input.min_total) || 0)),
        input.active !== false,
        input.expires_at || null,
        input.usage_limit ? Math.max(1, Math.round(Number(input.usage_limit))) : null,
      ],
    );
    return Response.json({ code: saved });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest) {
  const denied = await requireAdminDb(request);
  if (denied) return denied;
  try {
    const { code } = (await request.json()) as { code?: string };
    await query("delete from discount_codes where code = $1", [code]);
    return Response.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
