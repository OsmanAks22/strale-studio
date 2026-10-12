import { requireAdmin } from "@/lib/admin/auth";
import { errorResponse, tryGetRepo } from "@/lib/admin/repo";
import { storageConfigured, uploadImage } from "@/lib/storage";

/** Max decoded size per photo (the browser sends 1200×1500 JPEGs, well under this). */
const MAX_BYTES = 3 * 1024 * 1024;

/**
 * One JPEG (base64). With Supabase Storage it is uploaded straight away and its public URL returned; otherwise it
 * is staged in the repo and published with the next catalogue save (returns a ref).
 */
export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    const { data, name, kind } = (await request.json()) as { data?: string; name?: string; kind?: "urun" | "orijinal" };
    const bytes = data ? Buffer.from(data, "base64") : null;
    if (!bytes || bytes.length === 0) return Response.json({ error: "Dosya boş." }, { status: 400 });
    if (bytes.length > MAX_BYTES) return Response.json({ error: "Fotoğraf 3 MB'tan büyük." }, { status: 413 });
    if (!(bytes[0] === 0xff && bytes[1] === 0xd8)) return Response.json({ error: "Sadece JPEG kabul edilir." }, { status: 400 });
    if (storageConfigured()) {
      if (!name || !/^[a-z0-9][a-z0-9-]*$/.test(name)) return Response.json({ error: "Geçersiz dosya adı." }, { status: 400 });
      const folder = kind === "orijinal" ? "orijinal" : "urun";
      return Response.json({ url: await uploadImage(`${folder}/${name}.jpg`, bytes) });
    }
    const repo = tryGetRepo();
    if (!repo) {
      return Response.json(
        { error: "Fotoğraf yüklemek için Supabase Storage ayarlı olmalı (bkz. docs/siparis-sistemi.md)." },
        { status: 503 },
      );
    }
    return Response.json({ ref: await repo.stageFile(data!) });
  } catch (error) {
    return errorResponse(error);
  }
}
