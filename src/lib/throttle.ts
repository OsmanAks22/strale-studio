/**
 * Small per-instance rate limit for public forms (orders, back-in-stock). Serverless instances do not share
 * memory, so this only slows down bursts; the honeypot field in the forms catches simple bots.
 */
const hits = new Map<string, number[]>();

export function throttled(request: Request, bucket: string, limit: number, windowMs: number) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > limit;
}
