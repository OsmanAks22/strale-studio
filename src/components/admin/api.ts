/** fetch wrapper for /api/yonetim/*: adds the CSRF header and turns error bodies into thrown errors. */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details: { errors?: string[]; conflict?: boolean } = {},
  ) {
    super(message);
  }
}

export async function api<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const response = await fetch(`/api/yonetim/${path}`, {
    method: init.method ?? (init.body === undefined ? "GET" : "POST"),
    headers: { "x-strale-admin": "1", ...(init.body === undefined ? {} : { "Content-Type": "application/json" }) },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
  });
  const data = (await response.json().catch(() => ({}))) as T & { error?: string; errors?: string[]; conflict?: boolean };
  if (!response.ok) {
    throw new ApiError(data.error ?? `Hata ${response.status}`, response.status, { errors: data.errors, conflict: data.conflict });
  }
  return data;
}
