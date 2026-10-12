"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/components/sites/strale/catalog";
import { trackingUrl } from "@/components/sites/strale/checkout/order-tracking";
import { siteConfig } from "@/components/sites/strale/site-config";
import { ORDER_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES, type Order, type OrderStatus } from "@/lib/order-types";
import { api, ApiError } from "./api";
import { useAdmin } from "./admin-state";

const CARRIERS = ["Yurtiçi Kargo", "Aras Kargo", "MNG Kargo", "PTT Kargo", "Sürat Kargo", "Diğer"];

const STATUS_STYLE: Record<OrderStatus, string> = {
  yeni: "bg-rust text-bone",
  onaylandi: "bg-ink text-bone",
  hazirlaniyor: "bg-smoke text-bone",
  kargoda: "bg-stone text-ink",
  teslim: "bg-sand text-graphite",
  iptal: "border border-dashed border-graphite text-graphite",
  iade: "border border-dashed border-graphite text-graphite",
};

const statusLabel = (value: string) => ORDER_STATUSES.find((s) => s.value === value)?.label ?? value;
const phoneText = (phone: string) => phone.replace(/^90(\d{3})(\d{3})(\d{2})(\d{2})$/, "0$1 $2 $3 $4");
const waLink = (phone: string, text: string) => `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
const siteUrl = () => (siteConfig.domain ? `https://${siteConfig.domain}` : typeof window === "undefined" ? "" : window.location.origin);

/** Ready-made WhatsApp messages for each step of an order. */
function customerMessages(order: Order) {
  const first = order.customer.name.split(" ")[0];
  const link = trackingUrl(order.carrier, order.tracking);
  return [
    {
      label: "Sipariş onayı",
      text: `Merhaba ${first}, ${order.code} numaralı siparişinizi aldık, teşekkürler! ${
        order.payment_method === "havale" && order.payment_status !== "odendi"
          ? `Havale/EFT ödemeniz (${formatPrice(order.total)}) ulaşınca kargoya hazırlayacağız.`
          : `${siteConfig.dispatchDays} iş günü içinde kargoya veriyoruz.`
      }`,
    },
    order.payment_method === "havale"
      ? { label: "Ödeme hatırlatma", text: `Merhaba ${first}, ${order.code} numaralı siparişinizin ödemesi (${formatPrice(order.total)}) henüz görünmüyor. IBAN: ${siteConfig.bank.iban} (${siteConfig.bank.accountHolder}). Açıklamaya sipariş kodunu yazmayı unutmayın.` }
      : null,
    order.tracking
      ? {
          label: "Kargoya verildi",
          text: `Merhaba ${first}, ${order.code} numaralı siparişiniz ${order.carrier ?? "kargoya"} ile yola çıktı. Takip no: ${order.tracking}${link ? `\n${link}` : ""}\nSipariş takibi: ${siteUrl()}/siparis-takip`,
        }
      : null,
  ].filter((m): m is { label: string; text: string } => m !== null);
}

export function OrdersTab() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<{ message: string; noDb?: boolean } | null>(null);
  const [filter, setFilter] = useState<"aktif" | OrderStatus | "tumu">("aktif");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setOrders((await api<{ orders: Order[] }>("siparisler")).orders);
      setError(null);
    } catch (err) {
      setError({ message: err instanceof Error ? err.message : String(err), noDb: err instanceof ApiError && err.status === 503 });
    }
  }, []);

  useEffect(() => {
    // Fetch on mount (and the timer below for orders).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    const timer = window.setInterval(() => void load(), 60_000);
    return () => window.clearInterval(timer);
  }, [load]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { aktif: 0, tumu: orders?.length ?? 0 };
    for (const o of orders ?? []) {
      c[o.status] = (c[o.status] ?? 0) + 1;
      if (!["teslim", "iptal", "iade"].includes(o.status)) c.aktif++;
    }
    return c;
  }, [orders]);

  if (error) {
    return (
      <div className="bg-white p-4">
        <p className={error.noDb ? "" : "text-rust"}>{error.message}</p>
        {error.noDb ? (
          <p className="mt-2 text-graphite">
            Veritabanı bağlanana kadar siparişler yalnızca WhatsApp’a düşer; stoğu “Ürünler & Stok” sekmesindeki “Satıldı −1” ile düşürebilirsiniz.
          </p>
        ) : null}
      </div>
    );
  }
  if (!orders) return <p className="text-graphite">Siparişler yükleniyor…</p>;

  const q = query.toLocaleLowerCase("tr-TR").trim();
  const visible = orders.filter((o) => {
    if (filter === "aktif" && ["teslim", "iptal", "iade"].includes(o.status)) return false;
    if (filter !== "aktif" && filter !== "tumu" && o.status !== filter) return false;
    if (!q) return true;
    return `${o.code} ${o.customer.name} ${o.customer.phone} ${phoneText(o.customer.phone)} ${o.customer.city}`.toLocaleLowerCase("tr-TR").includes(q);
  });
  const awaitingPayment = orders.filter((o) => o.payment_method === "havale" && o.payment_status === "bekliyor" && !["iptal", "iade"].includes(o.status));
  const today = orders.filter((o) => new Date(o.created_at).toDateString() === new Date().toDateString());

  const replace = (updated: Order) => setOrders((list) => list?.map((o) => (o.code === updated.code ? updated : o)) ?? null);

  return (
    <div>
      <dl className="grid grid-cols-2 gap-2 tab:grid-cols-4">
        {[
          ["Bugün", `${today.length} sipariş`],
          ["Bugünkü ciro", formatPrice(today.filter((o) => !["iptal", "iade"].includes(o.status)).reduce((s, o) => s + o.total, 0))],
          ["Hazırlanacak", String((counts.yeni ?? 0) + (counts.onaylandi ?? 0) + (counts.hazirlaniyor ?? 0))],
          ["Ödeme bekleyen havale", `${awaitingPayment.length} · ${formatPrice(awaitingPayment.reduce((s, o) => s + o.total, 0))}`],
        ].map(([label, value]) => (
          <div key={label} className="bg-white px-3 py-2.5">
            <dt className="text-[11px] text-graphite">{label}</dt>
            <dd className="text-[16px] font-medium">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ara: kod, ad, telefon, il"
          className="h-10 min-w-0 flex-1 basis-56 border border-sand bg-white px-3 outline-none focus:border-ink"
        />
        <button type="button" onClick={() => void load()} className="h-10 cursor-pointer border border-sand bg-white px-3 hover:border-ink">
          Yenile
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {([["aktif", "Açık"], ...ORDER_STATUSES.map((s) => [s.value, s.label]), ["tumu", "Tümü"]] as [typeof filter, string][]).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={cn("cursor-pointer border px-3 py-1.5 text-[12px]", filter === value ? "border-ink bg-ink text-bone" : "border-sand bg-white hover:border-ink")}
          >
            {label} <span className="opacity-60">{counts[value] ?? 0}</span>
          </button>
        ))}
      </div>

      <ul className="mt-3 flex flex-col gap-2">
        {visible.map((order) => (
          <li key={order.code} className="bg-white">
            <button
              type="button"
              onClick={() => setOpen(open === order.code ? null : order.code)}
              className="grid w-full cursor-pointer grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-3 py-3 text-left tab:grid-cols-[120px_1fr_120px_140px_110px]"
            >
              <span className="font-medium">{order.code}</span>
              <span className="text-right tab:order-last">
                <span className={cn("px-2 py-0.5 text-[11px]", STATUS_STYLE[order.status])}>{statusLabel(order.status)}</span>
              </span>
              <span className="min-w-0 truncate">
                {order.customer.name} <span className="text-graphite">· {order.customer.city}</span>
              </span>
              <span className="text-right tab:text-left">{formatPrice(order.total)}</span>
              <span className="col-span-2 text-[12px] text-graphite tab:col-span-1">
                {PAYMENT_METHODS[order.payment_method]}
                {order.payment_method !== "kapida" ? ` · ${PAYMENT_STATUSES[order.payment_status]}` : ""}
              </span>
              <span className="col-span-2 text-[11px] text-graphite tab:hidden">{new Date(order.created_at).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" })}</span>
            </button>
            {!order.stock_applied && !["iptal", "iade"].includes(order.status) ? (
              <p className="px-3 pb-2 text-[12px] text-rust">Stok bu sipariş için düşülmedi — ürün stoğunu elle kontrol edin.</p>
            ) : null}
            {open === order.code ? <OrderDetail order={order} onChange={replace} /> : null}
          </li>
        ))}
      </ul>
      {visible.length === 0 ? <p className="py-10 text-center text-graphite">Bu filtrede sipariş yok.</p> : null}
    </div>
  );
}

function OrderDetail({ order, onChange }: { order: Order; onChange: (order: Order) => void }) {
  const { reload, dirty: productsDirty } = useAdmin();
  const [draft, setDraft] = useState({
    status: order.status,
    payment_status: order.payment_status,
    carrier: order.carrier ?? "",
    tracking: order.tracking ?? "",
    admin_note: order.admin_note ?? "",
  });
  const [state, setState] = useState<{ busy?: boolean; error?: string; note?: string }>({});
  const dirty =
    draft.status !== order.status ||
    draft.payment_status !== order.payment_status ||
    draft.carrier !== (order.carrier ?? "") ||
    draft.tracking !== (order.tracking ?? "") ||
    draft.admin_note !== (order.admin_note ?? "");

  const save = async () => {
    setState({ busy: true });
    try {
      // Entering a tracking number moves the order to "Kargoda" unless a later state was chosen.
      const status = draft.tracking && !order.tracking && ["yeni", "onaylandi", "hazirlaniyor"].includes(draft.status) ? "kargoda" : draft.status;
      const result = await api<{ order: Order; stockNote?: string }>("siparisler", { method: "PATCH", body: { code: order.code, ...draft, status } });
      onChange(result.order);
      setDraft((d) => ({ ...d, status: result.order.status }));
      setState({ note: result.stockNote });
      // Stock changed in products.json: refresh the product list (unsaved edits are kept by the merge on save).
      if (!productsDirty && status !== order.status && (["iptal", "iade"].includes(status) || ["iptal", "iade"].includes(order.status))) void reload();
    } catch (err) {
      setState({ error: err instanceof Error ? err.message : String(err) });
    }
  };

  const address = `${order.customer.name}\n${order.customer.address}\n${order.customer.district} / ${order.customer.city}\nTel: ${phoneText(order.customer.phone)}`;

  return (
    <div className="grid gap-5 border-t border-sand px-3 py-4 desk:grid-cols-[1fr_340px]">
      <div>
        <table className="w-full text-left">
          <tbody>
            {order.items.map((item) => (
              <tr key={`${item.handle}-${item.size}`} className="border-b border-sand">
                <td className="py-1.5">
                  {item.name}
                  {item.color ? ` — ${item.color}` : ""}
                </td>
                <td className="py-1.5 text-graphite">{item.size}</td>
                <td className="py-1.5 text-graphite">× {item.qty}</td>
                <td className="py-1.5 text-right">{formatPrice(item.price * item.qty)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <dl className="mt-2 ml-auto flex max-w-[260px] flex-col gap-0.5 text-[13px]">
          <div className="flex justify-between"><dt>Ara toplam</dt><dd>{formatPrice(order.subtotal)}</dd></div>
          {order.discount ? <div className="flex justify-between text-rust"><dt>İndirim {order.discount_code}</dt><dd>−{formatPrice(order.discount)}</dd></div> : null}
          <div className="flex justify-between"><dt>Kargo</dt><dd>{order.shipping ? formatPrice(order.shipping) : "Ücretsiz"}</dd></div>
          {order.cod_fee ? <div className="flex justify-between"><dt>Kapıda ödeme</dt><dd>{formatPrice(order.cod_fee)}</dd></div> : null}
          <div className="flex justify-between font-medium"><dt>Toplam</dt><dd>{formatPrice(order.total)}</dd></div>
        </dl>

        <div className="mt-4 bg-bone p-3">
          <p className="st-micro text-[10px] text-graphite">Teslimat adresi</p>
          <p className="mt-1 whitespace-pre-line">{address}</p>
          {order.customer.email ? <p className="text-graphite">{order.customer.email}</p> : null}
          {order.customer.note ? <p className="mt-1">Not: {order.customer.note}</p> : null}
          <div className="mt-2 flex flex-wrap gap-3 text-[12px]">
            <button type="button" onClick={() => void navigator.clipboard.writeText(address)} className="cursor-pointer underline">
              Adresi kopyala
            </button>
            <a href={`tel:+${order.customer.phone}`} className="underline">
              Ara
            </a>
            <a href={waLink(order.customer.phone, "")} target="_blank" rel="noreferrer" className="underline">
              WhatsApp
            </a>
            <button type="button" onClick={() => printSlip(order)} className="cursor-pointer underline">
              Sipariş fişi yazdır
            </button>
          </div>
        </div>

        <div className="mt-4">
          <p className="st-micro text-[10px] text-graphite">Müşteriye hazır mesajlar</p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {customerMessages({ ...order, carrier: draft.carrier || order.carrier, tracking: draft.tracking || order.tracking }).map((m) => (
              <a key={m.label} href={waLink(order.customer.phone, m.text)} target="_blank" rel="noreferrer" className="border border-sand px-3 py-1.5 text-[12px] hover:border-ink">
                {m.label} ↗
              </a>
            ))}
          </div>
        </div>
        <p className="mt-3 text-[11px] text-graphite">
          {new Date(order.created_at).toLocaleString("tr-TR")} · son güncelleme {new Date(order.updated_at).toLocaleString("tr-TR")}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <label>
          <span className="st-micro text-[10px] text-graphite">Durum</span>
          <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as OrderStatus })} className="h-10 w-full border border-sand bg-white px-2">
            {ORDER_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          {["iptal", "iade"].includes(draft.status) && !["iptal", "iade"].includes(order.status) ? (
            <span className="mt-1 block text-[11px] text-graphite">Kaydedince ürünler stoğa geri eklenir.</span>
          ) : null}
        </label>
        {order.payment_method !== "kapida" ? (
          <label>
            <span className="st-micro text-[10px] text-graphite">Ödeme</span>
            <select
              value={draft.payment_status}
              onChange={(e) => setDraft({ ...draft, payment_status: e.target.value as Order["payment_status"] })}
              className="h-10 w-full border border-sand bg-white px-2"
            >
              {Object.entries(PAYMENT_STATUSES).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <div className="grid grid-cols-2 gap-2">
          <label>
            <span className="st-micro text-[10px] text-graphite">Kargo firması</span>
            <select value={draft.carrier} onChange={(e) => setDraft({ ...draft, carrier: e.target.value })} className="h-10 w-full border border-sand bg-white px-2">
              <option value="">Seçin</option>
              {CARRIERS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="st-micro text-[10px] text-graphite">Takip no</span>
            <input value={draft.tracking} onChange={(e) => setDraft({ ...draft, tracking: e.target.value })} className="h-10 w-full border border-sand bg-white px-2" />
          </label>
        </div>
        <label>
          <span className="st-micro text-[10px] text-graphite">İç not (müşteri görmez)</span>
          <textarea value={draft.admin_note} onChange={(e) => setDraft({ ...draft, admin_note: e.target.value })} rows={3} className="w-full border border-sand bg-white px-2 py-1.5" />
        </label>
        <button
          type="button"
          disabled={!dirty || state.busy}
          onClick={() => void save()}
          className="st-label h-11 cursor-pointer bg-ink text-bone hover:bg-smoke disabled:cursor-default disabled:bg-sand disabled:text-graphite"
        >
          {state.busy ? "Kaydediliyor…" : "Siparişi güncelle"}
        </button>
        {state.error ? <p className="text-rust">{state.error}</p> : null}
        {state.note ? <p className="text-rust">{state.note}</p> : null}
      </div>
    </div>
  );
}

/** Opens a plain packing slip in a new window and prints it. */
function printSlip(order: Order) {
  const win = window.open("", "_blank", "width=600,height=800");
  if (!win) return;
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
  const rows = order.items
    .map((i) => `<tr><td>${esc(i.name)}${i.color ? ` — ${esc(i.color)}` : ""}</td><td>${esc(i.size)}</td><td>${i.qty}</td><td style="text-align:right">${esc(formatPrice(i.price * i.qty))}</td></tr>`)
    .join("");
  win.document.write(`<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>${order.code}</title>
<style>body{font:13px/1.5 system-ui,sans-serif;margin:32px;color:#151412}h1{font-size:18px;letter-spacing:2px}table{width:100%;border-collapse:collapse;margin:16px 0}td,th{border-bottom:1px solid #ccc;padding:6px 4px;text-align:left}.box{border:1px solid #151412;padding:12px;white-space:pre-line;font-size:15px}</style></head><body>
<h1>STRALE</h1><p><strong>${order.code}</strong> · ${new Date(order.created_at).toLocaleDateString("tr-TR")} · ${esc(PAYMENT_METHODS[order.payment_method])}</p>
<div class="box">${esc(`${order.customer.name}\n${order.customer.address}\n${order.customer.district} / ${order.customer.city}\nTel: ${phoneText(order.customer.phone)}`)}</div>
<table><thead><tr><th>Ürün</th><th>Beden</th><th>Adet</th><th style="text-align:right">Tutar</th></tr></thead><tbody>${rows}</tbody></table>
<p style="text-align:right">Kargo: ${order.shipping ? esc(formatPrice(order.shipping)) : "Ücretsiz"}${order.discount ? ` · İndirim: −${esc(formatPrice(order.discount))}` : ""}${order.cod_fee ? ` · Kapıda ödeme: ${esc(formatPrice(order.cod_fee))}` : ""}<br><strong>Toplam: ${esc(formatPrice(order.total))}</strong>${order.payment_method === "kapida" ? "<br><strong>KAPIDA TAHSİL EDİLECEK</strong>" : ""}</p>
<p>Bizi tercih ettiğiniz için teşekkürler. İade/değişim: ${siteConfig.returnDays} gün.</p>
<script>window.onload=()=>window.print()</script></body></html>`);
  win.document.close();
}
