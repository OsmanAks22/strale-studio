"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { formatPrice, productTitle } from "@/components/sites/strale/catalog";
import { siteConfig } from "@/components/sites/strale/site-config";
import type { DiscountCode, StockAlert } from "@/lib/order-types";
import { api, ApiError } from "./api";
import { useAdmin } from "./admin-state";

function NoDb({ message }: { message: string }) {
  return <p className="bg-white p-4">{message}</p>;
}

const phoneText = (phone: string) => phone.replace(/^90(\d{3})(\d{3})(\d{2})(\d{2})$/, "0$1 $2 $3 $4");
const siteUrl = () => (siteConfig.domain ? `https://${siteConfig.domain}` : window.location.origin);

/* ---------------------------------------------------------- Gelince haber ver */

export function AlertsTab() {
  const { products } = useAdmin();
  const [alerts, setAlerts] = useState<StockAlert[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDone, setShowDone] = useState(false);

  const load = useCallback(async () => {
    try {
      setAlerts((await api<{ alerts: StockAlert[] }>("bildirimler")).alerts);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);
  useEffect(() => {
    // Fetch on mount (and the timer below for orders).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const groups = useMemo(() => {
    const map = new Map<string, StockAlert[]>();
    for (const alert of alerts ?? []) {
      if (!showDone && alert.notified_at) continue;
      const key = `${alert.handle}|${alert.size ?? ""}`;
      map.set(key, [...(map.get(key) ?? []), alert]);
    }
    return [...map.entries()].map(([key, list]) => {
      const [handle, size] = key.split("|");
      const product = products.find((p) => p.handle === handle);
      const inStock = product ? (product.sizeStock && size ? (product.sizeStock[size] ?? 0) : product.stock) : 0;
      return { key, handle, size, product, inStock, list };
    }).sort((a, b) => Number(b.inStock > 0) - Number(a.inStock > 0) || b.list.length - a.list.length);
  }, [alerts, products, showDone]);

  if (error) return <NoDb message={error} />;
  if (!alerts) return <p className="text-graphite">Yükleniyor…</p>;

  const mark = async (ids: number[], notified: boolean) => {
    await api("bildirimler", { method: "PATCH", body: { ids, notified } });
    setAlerts((list) => list?.map((a) => (ids.includes(a.id) ? { ...a, notified_at: notified ? new Date().toISOString() : null } : a)) ?? null);
  };
  const remove = async (ids: number[]) => {
    await api("bildirimler", { method: "DELETE", body: { ids } });
    setAlerts((list) => list?.filter((a) => !ids.includes(a.id)) ?? null);
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-graphite">
        Tükenen ürün için haber bekleyen müşteriler. Ürün stoğa girince <strong>Stokta</strong> etiketi çıkar; “Mesaj gönder” WhatsApp’ı hazır mesajla açar ve kaydı
        “haber verildi” yapar.
      </p>
      <label className="flex items-center gap-2 text-[12px]">
        <input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} className="size-4 accent-ink" />
        Haber verilenleri de göster
      </label>
      {groups.length === 0 ? <p className="bg-white px-3 py-6 text-center text-graphite">Bekleyen istek yok.</p> : null}
      {groups.map((group) => {
        const title = group.product ? productTitle(group.product) : group.handle;
        const url = `${siteUrl()}/urun/${group.handle}`;
        return (
          <section key={group.key} className="bg-white p-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium">
                {title} {group.size ? <span className="text-graphite">· {group.size}</span> : null}
              </p>
              <span className={cn("px-2 py-0.5 text-[11px]", group.inStock > 0 ? "bg-ink text-bone" : "bg-sand text-graphite")}>
                {group.inStock > 0 ? `Stokta (${group.inStock})` : "Hâlâ tükendi"}
              </span>
              <span className="text-[12px] text-graphite">{group.list.length} kişi bekliyor</span>
            </div>
            <ul className="mt-2 flex flex-col">
              {group.list.map((alert) => {
                const message = `Merhaba ${alert.name.split(" ")[0]}, beklediğiniz ${title}${group.size ? ` (${group.size} beden)` : ""} stoğa girdi! Stoklar sınırlı: ${url}`;
                return (
                  <li key={alert.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-sand py-2">
                    <span className="min-w-0 flex-1">
                      {alert.name} · {phoneText(alert.phone)}
                      <span className="ml-2 text-[11px] text-graphite">{new Date(alert.created_at).toLocaleDateString("tr-TR")}</span>
                      {alert.notified_at ? <span className="ml-2 text-[11px] text-graphite">✓ haber verildi</span> : null}
                    </span>
                    <a
                      href={`https://wa.me/${alert.phone}?text=${encodeURIComponent(message)}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => void mark([alert.id], true)}
                      className="border border-sand px-3 py-1 text-[12px] hover:border-ink"
                    >
                      Mesaj gönder ↗
                    </a>
                    {alert.notified_at ? (
                      <button type="button" onClick={() => void mark([alert.id], false)} className="cursor-pointer text-[12px] underline">
                        Geri al
                      </button>
                    ) : null}
                    <button type="button" onClick={() => void remove([alert.id])} className="cursor-pointer text-[12px] text-graphite underline hover:text-rust">
                      Sil
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------- İndirim kodları */

const emptyCode: DiscountCode = { code: "", kind: "yuzde", value: 10, min_total: 0, active: true, expires_at: null, usage_limit: null, used_count: 0 };

export function CodesTab() {
  const [codes, setCodes] = useState<DiscountCode[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<DiscountCode>(emptyCode);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setCodes((await api<{ codes: DiscountCode[] }>("kodlar")).codes);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);
  useEffect(() => {
    // Fetch on mount (and the timer below for orders).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  if (error) return <NoDb message={error} />;
  if (!codes) return <p className="text-graphite">Yükleniyor…</p>;

  const save = async (code: DiscountCode) => {
    setFormError(null);
    try {
      const { code: saved } = await api<{ code: DiscountCode }>("kodlar", { body: code });
      setCodes((list) => [saved, ...(list ?? []).filter((c) => c.code !== saved.code)]);
      return true;
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : String(err));
      return false;
    }
  };

  const describe = (c: DiscountCode) =>
    [
      c.kind === "yuzde" ? `%${c.value}` : formatPrice(c.value),
      c.min_total ? `${formatPrice(c.min_total)} üzeri` : "",
      c.expires_at ? `son gün ${new Date(c.expires_at).toLocaleDateString("tr-TR")}` : "",
      c.usage_limit ? `${c.used_count}/${c.usage_limit} kullanıldı` : `${c.used_count} kez kullanıldı`,
    ]
      .filter(Boolean)
      .join(" · ");

  return (
    <div className="flex flex-col gap-4">
      <form
        className="grid gap-3 bg-white p-4 tab:grid-cols-3 desk:grid-cols-6"
        onSubmit={async (event) => {
          event.preventDefault();
          if (await save(form)) setForm(emptyCode);
        }}
      >
        <label className="tab:col-span-1">
          <span className="st-micro text-[10px] text-graphite">Kod</span>
          <input
            required
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toLocaleUpperCase("tr-TR").replace(/\s/g, "") })}
            placeholder="SWEAT20"
            className="h-10 w-full border border-sand px-2 uppercase"
          />
        </label>
        <label>
          <span className="st-micro text-[10px] text-graphite">Tür</span>
          <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as DiscountCode["kind"] })} className="h-10 w-full border border-sand bg-white px-2">
            <option value="yuzde">Yüzde (%)</option>
            <option value="tutar">Tutar (₺)</option>
          </select>
        </label>
        <label>
          <span className="st-micro text-[10px] text-graphite">{form.kind === "yuzde" ? "İndirim %" : "İndirim ₺"}</span>
          <input required type="number" min={1} max={form.kind === "yuzde" ? 90 : undefined} value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} className="h-10 w-full border border-sand px-2" />
        </label>
        <label>
          <span className="st-micro text-[10px] text-graphite">En az sepet ₺</span>
          <input type="number" min={0} value={form.min_total} onChange={(e) => setForm({ ...form, min_total: Number(e.target.value) })} className="h-10 w-full border border-sand px-2" />
        </label>
        <label>
          <span className="st-micro text-[10px] text-graphite">Son gün</span>
          <input
            type="date"
            value={form.expires_at ? form.expires_at.slice(0, 10) : ""}
            onChange={(e) => setForm({ ...form, expires_at: e.target.value ? `${e.target.value}T23:59:59+03:00` : null })}
            className="h-10 w-full border border-sand px-2"
          />
        </label>
        <label>
          <span className="st-micro text-[10px] text-graphite">Kullanım sınırı</span>
          <input
            type="number"
            min={1}
            placeholder="Sınırsız"
            value={form.usage_limit ?? ""}
            onChange={(e) => setForm({ ...form, usage_limit: e.target.value ? Number(e.target.value) : null })}
            className="h-10 w-full border border-sand px-2"
          />
        </label>
        <div className="flex items-center gap-3 tab:col-span-3 desk:col-span-6">
          <button type="submit" className="st-label h-10 cursor-pointer bg-ink px-5 text-bone hover:bg-smoke">
            Kodu kaydet
          </button>
          {formError ? <span className="text-rust">{formError}</span> : null}
          <span className="text-[12px] text-graphite">Aynı kodu tekrar kaydederseniz güncellenir. Duyuru çubuğuna yazmak için “Mağaza Ayarları”.</span>
        </div>
      </form>

      <ul className="flex flex-col gap-2">
        {codes.map((c) => {
          const expired = Boolean(c.expires_at && new Date(c.expires_at) < new Date());
          return (
            <li key={c.code} className="flex flex-wrap items-center gap-3 bg-white px-3 py-2.5">
              <span className={cn("font-medium tracking-[1px]", (!c.active || expired) && "text-graphite line-through")}>{c.code}</span>
              <span className="min-w-0 flex-1 text-graphite">{describe(c)}</span>
              {expired ? <span className="text-[11px] text-rust">süresi doldu</span> : null}
              <button type="button" onClick={() => void save({ ...c, active: !c.active })} className="cursor-pointer text-[12px] underline">
                {c.active ? "Durdur" : "Aç"}
              </button>
              <button type="button" onClick={() => setForm(c)} className="cursor-pointer text-[12px] underline">
                Düzenle
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!window.confirm(`${c.code} silinsin mi?`)) return;
                  await api("kodlar", { method: "DELETE", body: { code: c.code } });
                  setCodes((list) => list?.filter((x) => x.code !== c.code) ?? null);
                }}
                className="cursor-pointer text-[12px] text-graphite underline hover:text-rust"
              >
                Sil
              </button>
            </li>
          );
        })}
      </ul>
      {codes.length === 0 ? <p className="text-graphite">Henüz indirim kodu yok.</p> : null}
    </div>
  );
}
