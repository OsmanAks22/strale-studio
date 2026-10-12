"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice } from "../catalog";
import { WhatsAppIcon } from "../icons";

type Result = {
  code: string;
  saved: boolean;
  total: number;
  paymentMethod: "havale" | "kapida" | "kart";
  whatsappUrl: string | null;
  message: string;
  bank?: { name: string; accountHolder: string; iban: string };
};

/** Confirmation after checkout; the order details come from this tab's sessionStorage. */
export function OrderDone() {
  const [result, setResult] = useState<Result | null | undefined>(undefined);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    // Read once after mount: sessionStorage does not exist during server rendering.
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResult(JSON.parse(window.sessionStorage.getItem("st-son-siparis") ?? "null") as Result | null);
    } catch {
      setResult(null);
    }
  }, []);

  if (result === undefined) return null;
  if (!result) {
    return (
      <div className="px-3 pb-16 tab:px-8">
        <p>Görüntülenecek sipariş yok.</p>
        <Link href="/siparis-takip" className="st-underline mt-2 inline-block">
          Sipariş takibi
        </Link>
      </div>
    );
  }

  const copy = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
    } catch {
      setCopied(null);
    }
  };

  return (
    <div className="max-w-[640px] px-3 pb-16 tab:px-8">
      <p className="text-[16px]">
        Sipariş kodunuz: <strong className="st-label text-[16px]">{result.code}</strong>
      </p>
      <p className="mt-2 text-graphite">Toplam: {formatPrice(result.total)}. Bu kodu not alın; sipariş takibinde kullanacaksınız.</p>

      {result.paymentMethod === "havale" && result.bank?.iban ? (
        <section className="mt-6 bg-stone p-4">
          <h2 className="st-label">Havale / EFT bilgileri</h2>
          <dl className="mt-3 grid grid-cols-[110px_1fr] gap-y-2">
            {result.bank.name ? (
              <>
                <dt className="text-graphite">Banka</dt>
                <dd>{result.bank.name}</dd>
              </>
            ) : null}
            <dt className="text-graphite">Alıcı</dt>
            <dd>{result.bank.accountHolder}</dd>
            <dt className="text-graphite">IBAN</dt>
            <dd className="flex flex-wrap items-center gap-2">
              <span className="font-mono">{result.bank.iban}</span>
              <button type="button" onClick={() => void copy("iban", result.bank!.iban.replace(/\s/g, ""))} className="cursor-pointer text-[12px] underline">
                {copied === "iban" ? "Kopyalandı" : "Kopyala"}
              </button>
            </dd>
            <dt className="text-graphite">Tutar</dt>
            <dd>{formatPrice(result.total)}</dd>
            <dt className="text-graphite">Açıklama</dt>
            <dd className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{result.code}</span>
              <button type="button" onClick={() => void copy("code", result.code)} className="cursor-pointer text-[12px] underline">
                {copied === "code" ? "Kopyalandı" : "Kopyala"}
              </button>
            </dd>
          </dl>
          <p className="mt-3 text-[12px] text-graphite">Açıklamaya sipariş kodunu yazmayı unutmayın. Ödeme ulaşınca siparişiniz kargoya hazırlanır.</p>
        </section>
      ) : null}

      {result.paymentMethod === "kapida" ? (
        <p className="mt-6 bg-stone p-4">Ödemeyi ürünü teslim alırken kuryeye yapacaksınız (nakit veya kart).</p>
      ) : null}

      {result.whatsappUrl ? (
        <div className="mt-6">
          <p>{result.saved ? "Siparişiniz bize ulaştı. İsterseniz WhatsApp’tan da iletin, daha hızlı dönüş yapalım:" : "Siparişinizi tamamlamak için WhatsApp’tan gönderin:"}</p>
          <a
            href={result.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="st-label mt-3 inline-flex h-12 items-center gap-2 bg-ink px-5 text-bone hover:bg-smoke"
          >
            <WhatsAppIcon className="size-5" />
            WhatsApp ile gönder
          </a>
        </div>
      ) : null}

      <p className="mt-8">
        <Link href="/siparis-takip" className="st-underline">
          Siparişimi takip et
        </Link>
        {" · "}
        <Link href="/" className="st-underline">
          Alışverişe devam et
        </Link>
      </p>
    </div>
  );
}
