import { requireAdmin } from "@/lib/admin/auth";
import { catalogHistory } from "@/lib/admin/catalog-store";
import { errorResponse } from "@/lib/admin/repo";

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    return Response.json({ history: await catalogHistory() });
  } catch (error) {
    return errorResponse(error);
  }
}
