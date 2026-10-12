import { requireAdmin } from "@/lib/admin/auth";
import { dbConfigured } from "@/lib/db";

/** Admin session + a configured database, or the response explaining what is missing. */
export async function requireAdminDb(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  if (!dbConfigured()) {
    return Response.json(
      { error: "Veritabanı bağlı değil. Vercel → Storage → Neon Postgres ekleyin (bkz. docs/siparis-sistemi.md).", noDb: true },
      { status: 503 },
    );
  }
  return null;
}
