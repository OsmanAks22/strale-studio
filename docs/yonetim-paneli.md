# Yönetim paneli (`/yonetim`)

Ürünleri, stoku, fiyatları ve fotoğrafları tarayıcıdan (telefon dahil) yönetmek için şifreli panel.
Adres: `https://<site-adresi>/yonetim`

## Nasıl çalışır?

- Panel ürün listesini (`src/components/sites/strale/products.json`) ve fotoğrafları doğrudan GitHub reposundan okur.
- **Kaydet ve yayınla** dediğinizde tüm değişiklikler (ürünler + yeni fotoğraflar + silinen fotoğraflar) tek bir commit
  olarak GitHub'a yazılır. Vercel bunu görüp siteyi yeniden derler; 1–2 dakika içinde canlıda olur. Panelin üst
  çubuğu yayın bitince “sitede yayında ✓” yazar.
- Kaydetmeden önce yaptığınız her şey yalnızca tarayıcınızdadır; **Değişiklikleri at** ile geri alabilirsiniz.
- Aynı anda iki yerden düzenleme yapılırsa panel bunu fark eder ve üzerine yazmadan önce sorar.
- Geçmiş sekmesi son değişiklikleri gösterir; bir kaydı geri almak için GitHub'daki commit'te “Revert” kullanılabilir.

## Kurulum (bir kez)

### 1. GitHub token'ı oluşturun
1. GitHub → sağ üst profil → **Settings → Developer settings → Personal access tokens → Fine-grained tokens →
   Generate new token**.
2. *Repository access*: **Only select repositories** → `OsmanAks22/strale-studio`.
3. *Permissions → Repository permissions*:
   - **Contents: Read and write** (ürünleri ve fotoğrafları yazmak için)
   - **Commit statuses: Read-only** (“sitede yayında” bilgisini okumak için)
4. Son kullanma tarihini seçin (en fazla 1 yıl; bitince yenisini oluşturup aşağıdaki değeri güncelleyin) ve token'ı kopyalayın.

### 2. Vercel'e ortam değişkenlerini ekleyin
Vercel → **strale-studio** projesi → **Settings → Environment Variables**:

| Ad | Değer | Not |
|---|---|---|
| `ADMIN_PASSWORD` | Panel şifresi | Uzun ve tahmin edilemez olsun (en az 12 karakter). Değiştirince herkesin oturumu kapanır. |
| `GITHUB_TOKEN` | 1. adımdaki token | Kimseyle paylaşmayın, repoya yazmayın. |
| `GITHUB_BRANCH` | Panelin yazacağı dal, ör. `main` | Boş bırakılırsa sitenin derlendiği dal kullanılır. |
| `GITHUB_REPO` | `OsmanAks22/strale-studio` | İsteğe bağlı; Vercel bunu kendisi bilir. |
| `DATABASE_URL` | Neon bağlantısı | Siparişler için; Vercel Storage → Neon eklenince otomatik gelir (bkz. siparis-sistemi.md). |

Değişkenleri ekledikten sonra **Deployments → en son deployment → Redeploy** yapın.

> Önemli: Panel hangi dala yazıyorsa Vercel o dalı yayınlar. Canlı site `main`'den yayınlanıyorsa `GITHUB_BRANCH=main`
> olmalı; aksi halde değişiklikler sadece önizleme adresinde görünür.

### 3. Giriş
`/yonetim` adresini açın, şifreyi girin. Oturum 7 gün açık kalır; **Çıkış** ile kapatabilirsiniz.

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

- Telefonla çekilen fotoğraflar tarayıcıda otomatik **4:5 kırpılır ve 1200×1500'e küçültülür** (yükleme hızlı, site hızlı).
  “Kırp” ile sürükleyerek ortalayabilir, yakınlaştırabilir, döndürebilirsiniz.
- “Kırpılmamış orijinali de sakla” işaretliyse orijinal (en fazla 2000 px) `docs/products/fotograflar/` klasörüne de
  yazılır. Yapay zekâ ile packshot / manken görseli üretmek isterseniz kaynak olarak bu kullanılır (bkz. `docs/products/README.md`).
- iPhone HEIC fotoğrafları bazı tarayıcılarda açılmaz; Ayarlar → Kamera → Formatlar → **En Uyumlu** seçin ya da JPEG gönderin.
- Bir ürün silinince veya fotoğrafı kaldırılınca, artık hiçbir ürünün kullanmadığı site fotoğrafları da repodan silinir.
- **Kural:** Başka markanın logosu/etiketi görünen ürün listelenmez; logo görselden silinmez.

## Taslak ürünler

Taslak ürün sitede hiçbir yerde görünmez (listede, aramada, ürün sayfasında). Adı/fiyatı eksik olsa bile kaydedilebilir;
yayınlamadan önce Kontrol sekmesindeki uyarıları giderin.

## Spreadsheet betiği ile birlikte kullanım

`npm run import-products -- <dosya.csv>` artık panelle uyumludur: tablodaki satırlar aynı adresteki (ad + renk) ürünü
günceller; panelde eklenen fotoğraflar, taslak durumu, stok kodu ve beden stokları korunur; tabloda olmayan ürünler
silinmez (silmek için `--replace`). Yeni sütunlar: `beden_stok` (`S:2|M:0|L:3`), `stok_kodu`, `taslak` (`evet`).

## Kendi bilgisayarınızda

`GITHUB_TOKEN` tanımlı değilken `npm run dev` ile açılan panel dosyalara doğrudan yazar (yerel mod). `.env.local`
dosyasına `ADMIN_PASSWORD=...` ekleyin; değişiklikleri sonra git ile commit edin.

## Güvenlik

- Şifre sunucuda kontrol edilir; oturum imzalı, `httpOnly` bir çerezde tutulur. Yanlış şifre denemeleri yavaşlatılır.
- Panel arama motorlarına kapalıdır (`noindex`).
- Token yalnızca Vercel'deki ortam değişkenindedir, tarayıcıya hiç gönderilmez.
