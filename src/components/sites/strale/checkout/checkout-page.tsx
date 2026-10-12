"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { formatPrice } from "../catalog";
import { clearCart, removeFromCart, replaceCart, useCart } from "../shop-store";
import { siteConfig } from "../site-config";
import { CITIES } from "./cities";

type Method = "havale" | "kapida" | "kart";
type Item = { handle: string; name: string; color: string; size: string; price: number; qty: number };
type Quote = {
  items: Item[];
  subtotal: number;
  discount: number;
  discountCode: string | null;
  discountError?: string;
  shipping: number;
  codFee: number;
  total: number;
  problems: { handle: string; size: string; message: string; left: number }[];
  methods: Method[];
};

const METHOD_TEXT: Record<Method, { title: string; note: string }> = {
  havale: { title: "Havale / EFT", note: "Sipariş sonrası IBAN gösterilir; ödeme gelince kargolanır." },
  kapida: { title: "Kapıda ödeme", note: "Ürünü teslim alırken nakit veya kartla ödersiniz." },
  kart: { title: "Kredi / banka kartı", note: "Güvenli ödeme sayfasına yönlendirilirsiniz." },
};

const inputClass = "h-11 w-full border border-sand bg-white px-3 outline-none focus:border-ink";
const FORM_KEY = "st-odeme-form";

type Form = { name: string; phone: string; email: string; city: string; district: string; address: string; note: string };
const emptyForm: Form = { name: "", phone: "", email: "", city: "", district: "", address: "", note: "" };

function loadForm(): Form {
  try {
    return { ...emptyForm, ...(JSON.parse(window.sessionStorage.getItem(FORM_KEY) ?? "{}") as Partial<Form>) };
  } catch {
    return emptyForm;
  }
}

export function CheckoutPage() {
  const router = useRouter();
  const lines = useCart();
  const [form, setForm] = useState<Form>(emptyForm);
  const [method, setMethod] = useState<Method | null>(null);
  const [codeInput, setCodeInput] = useState("");
  const [code, setCode] = useState("");
  const [consents, setConsents] = useState({ preInfo: false, contract: false });
  const [quote, setQuote] = useState<Quote | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep what was typed if the customer goes back to the basket (session only, never sent anywhere).
  useEffect(() => {
    setForm(loadForm());
  }, []);
  useEffect(() => {
    try {
      window.sessionStorage.setItem(FORM_KEY, JSON.stringify(form));
    } catch {
      // ignore
    }
  }, [form]);

  const linesKey = JSON.stringify(lines);
  useEffect(() => {
    if (!lines.length) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/siparis/hesapla", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lines, paymentMethod: method, discountCode: code }),
          signal: controller.signal,
        });
        if (response.ok) setQuote((await response.json()) as Quote);
      } catch {
        // aborted / offline: keep the last quote
      }
    }, 150);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- linesKey stands for lines
  }, [linesKey, method, code]);

  const methods = useMemo(() => quote?.methods ?? [], [quote]);
  const chosen = method ?? (methods.length === 1 ? methods[0] : null);

  if (!lines.length) {
    return (
      <div className="px-3 pb-16 tab:px-8">
        <p>Sepetiniz boş.</p>
        <Link href="/" className="st-label st-underline mt-3 inline-block">
          Alışverişe başla
        </Link>
      </div>
    );
  }

  const set = (key: keyof Form) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: event.target.value }));

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!chosen) return setError("Ödeme yöntemi seçin.");
    setSubmitting(true);
    try {
      const response = await fetch("/api/siparis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines,
          customer: form,
          paymentMethod: chosen,
          discountCode: code,
          consents,
          website: (new FormData(event.currentTarget).get("website") as string) ?? "",
        }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string; problems?: Quote["problems"]; code?: string };
      if (!response.ok) {
        setError(data.error ?? "Sipariş alınamadı.");
        if (data.problems?.length) {
          // Trim the basket to what is really left so the customer sees the fix.
          replaceCart(
            lines
              .map((l) => {
                const problem = data.problems!.find((p) => p.handle === l.handle && p.size === l.size);
                return problem ? { ...l, qty: problem.left } : l;
              })
              .filter((l) => l.qty > 0),
          );
        }
        return;
      }
      window.sessionStorage.setItem("st-son-siparis", JSON.stringify(data));
      window.sessionStorage.removeItem(FORM_KEY);
      clearCart();
      router.push("/siparis/tamam");
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-8 px-3 pb-16 tab:px-8 desk:grid-cols-[1fr_400px]">
      <div className="flex flex-col gap-6">
        <fieldset className="grid gap-3 tab:grid-cols-2">
          <legend className="st-label mb-3">Teslimat bilgileri</legend>
          <label className="tab:col-span-2">
            <span className="st-micro text-[10px] text-graphite">Ad soyad</span>
            <input required autoComplete="name" className={inputClass} value={form.name} onChange={set("name")} />
          </label>
          <label>
            <span className="st-micro text-[10px] text-graphite">Cep telefonu</span>
            <input required autoComplete="tel" inputMode="tel" placeholder="05XX XXX XX XX" className={inputClass} value={form.phone} onChange={set("phone")} />
          </label>
          <label>
            <span className="st-micro text-[10px] text-graphite">E-posta (isteğe bağlı)</span>
            <input type="email" autoComplete="email" className={inputClass} value={form.email} onChange={set("email")} />
          </label>
          <label>
            <span className="st-micro text-[10px] text-graphite">İl</span>
            <select required className={inputClass} value={form.city} onChange={set("city")} autoComplete="address-level1">
              <option value="">Seçin</option>
              {CITIES.map((city) => (
                <option key={city}>{city}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="st-micro text-[10px] text-graphite">İlçe</span>
            <input required className={inputClass} value={form.district} onChange={set("district")} autoComplete="address-level2" />
          </label>
          <label className="tab:col-span-2">
            <span className="st-micro text-[10px] text-graphite">Açık adres</span>
            <textarea
              required
              rows={3}
              autoComplete="street-address"
              placeholder="Mahalle, cadde/sokak, bina no, daire"
              className="w-full border border-sand bg-white px-3 py-2 outline-none focus:border-ink"
              value={form.address}
              onChange={set("address")}
            />
          </label>
          <label className="tab:col-span-2">
            <span className="st-micro text-[10px] text-graphite">Sipariş notu (isteğe bağlı)</span>
            <input className={inputClass} value={form.note} onChange={set("note")} />
          </label>
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
        </fieldset>

        <fieldset>
          <legend className="st-label mb-3">Ödeme yöntemi</legend>
          <div className="flex flex-col gap-2">
            {methods.map((value) => (
              <label key={value} className={cn("flex cursor-pointer items-start gap-3 border bg-white p-3", chosen === value ? "border-ink" : "border-sand")}>
                <input type="radio" name="payment" checked={chosen === value} onChange={() => setMethod(value)} className="mt-1 size-4 accent-ink" />
                <span>
                  <span className="font-medium">{METHOD_TEXT[value].title}</span>
                  {value === "kapida" && siteConfig.payment.codFee ? ` (+${formatPrice(siteConfig.payment.codFee)})` : ""}
                  <span className="block text-[12px] text-graphite">{METHOD_TEXT[value].note}</span>
                </span>
              </label>
            ))}
            {!methods.length && quote ? <p className="text-rust">Şu anda sipariş alınamıyor; lütfen WhatsApp’tan yazın.</p> : null}
          </div>
        </fieldset>
      </div>

      <aside className="h-fit bg-stone p-4">
        <h2 className="st-label">Sipariş özeti</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {(quote?.items ?? []).map((item) => (
            <li key={`${item.handle}-${item.size}`} className="flex justify-between gap-3">
              <span>
                {item.name}
                {item.color ? ` — ${item.color}` : ""} <span className="text-graphite">· {item.size} × {item.qty}</span>
              </span>
              <span className="shrink-0">{formatPrice(item.price * item.qty)}</span>
            </li>
          ))}
        </ul>
        {quote?.problems.length ? (
          <ul className="mt-3 flex flex-col gap-1 text-rust">
            {quote.problems.map((p) => (
              <li key={`${p.handle}-${p.size}`} className="flex justify-between gap-2">
                <span>{p.message}</span>
                <button type="button" onClick={() => removeFromCart(p.handle, p.size)} className="cursor-pointer underline">
                  Çıkar
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-4 flex gap-2">
          <input
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.toLocaleUpperCase("tr-TR"))}
            placeholder="İndirim kodu"
            aria-label="İndirim kodu"
            className="h-10 min-w-0 flex-1 border border-sand bg-white px-3 uppercase outline-none focus:border-ink"
          />
          <button type="button" onClick={() => setCode(codeInput.trim())} className="st-label h-10 cursor-pointer border border-ink px-3 hover:bg-ink hover:text-bone">
            Uygula
          </button>
        </div>
        {code && quote?.discountError ? <p className="mt-1 text-[12px] text-rust">{quote.discountError}</p> : null}
        {code && quote?.discountCode ? <p className="mt-1 text-[12px] text-graphite">“{quote.discountCode}” uygulandı.</p> : null}

        {quote ? (
          <dl className="mt-4 flex flex-col gap-1.5 border-t border-sand pt-3">
            <div className="flex justify-between">
              <dt>Ara toplam</dt>
              <dd>{formatPrice(quote.subtotal)}</dd>
            </div>
            {quote.discount ? (
              <div className="flex justify-between text-rust">
                <dt>İndirim</dt>
                <dd>−{formatPrice(quote.discount)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between">
              <dt>Kargo</dt>
              <dd>{quote.shipping ? formatPrice(quote.shipping) : "Ücretsiz"}</dd>
            </div>
            {quote.codFee ? (
              <div className="flex justify-between">
                <dt>Kapıda ödeme</dt>
                <dd>{formatPrice(quote.codFee)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-sand pt-2 text-[16px] font-medium">
              <dt>Toplam</dt>
              <dd>{formatPrice(quote.total)}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-4 text-graphite">Hesaplanıyor…</p>
        )}

        <div className="mt-4 flex flex-col gap-2 text-[12px]">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              required
              checked={consents.preInfo}
              onChange={(e) => setConsents((c) => ({ ...c, preInfo: e.target.checked }))}
              className="mt-0.5 size-4 shrink-0 accent-ink"
            />
            <span>
              <Link href="/sayfa/on-bilgilendirme" target="_blank" className="st-underline">
                Ön Bilgilendirme Formu
              </Link>
              ’nu okudum ve onaylıyorum.
            </span>
          </label>
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              required
              checked={consents.contract}
              onChange={(e) => setConsents((c) => ({ ...c, contract: e.target.checked }))}
              className="mt-0.5 size-4 shrink-0 accent-ink"
            />
            <span>
              <Link href="/sayfa/mesafeli-satis-sozlesmesi" target="_blank" className="st-underline">
                Mesafeli Satış Sözleşmesi
              </Link>
              ’ni okudum ve onaylıyorum.
            </span>
          </label>
          <p className="text-graphite">
            Kişisel verileriniz siparişinizi teslim etmek için işlenir.{" "}
            <Link href="/sayfa/kvkk" target="_blank" className="st-underline">
              KVKK Aydınlatma Metni
            </Link>
          </p>
        </div>

        {error ? <p className="mt-3 bg-[#f3dccf] px-3 py-2 text-rust" role="alert">{error}</p> : null}
        <button
          type="submit"
          disabled={submitting || !quote || Boolean(quote.problems.length) || !chosen}
          className="st-label mt-4 h-12 w-full cursor-pointer bg-ink text-bone hover:bg-smoke disabled:cursor-default disabled:bg-sand disabled:text-graphite"
        >
          {submitting ? "Sipariş veriliyor…" : quote ? `Siparişi onayla · ${formatPrice(quote.total)}` : "Siparişi onayla"}
        </button>
        <p className="mt-2 text-center text-[11px] text-graphite">Siparişi onaylayarak ödeme yükümlülüğü altına girdiğinizi kabul edersiniz.</p>
      </aside>
    </form>
  );
}
