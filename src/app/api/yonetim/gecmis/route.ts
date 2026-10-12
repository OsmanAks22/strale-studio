import { requireAdmin } from "@/lib/admin/auth";
import { errorResponse, getRepo } from "@/lib/admin/repo";

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    return Response.json({ history: await getRepo().history() });
  } catch (error) {
    return errorResponse(error);
  }
}
