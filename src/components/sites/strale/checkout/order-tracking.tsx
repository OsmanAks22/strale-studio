"use client";

import { useState } from "react";
import { formatPrice } from "../catalog";

type Tracked = {
  code: string;
  createdAt: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  items: { name: string; color: string; size: string; qty: number; price: number }[];
  total: number;
  carrier: string | null;
  tracking: string | null;
};

const STEPS = [
  { value: "yeni", label: "Alındı" },
  { value: "onaylandi", label: "Onaylandı" },
  { value: "hazirlaniyor", label: "Hazırlanıyor" },
  { value: "kargoda", label: "Kargoda" },
  { value: "teslim", label: "Teslim edildi" },
];

/** Tracking links for the common Turkish carriers; others show the number only. */
export function trackingUrl(carrier: string | null, number: string | null) {
  if (!number) return null;
  const n = encodeURIComponent(number);
  const c = (carrier ?? "").toLocaleLowerCase("tr-TR");
  if (c.includes("yurtiçi") || c.includes("yurtici")) return `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${n}`;
  if (c.includes("aras")) return `https://kargotakip.araskargo.com.tr/mainpage.aspx?code=${n}`;
  if (c.includes("mng")) return `https://www.mngkargo.com.tr/gonderitakip?takipNo=${n}`;
  if (c.includes("ptt")) return `https://gonderitakip.ptt.gov.tr/Track/Verify?q=${n}`;
  if (c.includes("sürat") || c.includes("surat")) return `https://www.suratkargo.com.tr/KargoTakip/?kargotakipno=${n}`;
  return null;
}

export function OrderTracking() {
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<Tracked | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const stepIndex = order ? STEPS.findIndex((s) => s.value === order.status) : -1;
  const link = order ? trackingUrl(order.carrier, order.tracking) : null;

  return (
    <div className="max-w-[640px] px-3 pb-16 tab:px-8">
      <form
        className="grid gap-3 tab:grid-cols-[1fr_160px_auto]"
        onSubmit={async (event) => {
          event.preventDefault();
          setBusy(true);
          setError(null);
          const response = await fetch(`/api/siparis/takip?kod=${encodeURIComponent(code)}&tel=${encodeURIComponent(phone)}`);
          const data = (await response.json().catch(() => ({}))) as Tracked & { error?: string };
          setBusy(false);
          if (!response.ok) {
            setOrder(null);
            setError(data.error ?? "Bulunamadı.");
          } else setOrder(data);
        }}
      >
        <input
          required
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Sipariş kodu (ST-XXXXXX)"
          className="h-11 border border-sand bg-white px-3 uppercase"
        />
        <input
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Telefonun son 4 hanesi"
          inputMode="numeric"
          maxLength={14}
          className="h-11 border border-sand bg-white px-3"
        />
        <button type="submit" disabled={busy} className="st-label h-11 cursor-pointer bg-ink px-5 text-bone hover:bg-smoke disabled:opacity-50">
          Sorgula
        </button>
      </form>
      {error ? <p className="mt-3 text-rust">{error}</p> : null}

      {order ? (
        <section className="mt-6">
          <p className="font-medium">
            {order.code} · {new Date(order.createdAt).toLocaleDateString("tr-TR")}
          </p>
          {order.status === "iptal" || order.status === "iade" ? (
            <p className="mt-3 bg-stone p-3">Bu sipariş {order.status === "iptal" ? "iptal edildi" : "iade edildi"}.</p>
          ) : (
            <ol className="mt-4 grid grid-cols-5 gap-1">
              {STEPS.map((step, index) => (
                <li key={step.value} className="text-center text-[11px]">
                  <span className={`block h-1.5 ${index <= stepIndex ? "bg-ink" : "bg-sand"}`} />
                  <span className={`mt-1.5 block ${index === stepIndex ? "font-medium" : "text-graphite"}`}>{step.label}</span>
                </li>
              ))}
            </ol>
          )}
          {order.tracking ? (
            <p className="mt-4">
              Kargo: {order.carrier ?? ""} · Takip no: <strong>{order.tracking}</strong>{" "}
              {link ? (
                <a href={link} target="_blank" rel="noreferrer" className="st-underline">
                  Kargoyu izle
                </a>
              ) : null}
            </p>
          ) : null}
          {order.paymentMethod === "havale" && order.paymentStatus === "bekliyor" ? (
            <p className="mt-3 text-rust">Ödemeniz henüz görünmüyor. Havale yaptıysanız birkaç saat içinde onaylanır.</p>
          ) : null}
          <ul className="mt-4 border-t border-sand">
            {order.items.map((item) => (
              <li key={`${item.name}-${item.size}`} className="flex justify-between border-b border-sand py-2">
                <span>
                  {item.name}
                  {item.color ? ` — ${item.color}` : ""} · {item.size} × {item.qty}
                </span>
                <span>{formatPrice(item.price * item.qty)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-right font-medium">Toplam {formatPrice(order.total)}</p>
        </section>
      ) : null}
    </div>
  );
}
