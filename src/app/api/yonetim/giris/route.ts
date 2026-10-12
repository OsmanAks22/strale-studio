import { cookies } from "next/headers";
import { adminPassword, createSessionValue, passwordMatches, SESSION_COOKIE, sessionCookieOptions } from "@/lib/admin/auth";

export async function POST(request: Request) {
  if (!adminPassword()) {
    return Response.json({ error: "ADMIN_PASSWORD tanımlı değil (bkz. docs/yonetim-paneli.md)." }, { status: 503 });
  }
  const { password } = (await request.json().catch(() => ({}))) as { password?: string };
  if (!password || !passwordMatches(password)) {
    // Slow down guessing.
    await new Promise((resolve) => setTimeout(resolve, 800));
    return Response.json({ error: "Şifre hatalı." }, { status: 401 });
  }
  (await cookies()).set(SESSION_COOKIE, createSessionValue(), sessionCookieOptions);
  return Response.json({ ok: true });
}
