import { requireAdmin } from "@/lib/admin/auth";
import { errorResponse, getRepo } from "@/lib/admin/repo";

/** Max decoded size per photo (the browser sends 1200×1500 JPEGs, well under this). */
const MAX_BYTES = 3 * 1024 * 1024;

/** Stages one JPEG (base64) and returns a ref; nothing is published until the catalogue is saved. */
export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    const { data } = (await request.json()) as { data?: string };
    const bytes = data ? Buffer.from(data, "base64") : null;
    if (!bytes || bytes.length === 0) return Response.json({ error: "Dosya boş." }, { status: 400 });
    if (bytes.length > MAX_BYTES) return Response.json({ error: "Fotoğraf 3 MB'tan büyük." }, { status: 413 });
    if (!(bytes[0] === 0xff && bytes[1] === 0xd8)) return Response.json({ error: "Sadece JPEG kabul edilir." }, { status: 400 });
    return Response.json({ ref: await getRepo().stageFile(data!) });
  } catch (error) {
    return errorResponse(error);
  }
}
