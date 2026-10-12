import { productImages } from "@/components/sites/strale/product-rules";
import { dbReadCatalog } from "@/lib/catalog-db";
import { dbConfigured, query } from "@/lib/db";
import { deleteImages, listImages, storageConfigured, storagePathOf } from "@/lib/storage";
import { throttled } from "@/lib/throttle";

/** Photos uploaded but never saved to a product are only removed after this long (an edit may be in progress). */
const ORPHAN_AGE_MS = 3 * 24 * 60 * 60 * 1000;

/**
 * Daily housekeeping (vercel.json → crons):
 * - a database query, which keeps a free Supabase project from pausing after 7 quiet days
 * - deletes back-in-stock requests 6 months after the customer was messaged (as the KVKK text promises)
 *   and unanswered ones after a year
 * - deletes Storage photos no product uses any more
 * Vercel sends `Authorization: Bearer $CRON_SECRET` when CRON_SECRET is set; without it the job is harmless to run.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }
  if (!secret && throttled(request, "cron", 3, 60 * 60 * 1000)) return Response.json({ error: "Çok sık" }, { status: 429 });
  if (!dbConfigured()) return Response.json({ ok: true, skipped: "Veritabanı bağlı değil" });

  try {
    const alerts = await query<{ id: number }>(
      `delete from stock_alerts
       where (notified_at is not null and notified_at < now() - interval '180 days')
          or (notified_at is null and created_at < now() - interval '365 days')
       returning id`,
    );

    let photos = 0;
    if (storageConfigured()) {
      const { products } = await dbReadCatalog();
      const used = new Set(products.flatMap(productImages).map(storagePathOf).filter((p): p is string => Boolean(p)));
      const cutoff = Date.now() - ORPHAN_AGE_MS;
      const files = [...(await listImages("urun")), ...(await listImages("orijinal"))];
      const orphans = files
        .filter((file) => new Date(file.created_at).getTime() < cutoff)
        .filter((file) => !used.has(file.name.replace(/^orijinal\//, "urun/")))
        .map((file) => file.name);
      for (let i = 0; i < orphans.length; i += 100) await deleteImages(orphans.slice(i, i + 100));
      photos = orphans.length;
    }

    return Response.json({ ok: true, deletedAlerts: alerts.length, deletedPhotos: photos });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Günlük bakım tamamlanamadı" }, { status: 500 });
  }
}
