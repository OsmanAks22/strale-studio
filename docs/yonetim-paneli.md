# Yönetim paneli (`/yonetim`)

Ürünleri, stoku, fiyatları ve fotoğrafları tarayıcıdan (telefon dahil) yönetmek için şifreli panel.
Adres: `https://<site-adresi>/yonetim`

## Nasıl çalışır?

- Ürünler, stok, ayarlar ve siparişler **Supabase** veritabanında; fotoğraflar **Supabase Storage**'da durur.
- **Kaydet ve yayınla** dediğinizde değişiklikler hemen kaydedilir ve sitede **anında** görünür (sayfalar bir sonraki
  ziyarette yenilenir; site yeniden derlenmez).
- Kaydetmeden önce yaptığınız her şey yalnızca tarayıcınızdadır; **Değişiklikleri at** ile geri alabilirsiniz.
- Siz düzenlerken sipariş gelir de stok düşerse, kaydederken değişiklikleriniz son listeyle otomatik birleştirilir;
  satılan adetler kaybolmaz. Başka bir cihazdan kayıt yapılmışsa panel üzerine yazmadan önce sorar.
- **Geçmiş** sekmesi ürün, stok ve ayar değişikliklerini listeler.

## Kurulum

Bkz. [`KURULUM.md`](KURULUM.md) — Supabase'i Vercel'e bağlamak ve `ADMIN_PASSWORD` eklemek yeterli.
Giriş: `/yonetim` → şifre. Oturum 7 gün açık kalır; **Çıkış** ile kapatabilirsiniz.

<details>
<summary>Veritabanı olmadan (eski yöntem: GitHub)</summary>

Veritabanı bağlı değilse panel `products.json`, `store-settings.json` ve fotoğrafları GitHub reposuna commit eder;
Vercel her kayıtta siteyi yeniden derler (1–2 dakika). Bunun için Vercel'e `GITHUB_TOKEN` eklenmelidir: GitHub →
Settings → Developer settings → Fine-grained tokens → yalnızca bu repo; izinler **Contents: Read and write** ve
**Commit statuses: Read-only**. İsteğe bağlı `GITHUB_BRANCH` (varsayılan: sitenin derlendiği dal). Bu modda
siparişler kaydedilmez, WhatsApp'a gider.
</details>

## Sekmeler

Siparişler, Haber Ver Listesi, İndirim Kodları ve Mağaza Ayarları sekmeleri için bkz. [`siparis-sistemi.md`](siparis-sistemi.md).

| Sekme | Ne işe yarar |
|---|---|
| **Ürünler & Stok** | Tüm ürünler tek listede. Fiyat ve stok satırdan düzenlenir; **Satıldı −1** WhatsApp siparişinden sonra stoğu düşürür. ⤒ ↑ ↓ ile sıra (ana sayfa ilk 12 stoktaki ürünü gösterir), ⧉ ile başka renk için kopya. Filtreler: Stokta, Az kaldı, Tükendi, Taslak, Eksikli, Kaydedilmemiş. Çoklu seçimle yayınla / taslağa al / % fiyat değiştir / sil. |
| **Ürün düzenleme** | Ürüne tıklayınca açılır. Ad, renk, kategori, fiyatlar (indirim yüzdesi otomatik), bedenler (hazır setler), **beden bazlı stok** (tükenen beden sitede seçilemez), durum/kusur notu, kumaş, kaynak, stok kodu, taslak. Fotoğraf ekleme, kırpma, sıralama, kart görseli (★) seçme, yapay zekâ (AI) işareti. |
| **Toplu Fotoğraf** | Çok sayıda fotoğrafı bir kerede yükleyin. Dosya adı ürün adresini içeriyorsa (`yun-polar-ceket-kahve-2.jpg`) ürün kendiliğinden seçilir; eşleşmeyenler için listeden seçin veya “Yeni taslak ürün” oluşturun. Fotoğrafı olmayan ürünler altta listelenir. |
| **Kontrol** | Eksik/hatalı bilgileri listeler: fotoğraf yok, kumaş boş, kusur notu eksik, önceki fiyat hatalı, sadece AI görseli var vb. Hatalı ürünler kaydedilemez, uyarılar kaydı engellemez. |
| **Excel / CSV** | Tüm ürünleri Excel'de açılan tabloya indirin, düzenleyip geri yükleyin (önce önizleme gösterir). Stok sayımı ve toplu fiyat güncellemesi için pratik. |
| **Geçmiş** | Son kayıtlar ve GitHub bağlantıları. |

## Fotoğraflar

- Telefonla çekilen fotoğraflar tarayıcıda otomatik **4:5 kırpılır ve 1200×1500'e küçültülür** (yükleme hızlı, site hızlı)
  ve doğrudan Supabase Storage'a yüklenir.
  “Kırp” ile sürükleyerek ortalayabilir, yakınlaştırabilir, döndürebilirsiniz.
- “Kırpılmamış orijinali de sakla” işaretliyse orijinal (en fazla 2000 px) de saklanır (Storage'da `orijinal/`). Yapay zekâ ile packshot / manken görseli üretmek isterseniz kaynak olarak bu kullanılır (bkz. `docs/products/README.md`).
- iPhone HEIC fotoğrafları bazı tarayıcılarda açılmaz; Ayarlar → Kamera → Formatlar → **En Uyumlu** seçin ya da JPEG gönderin.
- Bir ürün silinince veya fotoğrafı kaldırılınca, artık hiçbir ürünün kullanmadığı fotoğraflar (ve orijinalleri) da silinir.
- **Kural:** Başka markanın logosu/etiketi görünen ürün listelenmez; logo görselden silinmez.

## Taslak ürünler

Taslak ürün sitede hiçbir yerde görünmez (listede, aramada, ürün sayfasında). Adı/fiyatı eksik olsa bile kaydedilebilir;
yayınlamadan önce Kontrol sekmesindeki uyarıları giderin.

## Spreadsheet betiği ile birlikte kullanım

`npm run import-products -- <dosya.csv>` panelle uyumludur: tablodaki satırlar aynı adresteki (ad + renk) ürünü
günceller; panelde eklenen fotoğraflar, taslak durumu, stok kodu ve beden stokları korunur; tabloda olmayan ürünler
silinmez (silmek için `--replace`). Yeni sütunlar: `beden_stok` (`S:2|M:0|L:3`), `stok_kodu`, `taslak` (`evet`).
Ortamda `DATABASE_URL` (Supabase bağlantısı) varsa betik doğrudan veritabanına yazar; sonra panelde
**Siteyi yenile**'ye basın. Yoksa `products.json` dosyasını günceller.

## Kendi bilgisayarınızda

`.env.local` dosyasına `ADMIN_PASSWORD=...` ve (canlı veriyle çalışmak için) `DATABASE_URL`, `SUPABASE_URL`,
`SUPABASE_SECRET_KEY` ekleyip `npm run dev` çalıştırın. Veritabanı tanımlı değilse panel repodaki dosyalara doğrudan
yazar (yerel mod); değişiklikleri sonra git ile commit edin.

## Güvenlik

- Şifre sunucuda kontrol edilir; oturum imzalı, `httpOnly` bir çerezde tutulur. Yanlış şifre denemeleri yavaşlatılır.
- Panel arama motorlarına kapalıdır (`noindex`).
- Token yalnızca Vercel'deki ortam değişkenindedir, tarayıcıya hiç gönderilmez.
