"use client";

import Link from "next/link";
import { useState } from "react";

/** "Gelince haber ver": leaves name + phone for a sold-out size; the shop messages them on WhatsApp. */
export function StockAlertForm({ handle, sizes }: { handle: string; sizes: string[] }) {
  const [size, setSize] = useState(sizes.length === 1 ? sizes[0] : "");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<{ busy?: boolean; done?: boolean; error?: string }>({});

  if (state.done) {
    return <p className="mt-3 bg-stone px-3 py-3">Tamam! {size ? `${size} beden` : "Ürün"} gelince WhatsApp’tan haber vereceğiz.</p>;
  }

  return (
    <form
      className="mt-3 border border-sand p-3"
      onSubmit={async (event) => {
        event.preventDefault();
        setState({ busy: true });
        const website = (new FormData(event.currentTarget).get("website") as string) ?? "";
        const response = await fetch("/api/stok-bildirim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ handle, size, name, phone, consent, website }),
        });
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setState(response.ok ? { done: true } : { error: data.error ?? "Kaydedilemedi." });
      }}
    >
      <p className="font-medium">Gelince haber ver</p>
      <div className="mt-2 grid gap-2 tab:grid-cols-[90px_1fr_1fr]">
        {sizes.length > 1 ? (
          <select required value={size} onChange={(e) => setSize(e.target.value)} className="h-11 border border-sand bg-white px-2" aria-label="Beden">
            <option value="">Beden</option>
            {sizes.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        ) : null}
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Adınız" autoComplete="name" className="h-11 border border-sand bg-white px-3" />
        <input
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="05XX XXX XX XX"
          inputMode="tel"
          autoComplete="tel"
          className="h-11 border border-sand bg-white px-3"
        />
      </div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <label className="mt-2 flex items-start gap-2 text-[12px] text-graphite">
        <input type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 size-4 accent-ink" />
        <span>
          Bu ürün stoğa girince telefonuma WhatsApp mesajı gönderilmesini kabul ediyorum.{" "}
          <Link href="/sayfa/kvkk" className="st-underline">
            Aydınlatma metni
          </Link>
        </span>
      </label>
      {state.error ? <p className="mt-2 text-rust">{state.error}</p> : null}
      <button type="submit" disabled={state.busy} className="st-label mt-3 h-11 w-full cursor-pointer bg-ink text-bone hover:bg-smoke disabled:opacity-50">
        {state.busy ? "Kaydediliyor…" : "Haber ver"}
      </button>
    </form>
  );
}
