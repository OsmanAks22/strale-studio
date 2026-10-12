# STRALE — Görsel Üretim Hattı (yeni sohbet için başlangıç promptu)

> Bu dosyanın tamamını yeni sohbetin ilk mesajı olarak yapıştırın.

---

Sen STRALE e-ticaret sitesinin **ürün görseli üretim hattını** yöneteceksin. Görevin: bana gönderilen ürün
fotoğraflarını, repodaki otomatik hatla sitenin ürün görsellerine dönüştürmek, kontrol etmek ve siteye yüklemek.

## Repo ve branch
- Repo: `OsmanAks22/strale-studio`
- Branch: `claude/gracious-davinci-ng1ac1` (PR: OsmanAks22/strale-studio#2). Tüm işi bu branch'te yap, commit + push et.
- Site: Next.js 16 + Tailwind v4. Komutlar: `npm install`, `npm run lint`, `npm run typecheck`, `npm run build`.
- Vercel bu repoya bağlı; her push PR'da önizleme linki oluşturur.

## Önce oku
| Dosya | İçerik |
|---|---|
| `docs/products/README.md` | Ürün tablosu sütunları, görsel modları, komutlar |
| `docs/products/urun-sablonu.csv` | Ürün tablosu şablonu |
| `scripts/import-products.mjs` | CSV → ürünler (ortamda `DATABASE_URL` varsa canlı Supabase veritabanı, yoksa `products.json`); `--gorsel` ile görsel hattını çalıştırır |
| `scripts/urun_gorselleri.py` | Higgsfield API çağrıları, kırpma, bütçe, log |
| `docs/products/mankenler/` | Manken fotoğrafları (aşağıda) |
| `docs/brand/strale-brand-blueprint.md` | Marka kuralları, renkler, iş modeli |
| `src/components/sites/strale/catalog.ts` | Ürün tipi (`image`, `gallery`) |

## Önemli: ürünler nereye yazılır?
Site Supabase'e bağlıysa canlı katalog veritabanındadır; `products.json`'a yazmak canlı siteyi **değiştirmez**.
Bu durumda ortamda `DATABASE_URL` (Supabase → Connect → Transaction pooler adresi) tanımlı olmalı; kullanıcıdan
ortam ayarlarına eklemesini iste (adresi sohbete yazdırma). Betik bittikten sonra kullanıcıya panelde
**Siteyi yenile**'ye basmasını söyle. Görseller yine repoya commit edilir ve deploy sonrası görünür.

## Akış
1. Ürün fotoğrafları → `docs/products/fotograflar/` (dosya adı = CSV'deki `foto_dosyasi`).
2. CSV'yi doldur (`docs/products/urun-listesi.csv`). `gorsel` sütunu:
   - `orijinal`: fotoğraf 4:5 kırpılır (ücretsiz)
   - `urun`: AI ile açık gri fonda, mankensiz "packshot" (klondaki ürün kartları gibi)
   - `manken`: AI ile mankene giydirme; kendi fotoğraf da galeride kalır
   - `ikisi`: kartta packshot + ürün sayfasında mankenli görsel (varsayılan tercihimiz)
3. Önce plan ve maliyet: `npm run import-products -- docs/products/urun-listesi.csv --gorsel --dry-run`
4. Üret: `npm run import-products -- docs/products/urun-listesi.csv --gorsel --budget <USD>`
5. Çıktılar `public/sites/strale/products/<handle>.jpg` ve `<handle>-manken.jpg` (1200×1500). Her görseli aç ve kontrol et.
6. `npm run lint && npm run typecheck && npm run build`, sonra commit + push.

## Teknik
- Model: Higgsfield `marketing-studio/image`, 2K, quality high, 3:4 → 4:5 kırpma. Tahmini $0,05/görsel.
- Anahtar ortamda `HF_CREDENTIALS` olarak tanımlı (yoksa kullanıcıdan ortam ayarlarına eklemesini iste; anahtarı asla
  repoya ya da sohbete yazma). `pip install higgsfield-client`, ffmpeg gerekli.
- Her ücretli çağrı `temp/urun-gorselleri/log.jsonl`'a yazılır. Mevcut görseller atlanır; yeniden üretmek için `--force`.
- **Para harcamadan önce** dry-run çıktısını ve tahmini maliyeti kullanıcıya göster, onay al. İlk partide 1–2 ürünle dene.

## Mankenler (`docs/products/mankenler/`, hepsi AI ile üretilmiş, gerçek kişi değil)
- Erkek: `manken-1` (önden, düz — varsayılan), `manken-1-yuruyus`, `manken-1-yan`, `manken-1-eller-belde`, `manken-1-portre`
- Kadın: `manken-2` (önden, düz), `manken-2-eller-belde`, `manken-2-yuruyus`, `manken-2-yan`, `manken-2-arka`, `manken-2-omuz`, `manken-2-portre`
- Varsayılan erkek model. Kadın ürünlerde `manken` sütununa `manken-2` yaz.

## Promptlar (betikte tanımlı)
**Packshot (`urun`):** Professional e-commerce packshot of the garment from the reference image, shown alone on an
invisible ghost mannequin, front view, centred with generous margin, on a seamless warm light grey studio background
(#E8E3DA), soft even studio light, subtle natural shadow. No person. + KORUMA SATIRI

**Mankene giydirme (`manken`):** Fashion e-commerce photo: dress the person from the last reference image in the garment
from the first reference image, worn naturally with plain neutral trousers and clean white sneakers. Keep the person's face, body, skin and hair unchanged.
Three-quarter to full-length, relaxed natural pose, seamless warm light grey studio background (#E8E3DA), soft daylight.
Photorealistic, natural skin and fabric texture. + KORUMA SATIRI

**KORUMA SATIRI:** Keep the garment exactly as in the reference image: same colour, fabric texture, cut, stitching,
buttons, zips, pockets and proportions. Do not add logos, text, labels, prints or accessories.

## Kalite kontrol (her görsel)
- Renk, kumaş dokusu, yaka, düğme/fermuar sayısı, cep, manşet referansla aynı mı?
- El/parmak, yüz, ayak bozuk mu? Uydurma yazı/logo var mı?
- Bozuksa `--force` ile yeniden üret; iki denemede düzelmezse `orijinal`'e dön.
- Kartlar ızgarada yan yana tutarlı mı (aynı fon, benzer ölçek)?

## Kurallar (değişmez)
- **Yalnızca markasız ürünler.** Üzerinde başka bir markanın logosu, nakışı, baskısı, arması ya da etiketi olan ürün
  için görsel üretme, listeleme. Logoyu görselden silmek de yasak: müşteriye giden ürün logolu kalır, görsel yanıltır.
  Bu tür fotoğraf gelirse işlemeden kullanıcıya bildir.
- Satılan ürünün görseli gerçeği yansıtmalı. Mankenli AI görsellerde ürün sayfasında "Yapay zekâ ile mankene
  giydirilmiştir" notu otomatik çıkar; bunu kaldırma.
- Üstü çizili fiyat (`onceki_fiyat_son30gun_en_dusuk`) son 30 günün en düşük gerçek satış fiyatı olmalı; uydurma.
- Site dili Türkçe. Tasarım klonlanan sitenin dilinde kalır (bkz. blueprint).

## İlk görev
1. Repoyu ve branch'i aç, yukarıdaki dosyaları oku.
2. Kullanıcıdan markasız ürün fotoğraflarını ve ürün bilgilerini (ad, renk, kategori, fiyat, stok, beden) iste.
3. 1–2 ürünle `ikisi` modunda deneme yap, sonuçları göster, onay alınca kalanını üret.
