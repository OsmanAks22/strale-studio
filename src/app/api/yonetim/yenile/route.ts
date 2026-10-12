import { requireAdmin } from "@/lib/admin/auth";
import { storeChanged } from "@/lib/store-data";

/** "Siteyi yenile": refreshes every page, e.g. after editing a table directly in Supabase. */
export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  storeChanged();
  return Response.json({ ok: true });
}
