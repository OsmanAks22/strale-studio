"use client";

import { useEffect, useState } from "react";
import type { StoreSettings } from "@/components/sites/strale/site-config";
import { api, ApiError } from "./api";

const inputClass = "h-10 w-full border border-sand bg-white px-2.5 outline-none focus:border-ink";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="st-micro text-[10px] text-graphite">{label}</span>
      <span className="mt-1 block">{children}</span>
      {hint ? <span className="mt-1 block text-[11px] text-graphite">{hint}</span> : null}
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white p-4">
      <h3 className="st-label">{title}</h3>
      <div className="mt-3 grid gap-4 tab:grid-cols-2">{children}</div>
    </section>
  );
}

/** Store settings (contact, legal seller info, shipping, payment, announcement). Saved like products: one commit + rebuild. */
export function SettingsTab() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [saved, setSaved] = useState<string>("");
  const [version, setVersion] = useState("");
  const [status, setStatus] = useState<{ ok?: string; error?: string; conflict?: boolean } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api<{ settings: StoreSettings; version: string }>("ayarlar")
      .then((data) => {
        setSettings(data.settings);
        setSaved(JSON.stringify(data.settings));
        setVersion(data.version);
      })
      .catch((error: Error) => setStatus({ error: error.message }));
  }, []);

  if (!settings) return <p className="text-graphite">{status?.error ?? "Yükleniyor…"}</p>;

  const set = <K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) => setSettings({ ...settings, [key]: value });
  const dirty = JSON.stringify(settings) !== saved;

  const save = async (force = false) => {
    setSaving(true);
    setStatus(null);
    try {
      const result = await api<{ settings: StoreSettings; version: string }>("ayarlar", { body: { settings, baseVersion: version, force } });
      setSettings(result.settings);
      setSaved(JSON.stringify(result.settings));
      setVersion(result.version);
      setStatus({ ok: "Kaydedildi. Site 1–2 dakika içinde güncellenir." });
    } catch (error) {
      setStatus({ error: error instanceof Error ? error.message : String(error), conflict: error instanceof ApiError && error.details.conflict });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Section title="Duyuru çubuğu (sitenin en üstü)">
        <label className="flex items-center gap-2 tab:col-span-2">
          <input
            type="checkbox"
            checked={settings.announcement.enabled}
            onChange={(e) => set("announcement", { ...settings.announcement, enabled: e.target.checked })}
            className="size-4 accent-ink"
          />
          Duyuru çubuğunu göster
        </label>
        <Field label="Metin" hint="Kısa tutun (mobilde tek satır). Ör. “Bu hafta tüm sweatlerde %20 indirim — kod: SWEAT20”">
          <input
            className={inputClass}
            maxLength={140}
            value={settings.announcement.text}
            onChange={(e) => set("announcement", { ...settings.announcement, text: e.target.value })}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Bağlantı yazısı">
            <input
              className={inputClass}
              value={settings.announcement.linkText}
              onChange={(e) => set("announcement", { ...settings.announcement, linkText: e.target.value })}
            />
          </Field>
          <Field label="Bağlantı adresi">
            <input
              className={inputClass}
              placeholder="/koleksiyonlar/yeni-gelenler"
              value={settings.announcement.linkHref}
              onChange={(e) => set("announcement", { ...settings.announcement, linkHref: e.target.value })}
            />
          </Field>
        </div>
      </Section>

      <Section title="İletişim">
        <Field label="WhatsApp sipariş hattı" hint="Siparişler bu numaraya gelir. Ör. 0532 123 45 67">
          <input className={inputClass} inputMode="tel" value={settings.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
        </Field>
        <Field label="Telefon (sitede görünen)">
          <input className={inputClass} inputMode="tel" value={settings.phone} onChange={(e) => set("phone", e.target.value)} />
        </Field>
        <Field label="E-posta">
          <input className={inputClass} type="email" value={settings.email} onChange={(e) => set("email", e.target.value)} />
        </Field>
        <Field label="Instagram kullanıcı adı">
          <input className={inputClass} value={settings.instagram} onChange={(e) => set("instagram", e.target.value)} placeholder="strale" />
        </Field>
        <Field label="Çalışma saatleri">
          <input className={inputClass} value={settings.hours} onChange={(e) => set("hours", e.target.value)} />
        </Field>
        <Field label="Alan adı" hint="Satın alınca girin, ör. strale.com.tr">
          <input className={inputClass} value={settings.domain} onChange={(e) => set("domain", e.target.value)} />
        </Field>
      </Section>

      <Section title="Satıcı bilgileri (Mesafeli Satış Sözleşmesi ve KVKK metinlerinde görünür)">
        <Field label="Ticari unvan">
          <input className={inputClass} value={settings.company.title} onChange={(e) => set("company", { ...settings.company, title: e.target.value })} />
        </Field>
        <Field label="Adres">
          <input className={inputClass} value={settings.company.address} onChange={(e) => set("company", { ...settings.company, address: e.target.value })} />
        </Field>
        <Field label="Vergi dairesi">
          <input className={inputClass} value={settings.company.taxOffice} onChange={(e) => set("company", { ...settings.company, taxOffice: e.target.value })} />
        </Field>
        <Field label="Vergi / TC kimlik no">
          <input className={inputClass} value={settings.company.taxNumber} onChange={(e) => set("company", { ...settings.company, taxNumber: e.target.value })} />
        </Field>
        <Field label="MERSİS no (şirketse)">
          <input className={inputClass} value={settings.company.mersis} onChange={(e) => set("company", { ...settings.company, mersis: e.target.value })} />
        </Field>
        <Field label="ETBİS doğrulama bağlantısı" hint="ETBİS kaydı sonrası verilen https:// bağlantı; altbilgide “ETBİS Kayıtlıdır” olarak görünür.">
          <input className={inputClass} value={settings.etbisUrl} onChange={(e) => set("etbisUrl", e.target.value)} />
        </Field>
      </Section>

      <Section title="Kargo ve iade">
        <Field label="Kargo ücreti (₺)">
          <input className={inputClass} type="number" min={0} value={settings.shippingFee} onChange={(e) => set("shippingFee", Number(e.target.value))} />
        </Field>
        <Field label="Ücretsiz kargo alt sınırı (₺)">
          <input
            className={inputClass}
            type="number"
            min={0}
            value={settings.freeShippingThreshold}
            onChange={(e) => set("freeShippingThreshold", Number(e.target.value))}
          />
        </Field>
        <Field label="Kargoya verme süresi (iş günü)">
          <input className={inputClass} value={settings.dispatchDays} onChange={(e) => set("dispatchDays", e.target.value)} />
        </Field>
        <Field label="İade süresi (gün)" hint="Yasal en az 14 gün.">
          <input className={inputClass} type="number" min={14} value={settings.returnDays} onChange={(e) => set("returnDays", Number(e.target.value))} />
        </Field>
      </Section>

      <Section title="Ödeme">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.payment.transfer}
            onChange={(e) => set("payment", { ...settings.payment, transfer: e.target.checked })}
            className="size-4 accent-ink"
          />
          Havale / EFT
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.payment.cod}
            onChange={(e) => set("payment", { ...settings.payment, cod: e.target.checked })}
            className="size-4 accent-ink"
          />
          Kapıda ödeme
        </label>
        <Field label="Kapıda ödeme ek ücreti (₺)" hint="Kargo firmasının kapıda tahsilat ücreti; 0 = ücretsiz.">
          <input
            className={inputClass}
            type="number"
            min={0}
            value={settings.payment.codFee}
            onChange={(e) => set("payment", { ...settings.payment, codFee: Number(e.target.value) })}
          />
        </Field>
        <span className="hidden tab:block" />
        <Field label="Banka">
          <input className={inputClass} value={settings.bank.name} onChange={(e) => set("bank", { ...settings.bank, name: e.target.value })} />
        </Field>
        <Field label="Hesap sahibi">
          <input className={inputClass} value={settings.bank.accountHolder} onChange={(e) => set("bank", { ...settings.bank, accountHolder: e.target.value })} />
        </Field>
        <Field label="IBAN" hint="Havale seçen müşteriye sipariş sonrası gösterilir.">
          <input className={inputClass} value={settings.bank.iban} onChange={(e) => set("bank", { ...settings.bank, iban: e.target.value })} placeholder="TR00 0000 …" />
        </Field>
        <p className="text-[12px] text-graphite tab:col-span-2">
          Kartla ödeme, ödeme firması (iyzico / PayTR) anahtarları Vercel’e eklenince otomatik açılır (bkz. docs/siparis-sistemi.md).
        </p>
      </Section>

      <div className="sticky bottom-0 flex flex-wrap items-center gap-3 border-t border-sand bg-bone py-3">
        <button
          type="button"
          disabled={!dirty || saving}
          onClick={() => void save()}
          className="st-label cursor-pointer bg-ink px-5 py-3 text-bone hover:bg-smoke disabled:cursor-default disabled:bg-sand disabled:text-graphite"
        >
          {saving ? "Kaydediliyor…" : "Ayarları kaydet"}
        </button>
        {status?.ok ? <span className="text-graphite">{status.ok}</span> : null}
        {status?.error ? <span className="text-rust">{status.error}</span> : null}
        {status?.conflict ? (
          <button type="button" onClick={() => void save(true)} className="cursor-pointer text-rust underline">
            Yine de kaydet
          </button>
        ) : null}
      </div>
    </div>
  );
}
