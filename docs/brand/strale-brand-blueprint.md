# STRALE — Brand Design Blueprint

> Durum: v1 taslak · 2026-10-09 · `claude/gracious-davinci-ng1ac1` branch'i
> Kapsam: klonlanan reigningchamp.com ana sayfa iskeletinin Strale kimliğine dönüştürülmesi.
> Kod tarafındaki karşılıkları: `src/app/globals.css` (token'lar), `src/components/sites/strale/` (bileşenler).

---

## 1. Marka özü

| | |
|---|---|
| **İsim** | STRALE (studio) |
| **Kök** | İtalyanca *strale* — "ok, dart". Yön, hassasiyet, tek hamlede hedefe varmak. |
| **Kategori** | Premium günlük giyim / "elevated essentials": sweat, örgü, dış giyim, aksesuar. |
| **Konumlandırma** | Az ama doğru parça. Sezon trendi değil, yıllarca giyilecek temel gardırop. |
| **Vaat** | *Made with direction.* — Her parça bir amaçla tasarlanır, gereksiz detay taşımaz. |
| **Kişilik** | Net · sakin · özgüvenli · zanaat odaklı. Bağırmaz, işaret eder. |
| **Ses tonu** | Kısa cümleler. Fiil ile başlayan CTA'lar. Ünlem yok, emoji yok. Teknik bilgi (kumaş, gramaj, kalıp) gururla verilir. |

### Mesaj hiyerarşisi
1. **Tagline:** Made with direction.
2. **Destek cümlesi:** Essentials designed with intent — cut, sewn and finished to last.
3. **Kanıt noktaları:** ağır gramajlı pamuk, merino, ölçülü kalıplar (Slim / Standard / Relaxed), uzun ömür garantisi.

### Yazım kuralları
- Navigasyon, etiket, CTA: **BÜYÜK HARF**, geniş harf aralığı.
- Gövde metni: cümle düzeni (sentence case).
- Ürün adı formatı: `<Kumaş> <Model> <Kalıp> <Tip>` → *Loopback Terry Arc Standard Hoodie*.
- Koleksiyon/hikâye başlıkları tek kelime ya da iki kelime: *Field Layers*, *Fall '26*.

---

## 2. Logo sistemi

| Öğe | Tanım |
|---|---|
| **İşaret (mark)** | "Dart": öne bakan, ortasından çentikli ok ucu. 4:3 oran (32×24). Tek renk, `currentColor`. |
| **Wordmark** | `STRALE` — Archivo, wght 700, wdth 75 (condensed), harf aralığı 0.18em. |
| **Kilit (lockup)** | İşaret + 10px boşluk + wordmark. Header'da 24px yükseklik. |
| **Koruma alanı** | Her yönde işaret yüksekliğinin ½'si. |
| **Minimum boyut** | İşaret 16px; lockup 72px genişlik. |
| **Yasak** | Döndürme, gradyan, gölge, kontur, rengini paletin dışına çıkarma. |

Kodda: `src/components/sites/strale/icons.tsx` → `StraleMark`, `src/components/sites/strale/logo.tsx` → `StraleLogo`.

---

## 3. Renk paleti

Siyah-beyaz klonun soğukluğu yerine sıcak, kumaş/taş tonlarına dayalı nötr bir palet; tek bir vurgu rengi.

| Token | HEX | Rol |
|---|---|---|
| `ink` | `#151412` | Ana metin, header/footer zemini, birincil butonlar |
| `bone` | `#F5F2EC` | Sayfa zemini |
| `stone` | `#E8E3DA` | Ürün görseli arka planı, kart zemini |
| `sand` | `#D6CFC2` | Ayraçlar, ince çizgiler (açık zeminde) |
| `graphite` | `#645F58` | İkincil metin, kolon başlıkları |
| `ash` | `#A39D93` | Koyu zeminde ikincil metin, placeholder |
| `smoke` | `#2A2825` | Koyu zeminde ayraçlar |
| `rust` (vurgu) | `#A23E1A` | "New" rozeti, odak halkası, aktif durum, kayıt onayı. **Sayfa başına az kullanılır.** |

Kontrast (WCAG):
- `ink` / `bone` ≈ 16.5:1 · `graphite` / `bone` ≈ 5.7:1, `stone` üzerinde ≈ 5.0:1 · `rust` / `bone` ≈ 5.8:1, `stone` üzerinde ≈ 5.1:1 · `ash` / `ink` ≈ 6.8:1 — hepsi AA.

Kural: zeminlerin %90'ı `bone`/`ink`; `rust` hiçbir zaman büyük alan dolgusu değildir.

---

## 4. Tipografi

**Aile:** Archivo (variable, wght 100–900, wdth 62–125) — SIL OFL lisanslı, self-hosted
(`public/sites/strale/fonts/`). Tek ailenin genişlik ekseni hem gövde hem condensed başlıkları karşılar;
klondaki lisanslı Akzidenz-Grotesk dosyaları kaldırılır.

| Stil | Ağırlık / Genişlik | Boyut (mobil → ≥750px) | Satır | Tracking | Kullanım |
|---|---|---|---|---|---|
| Display | 700 / 75% | 34 → 56px | 1.05 | 0.02em, UPPERCASE | Hero başlığı, newsletter başlığı |
| Heading | 600 / 100% | 12 → 15px | 1.5 | 0.12em, UPPERCASE | Bölüm başlıkları, kart başlıkları |
| Body L | 400 / 100% | 12 → 16px | 1.5 | 0.01em | Hero/kart açıklamaları |
| Body | 400 / 100% | 12px | 18px | 0.04em | Varsayılan gövde |
| Label | 500 / 100% | 12px | 18px | 0.12em, UPPERCASE | Nav, CTA, footer linkleri |
| Micro | 500 / 100% | 9 → 10px | 1.5 | 0.14em, UPPERCASE | Kolon başlıkları, rozetler |

CSS sınıfları: `.st-display`, `.st-heading`, `.st-label`, `.st-micro` (`globals.css`).

---

## 5. Layout & grid

Klonun kanıtlanmış iskeleti korunur (ölçüler `docs/research/reigningchamp/page-brief.md`):

- Kırılımlar: `tab` = 750px, `desk` = 990px.
- Kenar boşluğu: 12px (<750) / 32px (≥750).
- Kart oranı 4:5, kart arası 6px (mobil 4px).
- Header 60px, duyuru şeridi 42px.
- Köşe yarıçapı: **0** (keskin, "ok ucu" disiplini). İstisna yok.
- Çizgiler: 1px, açık zeminde `sand`, koyu zeminde `smoke`.

---

## 6. Bileşen dili

| Bileşen | Strale kuralı |
|---|---|
| Duyuru şeridi | `ink` zemin, `bone` metin; sol: kampanya, sağ: kargo bilgisi. |
| Header | Hero üzerinde şeffaf/`bone` metin → scroll/hover'da `bone` zemin + `ink` metin. Lockup solda. |
| Mega menü | `bone` zemin, kolon başlıkları `graphite` micro; görsel + caption sağda. |
| CTA linki | Label stili + 1px alt çizgi, hover'da çizgi `rust`. |
| Ürün kartı | `stone` zemin, "New" rozeti `rust` micro. Ad solda / fiyat sağda. |
| İçerik kartı | Görsel üstüne `ink` → şeffaf gradyan, metin sol alt. |
| Footer | `ink` zemin; başlıklar `ash` micro; newsletter başlığı Display. |
| Odak durumu | 2px `rust` outline, 2px offset. |

### İkonografi
Mevcut 20px ince çizgi ikon seti (arama, çanta, kaydet, hesap) korunur; stroke ağırlığı tutarlı, dolgu yok.

---

## 7. Fotoğraf & hareket

- **Yön:** doğal ışık, sıcak nötr tonlar, malzeme dokusu yakın plan; mimari/peyzaj ile "yön" hissi.
- **Ürün:** düz `stone` fon, 4:5, merkezde, gölge minimum.
- **Video:** sessiz, döngü, yavaş kamera hareketi; metin her zaman sol altta.
- **Hareket:** 200ms ease geçişler; zıplama/elastik efekt yok.

> ⚠️ Geçici durum: bu branch'te görseller ve videolar hâlâ klondaki reigningchamp.com materyalleridir
> (`public/sites/strale/images|video`). Yayına çıkmadan önce Strale çekimleriyle değiştirilmeleri gerekir.

---

## 8. İçerik haritası (ana sayfa)

| # | Bölüm | Strale içeriği |
|---|---|---|
| 1 | Duyuru | "New In: Fall '26 Collection. Shop New" · "Free shipping on orders $75+" |
| 2 | Header | Nav: New In · Clothing · Outerwear · Sweats · Accessories · Shop By |
| 3 | Hero | **Made with Direction** — "Essentials designed with intent. Built to be worn for years." · CTA *Shop the Collection* |
| 4 | Yeni gelenler | "New Arrivals" — 12 ürün, Strale isimlendirmesiyle |
| 5 | İkili kart | *Sweats* — "The foundation of every wardrobe." · *Field Layers* — "Outerwear cut for cold mornings and long days." |
| 6 | Kategori | T-Shirts · Pants · Knitwear · Shirts · Accessories |
| 7 | Video banner | **Motion** — "Technical layers for training and everyday wear." |
| 8 | Son görüntülenen | Boş durum metni |
| 9 | Footer | Strale Studio / Support kolonları + **The List** newsletter |

---

## 9. Varsayımlar (onay bekleyen)

Bunlar marka sahibinden teyit gelene kadar yer tutucudur:
- Satış dili İngilizce, para birimi USD.
- Fiyatlar klondaki fiyat bandında tutuldu (premium segment).
- Sosyal medya hesapları: `@strale.studio` (Instagram), `@stralestudio` (X), Facebook kaldırıldı.
- Domain: `strale.studio`; adres bilgisi kaldırıldı.
- Mağaza/ürün/koleksiyon sayfaları henüz yok → tüm iç linkler "Coming soon" sayfasına düşer.
