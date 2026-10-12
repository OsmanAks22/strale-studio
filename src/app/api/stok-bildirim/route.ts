import { dbConfigured, normalizePhone, query } from "@/lib/db";
import { throttled } from "@/lib/throttle";

/** "Gelince haber ver": stores a name + phone for a sold-out product/size. */
export async function POST(request: Request) {
  if (throttled(request, "alert", 8, 10 * 60 * 1000)) return Response.json({ error: "Çok fazla deneme." }, { status: 429 });
  if (!dbConfigured()) return Response.json({ error: "Bu özellik henüz aktif değil; WhatsApp'tan yazabilirsiniz." }, { status: 503 });
  const body = (await request.json().catch(() => ({}))) as { handle?: string; size?: string; name?: string; phone?: string; consent?: boolean; website?: string };
  if (body.website) return Response.json({ ok: true });
  const phone = normalizePhone(body.phone ?? "");
  const name = (body.name ?? "").trim().slice(0, 80);
  if (!body.consent) return Response.json({ error: "Bilgilendirme onayını işaretleyin." }, { status: 400 });
  if (!name || !phone) return Response.json({ error: "Adınızı ve geçerli bir cep telefonu yazın." }, { status: 400 });
  if (!/^[a-z0-9-]+$/.test(body.handle ?? "")) return Response.json({ error: "Ürün bulunamadı." }, { status: 400 });
  const size = (body.size ?? "").trim().slice(0, 12) || null;
  const existing = await query("select id from stock_alerts where handle = $1 and phone = $2 and coalesce(size, '') = coalesce($3, '') and notified_at is null", [body.handle, phone, size]);
  if (!existing.length) {
    await query("insert into stock_alerts (handle, size, name, phone) values ($1, $2, $3, $4)", [body.handle, size, name, phone]);
  }
  return Response.json({ ok: true });
}
