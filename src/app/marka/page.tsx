import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { StraleMark, StraleMarkFlight, StraleMarkTwin } from "@/components/sites/strale/icons";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Marka Alternatifleri",
  robots: { index: false },
};

/** Internal brand lab: logo and palette options side by side, rendered with the real font. */

const logos = [
  {
    id: "A",
    name: "Dart",
    current: true,
    Mark: StraleMark,
    markClass: "h-[18px] w-6 fill-current",
    wordClass: "st-display text-[22px] tracking-[0.18em]",
    word: "Strale",
    note: "Çentikli ok ucu + dar, kalın wordmark. Sportif ve keskin; küçük boyutta (favicon, etiket) en okunaklı seçenek.",
  },
  {
    id: "B",
    name: "Twin",
    current: false,
    Mark: StraleMarkTwin,
    markClass: "h-[18px] w-[22px] fill-current",
    wordClass: "font-medium font-stretch-[125%] text-[18px] tracking-[0.1em] uppercase",
    word: "Strale",
    note: "Ardışık iki şevron hareket ve ritim anlatır. Geniş, orta ağırlıklı wordmark ile daha lüks ve sakin bir duruş.",
  },
  {
    id: "C",
    name: "Flight",
    current: false,
    Mark: StraleMarkFlight,
    markClass: "h-[18px] w-6",
    wordClass: "font-bold text-[26px] tracking-[-0.02em]",
    word: "strale",
    note: "Tek kanatlı, çizgisel ok. Küçük harfli wordmark ile modern, samimi ve stüdyo/atölye hissi veren bir kimlik.",
  },
];

type Swatch = { token: string; hex: string; role: string };
type Palette = {
  id: string;
  name: string;
  current: boolean;
  note: string;
  bg: string;
  ink: string;
  stone: string;
  graphite: string;
  accent: string;
  swatches: Swatch[];
  contrast: string;
};

const palettes: Palette[] = [
  {
    id: "A",
    name: "Kemik & Pas",
    current: true,
    note: "Sıcak kumaş/taş nötrleri, toprak tonlu pas vurgusu. Yün, flanel ve sonbahar çekimleriyle en uyumlu palet.",
    bg: "#F5F2EC",
    ink: "#151412",
    stone: "#E8E3DA",
    graphite: "#645F58",
    accent: "#A23E1A",
    swatches: [
      { token: "ink", hex: "#151412", role: "Metin, koyu zemin" },
      { token: "bone", hex: "#F5F2EC", role: "Sayfa zemini" },
      { token: "stone", hex: "#E8E3DA", role: "Ürün zemini" },
      { token: "graphite", hex: "#645F58", role: "İkincil metin" },
      { token: "rust", hex: "#A23E1A", role: "Vurgu" },
    ],
    contrast: "Vurgu/zemin 5.8:1 · İkincil 5.7:1",
  },
  {
    id: "B",
    name: "Tebeşir & Orman",
    current: false,
    note: "Hafif yeşilimsi kirli beyaz, derin orman yeşili vurgu. Doğa, dayanıklılık ve outdoor çağrışımı güçlü.",
    bg: "#F2F1EC",
    ink: "#161A16",
    stone: "#E3E3DB",
    graphite: "#5E625B",
    accent: "#2F5D46",
    swatches: [
      { token: "ink", hex: "#161A16", role: "Metin, koyu zemin" },
      { token: "chalk", hex: "#F2F1EC", role: "Sayfa zemini" },
      { token: "lichen", hex: "#E3E3DB", role: "Ürün zemini" },
      { token: "moss", hex: "#5E625B", role: "İkincil metin" },
      { token: "forest", hex: "#2F5D46", role: "Vurgu" },
    ],
    contrast: "Vurgu/zemin 6.7:1 · İkincil 5.5:1",
  },
  {
    id: "C",
    name: "Sis & Lacivert",
    current: false,
    note: "Serin gri-beyaz zemin, mürekkep laciverti vurgu. Daha teknik, şehirli ve zamansız; performans serisine yakın.",
    bg: "#F3F4F2",
    ink: "#0F1720",
    stone: "#E2E5E4",
    graphite: "#5B6168",
    accent: "#1F4E79",
    swatches: [
      { token: "ink", hex: "#0F1720", role: "Metin, koyu zemin" },
      { token: "fog", hex: "#F3F4F2", role: "Sayfa zemini" },
      { token: "mist", hex: "#E2E5E4", role: "Ürün zemini" },
      { token: "slate", hex: "#5B6168", role: "İkincil metin" },
      { token: "navy", hex: "#1F4E79", role: "Vurgu" },
    ],
    contrast: "Vurgu/zemin 7.9:1 · İkincil 5.7:1",
  },
];

function paletteVars(p: Palette) {
  return {
    "--p-bg": p.bg,
    "--p-ink": p.ink,
    "--p-stone": p.stone,
    "--p-graphite": p.graphite,
    "--p-accent": p.accent,
  } as CSSProperties;
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="st-micro ml-2 bg-ink px-1.5 py-0.5 text-[9px] text-bone">{children}</span>;
}

export default function BrandLab() {
  return (
    <main className="px-3 py-12 tab:px-8 tab:py-16">
      <header className="max-w-[720px]">
        <p className="st-micro text-[10px] text-graphite">Strale · Marka laboratuvarı</p>
        <h1 className="st-display mt-3 text-[34px] leading-[36px] tab:text-[56px] tab:leading-[58px]">
          Logo & Renk Alternatifleri
        </h1>
        <p className="mt-4 text-[12px] leading-[18px] tab:text-[16px] tab:leading-6">
          Her alternatif sitenin gerçek fontuyla çizildi. Logo ve palet birbirinden bağımsız seçilebilir; örneğin
          logo B + palet A. Şu an sitede kullanılanlar “Mevcut” olarak işaretli.
        </p>
      </header>

      <section className="mt-14">
        <h2 className="st-heading text-[12px] tab:text-[15px]">Logo alternatifleri</h2>
        <div className="mt-4 grid gap-1.5 desk:grid-cols-3">
          {logos.map(({ id, name, current, Mark, markClass, wordClass, word, note }) => (
            <article key={id} className="flex flex-col bg-stone">
              <div className="flex h-[180px] items-center justify-center bg-bone text-ink">
                <span className="inline-flex items-center gap-2.5">
                  <Mark className={markClass} />
                  <span className={cn("leading-none", wordClass)}>{word}</span>
                </span>
              </div>
              <div className="flex h-[120px] items-center justify-center gap-10 bg-ink text-bone">
                <span className="inline-flex items-center gap-2.5">
                  <Mark className={markClass} />
                  <span className={cn("leading-none", wordClass)}>{word}</span>
                </span>
                <span className="flex size-12 items-center justify-center bg-bone text-ink" title="Favicon / profil">
                  <Mark className={markClass} />
                </span>
              </div>
              <div className="p-4 tab:p-6">
                <h3 className="st-heading text-[12px]">
                  {id} — <span lang="en">{name}</span>
                  {current ? <Badge>Mevcut</Badge> : null}
                </h3>
                <p className="mt-2 text-graphite">{note}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="st-heading text-[12px] tab:text-[15px]">Renk paletleri</h2>
        <div className="mt-4 grid gap-1.5 desk:grid-cols-3">
          {palettes.map((p) => (
            <article key={p.id} style={paletteVars(p)} className="flex flex-col bg-(--p-bg) text-(--p-ink)">
              <div className="flex h-[30px] items-center justify-center bg-(--p-ink) text-[10px] text-(--p-bg)">
                Yeni Sezon: Sonbahar ‘26.&nbsp;<span className="underline underline-offset-2">Keşfet</span>
              </div>
              <div className="flex h-[48px] items-center justify-between border-b border-(--p-stone) px-4">
                <span className="inline-flex items-center gap-2">
                  <StraleMark className="h-3 w-4 fill-current" />
                  <span className="st-display text-[15px] leading-none tracking-[0.18em]">Strale</span>
                </span>
                <span className="st-label text-[10px]">Yeni · Giyim · Aksesuar</span>
              </div>
              <div className="grid grid-cols-2 gap-1 p-4">
                <div className="relative flex aspect-[4/5] items-end bg-(--p-stone) p-2">
                  <span className="st-micro absolute top-2 left-2 text-[9px] text-(--p-accent)">Yeni</span>
                  <span className="text-[10px]">Yün Polar Ceket</span>
                </div>
                <div className="flex aspect-[4/5] flex-col justify-end bg-(--p-ink) p-3 text-(--p-bg)">
                  <span className="st-display text-[18px] leading-5">Amaçla Tasarlandı</span>
                  <span className="st-label mt-2 text-[9px] underline decoration-(--p-accent) underline-offset-4">
                    Koleksiyonu Keşfet
                  </span>
                </div>
              </div>
              <ul className="grid grid-cols-5 gap-1 px-4">
                {p.swatches.map((s) => (
                  <li key={s.token} className="min-w-0">
                    <span
                      className="block h-10 border border-(--p-stone)"
                      style={{ background: s.hex }}
                      aria-hidden="true"
                    />
                    <span lang="en" className="st-micro mt-1.5 block truncate text-[9px]">
                      {s.token}
                    </span>
                    <span className="block truncate text-[9px] text-(--p-graphite)">{s.hex}</span>
                  </li>
                ))}
              </ul>
              <div className="p-4 pt-5">
                <h3 className="st-heading text-[12px]">
                  {p.id} — {p.name}
                  {p.current ? <Badge>Mevcut</Badge> : null}
                </h3>
                <p className="mt-2 text-(--p-graphite)">{p.note}</p>
                <p className="st-micro mt-3 text-[9px] text-(--p-graphite)">WCAG AA ✓ · {p.contrast}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Link href="/" className="st-label st-underline mt-14 inline-block">
        Ana Sayfaya Dön
      </Link>
    </main>
  );
}
