import type { StoreSettings } from "@/components/sites/strale/site-config";
import { requireAdmin } from "@/lib/admin/auth";
import { errorResponse, getRepo, readSettings, serializeJson, SETTINGS_PATH } from "@/lib/admin/repo";

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    return Response.json(await readSettings(getRepo()));
  } catch (error) {
    return errorResponse(error);
  }
}

const text = (value: unknown, max = 300) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const num = (value: unknown) => (Number.isFinite(Number(value)) && Number(value) >= 0 ? Math.round(Number(value)) : 0);

/** Whitelists and cleans every field so the JSON the site imports always has the expected shape. */
function clean(input: Partial<StoreSettings>): StoreSettings {
  const iban = text(input.bank?.iban).replace(/\s+/g, "").toUpperCase();
  return {
    domain: text(input.domain).replace(/^https?:\/\//, "").replace(/\/.*$/, ""),
    whatsapp: text(input.whatsapp).replace(/\D/g, "").replace(/^0/, "90"),
    phone: text(input.phone),
    email: text(input.email),
    hours: text(input.hours),
    instagram: text(input.instagram).replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/.*$/, ""),
    company: {
      title: text(input.company?.title),
      address: text(input.company?.address, 500),
      taxOffice: text(input.company?.taxOffice),
      taxNumber: text(input.company?.taxNumber),
      mersis: text(input.company?.mersis),
    },
    freeShippingThreshold: num(input.freeShippingThreshold),
    shippingFee: num(input.shippingFee),
    dispatchDays: text(input.dispatchDays) || "1–3",
    returnDays: Math.max(14, num(input.returnDays)),
    payment: {
      transfer: Boolean(input.payment?.transfer),
      cod: Boolean(input.payment?.cod),
      codFee: num(input.payment?.codFee),
    },
    bank: {
      name: text(input.bank?.name),
      accountHolder: text(input.bank?.accountHolder),
      iban: iban.replace(/(.{4})/g, "$1 ").trim(),
    },
    announcement: {
      enabled: Boolean(input.announcement?.enabled),
      text: text(input.announcement?.text, 140),
      linkText: text(input.announcement?.linkText, 40),
      linkHref: text(input.announcement?.linkHref).startsWith("/") ? text(input.announcement?.linkHref) : "",
    },
    etbisUrl: /^https:\/\//.test(text(input.etbisUrl)) ? text(input.etbisUrl) : "",
  };
}

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    const body = (await request.json()) as { settings?: Partial<StoreSettings>; baseVersion?: string; force?: boolean };
    if (!body.settings || typeof body.baseVersion !== "string") return Response.json({ error: "Eksik veri." }, { status: 400 });
    const settings = clean(body.settings);
    if (!settings.payment.transfer && !settings.payment.cod && !process.env.PAYMENT_PROVIDER) {
      return Response.json({ error: "En az bir ödeme yöntemi açık olmalı." }, { status: 400 });
    }
    if (settings.payment.transfer && !settings.bank.iban) {
      return Response.json({ error: "Havale açıkken IBAN boş olamaz." }, { status: 400 });
    }
    const result = await getRepo().commit({
      files: [{ path: SETTINGS_PATH, content: serializeJson(settings), baseVersion: body.baseVersion }],
      force: body.force,
      message: "Panel: mağaza ayarları güncellendi",
    });
    return Response.json({ settings, version: result.versions[SETTINGS_PATH], commit: result.commit, url: result.url });
  } catch (error) {
    return errorResponse(error);
  }
}
