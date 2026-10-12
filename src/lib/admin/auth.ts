import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Admin panel session: one shared password (ADMIN_PASSWORD) → an HMAC-signed, httpOnly cookie.
 * Changing the password (or ADMIN_SESSION_SECRET) logs everyone out.
 */

export const SESSION_COOKIE = "strale_admin";
const SESSION_DAYS = 7;

export const adminPassword = () => process.env.ADMIN_PASSWORD ?? "";

function secret() {
  return process.env.ADMIN_SESSION_SECRET || createHash("sha256").update(`strale-admin:${adminPassword()}`).digest("hex");
}

const sign = (value: string) => createHmac("sha256", secret()).update(value).digest("hex");

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function passwordMatches(input: string) {
  const expected = adminPassword();
  if (!expected) return false;
  const hash = (value: string) => createHash("sha256").update(value).digest("hex");
  return safeEqual(hash(input), hash(expected));
}

export function createSessionValue() {
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  return `${expires}.${sign(String(expires))}`;
}

export function sessionValid(value: string | undefined) {
  if (!value || !adminPassword()) return false;
  const [expires, signature] = value.split(".");
  if (!expires || !signature || Number(expires) < Date.now()) return false;
  return safeEqual(signature, sign(expires));
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: SESSION_DAYS * 24 * 60 * 60,
};

export async function isAdmin() {
  return sessionValid((await cookies()).get(SESSION_COOKIE)?.value);
}

/**
 * Guard for mutating/reading API routes: valid session cookie plus a custom header, which a cross-site
 * form or image request cannot send (CSRF).
 */
export async function requireAdmin(request: Request) {
  if (request.headers.get("x-strale-admin") !== "1" || !(await isAdmin())) {
    return Response.json({ error: "Oturum gerekli. Lütfen tekrar giriş yapın." }, { status: 401 });
  }
  return null;
}
