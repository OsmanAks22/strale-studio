# STRALE — Kurulum (buradan başlayın)

Mağaza **Supabase** (veritabanı + fotoğraf depolama) ve **Vercel** (site) üzerinde çalışır. GitHub token'ı
gerekmez. Bu adımlar bir kez yapılır; toplam 10–15 dakika.

## 1. Supabase'i bağlayın

**En kolay yol: Vercel üzerinden**
1. Vercel → **strale-studio** projesi → **Storage** sekmesi → **Create Database** → **Supabase**.
2. Plan: **Free**. Bölge: **Frankfurt (eu-central-1)** (Türkiye'ye ve sitenin sunucularına en yakın).
3. Oluşunca **Connect Project** → `strale-studio` → tüm ortamlar (Production, Preview, Development) → **Connect**.

Vercel; veritabanı bağlantısını (`POSTGRES_URL`), proje adresini (`SUPABASE_URL`) ve gizli anahtarı
(`SUPABASE_SECRET_KEY` ya da eski adıyla `SUPABASE_SERVICE_ROLE_KEY`) projeye kendisi ekler.

<details>
<summary>Supabase'de projeyi kendiniz açtıysanız</summary>

Vercel → strale-studio → **Settings → Environment Variables**'a şunları ekleyin:

| Ad | Nereden |
|---|---|
| `DATABASE_URL` | Supabase → **Connect** → **Transaction pooler** bağlantı adresi (port **6543**), şifreyi yerine yazarak |
| `SUPABASE_URL` | Supabase → Project Settings → **Data API** → Project URL (`https://xxxx.supabase.co`) |
| `SUPABASE_SECRET_KEY` | Supabase → Project Settings → **API Keys** → **Secret key** (`sb_secret_…`) |

</details>

## 2. Panel şifresini ekleyin

Vercel → strale-studio → **Settings → Environment Variables**:

| Ad | Değer |
|---|---|
| `ADMIN_PASSWORD` | Panel şifreniz (en az 12 karakter, tahmin edilemez) |
| `CRON_SECRET` | *İsteğe bağlı:* uzun rastgele bir metin. Günlük bakım işini yalnızca Vercel'in tetikleyebilmesini sağlar. |

## 3. Yeniden yayınlayın

Vercel → **Deployments** → en üstteki → **⋯ → Redeploy**.

## 4. Paneli açın

`https://<site-adresi>/yonetim` → şifre. İlk açılışta mevcut ürünler ve mağaza ayarları veritabanına **otomatik
aktarılır**. Sonra **Mağaza Ayarları**'nda WhatsApp numarası, satıcı bilgileri ve IBAN'ı doldurun.

## 5. İsteğe bağlı

- Vercel → **Analytics** → Enable (çerezsiz ziyaretçi istatistikleri).

---

## Kendiliğinden çalışanlar

- **Anında yayın:** Panelde kaydettiğiniz ürün, stok, fiyat ve ayar değişiklikleri sitede hemen görünür; site yeniden
  derlenmez. Siparişte stok anında düşer.
- **Fotoğraflar** Supabase Storage'daki `urunler` klasörüne yüklenir (ilk yüklemede klasör kendiliğinden açılır).
- **Günlük bakım** (her gün sabah 06:00 civarı, TR saati; `vercel.json`):
  - Supabase'in ücretsiz planı 7 gün hareketsiz kalan projeyi uyutur; bu iş her gün veritabanına uğrayarak bunu önler.
  - Haber verilmiş “Gelince haber ver” kayıtlarını 6 ay sonra, cevapsızları 1 yıl sonra siler (KVKK metnindeki söz).
  - Hiçbir ürünün kullanmadığı fotoğrafları (3 günden eski) siler.
- **Sunucu bölgesi:** Frankfurt (`fra1`); Türkiye'deki müşterilere ve Supabase'e yakın.

## Supabase ücretsiz plan

| | Sınır | Bizim için |
|---|---|---|
| Veritabanı | 500 MB | On binlerce sipariş |
| Dosya | 1 GB | ≈ 800 ürün fotoğrafı (orijinalleriyle) — panelde “orijinali sakla”yı kapatırsanız iki katı |
| Hareketsizlik | 7 gün sonra uyku | Günlük bakım önler; uyursa Supabase panelinden “Restore” |

Büyüyünce Supabase Pro (aylık ~25 $) bu sınırları kaldırır.

## Bilmekte fayda var

- Supabase'in kendi panelinde (Table Editor) tabloları doğrudan görüp düzenleyebilirsiniz: `orders` (siparişler),
  `products` (ürünler), `stock_alerts` (haber ver listesi), `discount_codes`. Orada değişiklik yaparsanız
  **/yonetim → “Siteyi yenile”** ile siteye hemen yansıtın (yoksa en geç 1 saat içinde yansır).
- Repodaki `products.json` ve `store-settings.json` artık yalnızca ilk kurulumda veritabanına aktarılan başlangıç
  verisidir; veritabanı bağlıyken site onları kullanmaz.
- Veritabanı bağlı değilken site eskisi gibi bu dosyalardan çalışır (siparişler kaydedilmez, WhatsApp'a gider).

Ayrıntılar: [Sipariş sistemi](siparis-sistemi.md) · [Yönetim paneli](yonetim-paneli.md)
