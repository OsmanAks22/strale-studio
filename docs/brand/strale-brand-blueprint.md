# STRALE — Brand Design Blueprint

> Durum: v2 · Türkçe/TL · 2026-10-09 · `claude/gracious-davinci-ng1ac1` branch'i
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
1. **Tagline:** Amaçla tasarlandı. (uluslararası kullanım: *Made with direction.*)
2. **Destek cümlesi:** Yıllarca giyilmek için, bir amaçla tasarlanmış temel parçalar.
3. **Kanıt noktaları:** ağır gramajlı pamuk, merino, ölçülü kalıplar (Slim / Standard / Relaxed), uzun ömür garantisi.

### Yazım kuralları
- Navigasyon, etiket, CTA: **BÜYÜK HARF**, geniş harf aralığı.
- Gövde metni: cümle düzeni (sentence case).
- Site dili Türkçe; okuyucuya "sen" diye hitap edilir.
- Ürün adı formatı: `<Model> <Kumaş> <Kalıp> <Tip>` → *Point Merinos Slim Tişört*. Model adları (Vane, Ridge, Arc, Quill, Point) İngilizce kalır.
- Seri adları İngilizce ve büyük harfle yazılır: *FIELD*, *MOTION*, *ESSENTIALS*, *THE LIST*.
- ⚠️ `lang="tr"` altında CSS büyük harf dönüşümü "i"yi "İ" yapar. İçinde "i" geçen İngilizce kelimeler kaynakta zaten BÜYÜK HARFLE yazılmalı.
- Fiyat: `Intl.NumberFormat("tr-TR", TRY)` → **₺13.900** (kuruş gösterilmez).

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
| 1 | Duyuru | "Yeni Sezon: Sonbahar '26. Keşfet" · "₺2.500 üzeri siparişlerde ücretsiz kargo" |
| 2 | Header | Nav: Yeni Gelenler · Giyim · Dış Giyim · Sweat · Aksesuar · Keşfet; Teslimat: Türkiye / Uluslararası |
| 3 | Hero | **Amaçla Tasarlandı** — "Yıllarca giyilmek için, bir amaçla tasarlanmış temel parçalar." · CTA *Koleksiyonu Keşfet* |
| 4 | Yeni gelenler | 12 ürün, ₺2.900–₺13.900 bandı |
| 5 | İkili kart | *Eşofman & Sweat* — "Her gardırobun temeli." · *FIELD Serisi* — "Soğuk sabahlar ve uzun günler için kesilmiş dış giyim." |
| 6 | Kategoriler | Tişört · Pantolon · Triko · Gömlek · Aksesuar |
| 7 | Video banner | **MOTION** — "Antrenmandan gündelik hayata teknik katmanlar." |
| 8 | Son görüntülenenler | Boş durum metni |
| 9 | Footer | Strale Studio / Yardım kolonları + **THE LIST** bülteni (KVKK onay metniyle); yasal linkler: Kullanım Koşulları, KVKK Aydınlatma Metni, Çerez Politikası, Mesafeli Satış Sözleşmesi |

---

## 9. Kararlar & açık konular

**Onaylandı (2026-10-09):**
- Site dili Türkçe (`<html lang="tr">`), para birimi Türk lirası (TRY). URL'ler Türkçe: `/koleksiyonlar/…`, `/urun/…`, `/sayfa/…`.

**Bekleyen:**
- **Sosyal medya:** hesaplar henüz açılmadı. Footer'daki ikonlar gizli; açılınca `src/components/sites/strale/data.ts` → `socialLinks` dizisine eklemek yeterli.
- **Domain:** henüz alınmadı; sitede domain geçmiyor. Alınınca metadata (`metadataBase`) ve e-posta metinlerine eklenecek.
- **Fiyatlar** örnek değerdir; gerçek fiyat listesiyle değiştirilmeli.
- **Ücretsiz kargo eşiği** ₺2.500 (`FREE_SHIPPING_THRESHOLD`).
- **Yasal metinler** (KVKK, Mesafeli Satış, Çerez) linkleri hazır, içerikleri yazılmalı.
- Mağaza/ürün/koleksiyon sayfaları henüz yok → tüm iç linkler "Yakında" sayfasına düşer.
- Logo ve palet seçimi → bkz. bölüm 10.

---

## 10. Alternatifler (seçim bekliyor)

Canlı karşılaştırma: `/marka` sayfası (sitenin gerçek fontuyla). Logo ve palet bağımsız seçilebilir.

**Logo**

| | İşaret | Wordmark | Karakter |
|---|---|---|---|
| **A — Dart** (mevcut) | Çentikli dolu ok ucu | STRALE, condensed 700, geniş aralık | Sportif, keskin; küçük boyutta en okunaklı |
| **B — Twin** | Ardışık iki şevron | STRALE, wide (wdth 125) 500 | Hareket/ritim; daha lüks ve sakin |
| **C — Flight** | Tek kanatlı çizgisel ok | strale, küçük harf 700, sıkı aralık | Modern, samimi, stüdyo/atölye hissi |

**Palet** (hepsi WCAG AA)

| | Zemin | Metin | Ürün zemini | İkincil | Vurgu |
|---|---|---|---|---|---|
| **A — Kemik & Pas** (mevcut) | `#F5F2EC` | `#151412` | `#E8E3DA` | `#645F58` | `#A23E1A` |
| **B — Tebeşir & Orman** | `#F2F1EC` | `#161A16` | `#E3E3DB` | `#5E625B` | `#2F5D46` |
| **C — Sis & Lacivert** | `#F3F4F2` | `#0F1720` | `#E2E5E4` | `#5B6168` | `#1F4E79` |

Seçim yapıldığında yalnızca `globals.css` içindeki `--color-*` token'ları ve `logo.tsx` değişir.
