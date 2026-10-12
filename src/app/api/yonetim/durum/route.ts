import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { errorResponse, getRepo } from "@/lib/admin/repo";

/** Vercel deploy state for a saved commit (from the commit status Vercel posts to GitHub). */
export async function GET(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const sha = request.nextUrl.searchParams.get("sha") ?? "";
  if (!/^[a-f0-9]{40}$/.test(sha)) return Response.json({ error: "Geçersiz commit." }, { status: 400 });
  try {
    return Response.json(await getRepo().status(sha));
  } catch (error) {
    return errorResponse(error);
  }
}
