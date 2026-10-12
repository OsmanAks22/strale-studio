# Ürünleri siteye yükleme

> **Kolay yol:** `/yonetim` panelinden ürün ekleyin, stok/fiyat güncelleyin ve fotoğraf yükleyin (telefondan da olur).
> Kurulum ve kullanım: [`docs/yonetim-paneli.md`](../yonetim-paneli.md). Aşağıdaki tablo + betik yöntemi toplu girişler
> ve yapay zekâ görselleri için hâlâ geçerli; ikisi birlikte kullanılabilir.

1. `urun-sablonu.csv` dosyasını Excel / Google Sheets ile açın, örnek satırları silip her ürün için bir satır doldurun
   ve CSV olarak kaydedin (virgül veya noktalı virgül ayraçlı olabilir).
2. Ürün fotoğraflarını `docs/products/fotograflar/` klasörüne koyun; dosya adını `foto_dosyasi` sütununa yazın.
   Mankene giydirilecek ürünler için manken fotoğraflarını `docs/products/mankenler/` klasörüne koyun
   (`manken-1.jpg`, `manken-2.jpg`…).
3. Her ürün için `gorsel` sütununda sitede ne görüneceğini seçin:

   | `gorsel` | Ne olur | Maliyet |
   |---|---|---|
   | `orijinal` (boşsa bu) | Kendi fotoğrafınız 4:5 kırpılır | Ücretsiz |
   | `urun` | Yapay zekâ ürünü açık gri stüdyo fonunda, mankensiz "packshot" olarak yeniden çeker | ≈ $0,05 |
   | `manken` | Yapay zekâ ürünü `manken` sütunundaki mankene giydirir; kartta bu görsel çıkar, ürün sayfasında kendi fotoğrafınız da durur | ≈ $0,05 |
   | `ikisi` (önerilen) | Kartta (giriş sayfası, listeler) gri fonlu ürün fotoğrafı; ürüne tıklayınca sayfa mankenli görselle açılır | ≈ $0,10 |

4. Çalıştırın:

   ```bash
   # Önce plan ve tahmini maliyet (API çağrısı yok)
   npm run import-products -- docs/products/urun-listesi.csv --gorsel --dry-run
   # Görselleri üret + siteye yükle (varsayılan bütçe sınırı $2)
   npm run import-products -- docs/products/urun-listesi.csv --gorsel --budget 3
   # Sadece fiyat/stok güncellemesi (görsellere dokunmaz)
   npm run import-products -- docs/products/urun-listesi.csv
   ```

   Script hataları (eksik fiyat, bilinmeyen kategori, eksik manken) ve uyarıları (bulunamayan fotoğraf, açıklamasız kusur)
   listeler, görselleri `public/sites/strale/products/` altına yazar, sonra `src/components/sites/strale/products.json`
   dosyasını günceller. Daha önce üretilmiş görseller tekrar üretilmez (yeniden üretmek için `--force`).
   Her ücretli çağrı `temp/urun-gorselleri/log.jsonl` dosyasına yazılır. Yapay zekâ için ortamda `HF_CREDENTIALS`
   (Higgsfield anahtarı) tanımlı olmalı.

| Sütun | Açıklama |
|---|---|
| `ad` | Markasız ürün adı (ör. "Yün Polar Ceket"). **Başka marka adı yazılmaz.** |
| `renk` | Kartta adın sonuna eklenir ("— Kahve"). |
| `kategori` | `Tişört` · `Gömlek` · `Triko` · `Sweatshirt` · `Eşofman` · `Pantolon` · `Dış Giyim` · `Aksesuar` |
| `indirimli_fiyat` | Satış fiyatı, TL (ör. `3490` veya `3.490`). |
| `onceki_fiyat_son30gun_en_dusuk` | Üstü çizili fiyat. Yönetmelik gereği indirimden önceki **son 30 günde bu mağazada uygulanan en düşük fiyat** olmalı. Bilinmiyorsa boş bırakın; indirim rozeti gösterilmez. |
| `stok` | Adet. `0` → ürün listelerde görünmez, sayfasında "Tükendi" yazar. 3 ve altı → "Son N adet". |
| `bedenler` | `|` ile ayrılmış: `S|M|L`, `30|32|34`, tek ebat için `STD`. |
| `durum` | `kusursuz` veya `hafif-kusurlu`. Hafif kusurlu ise `not` sütununa kusuru yazın. |
| `kumas` | Etiketteki içerik oranı. |
| `mensei_uretim` | Üretim yeri ve kaynağı (ör. "Türkiye - AB siparişi fazlası"). |
| `foto_dosyasi` | `docs/products/fotograflar/` içindeki dosya adı. Ürün tek başına, düz ve iyi ışıkta; en az 1200 px. Boşsa "Fotoğraf yakında" görünür. |
| `gorsel` | `orijinal`, `urun`, `manken` veya `ikisi` (yukarıdaki tablo). |
| `manken` | `gorsel` = `manken` / `ikisi` ise kullanılacak manken dosyası (uzantısız). Boşsa `manken-1`. Erkek: `manken-1` (önden, düz duruş), `manken-1-yuruyus`, `manken-1-yan`, `manken-1-eller-belde`, `manken-1-portre` (bel üstü, üst giyim yakın plan); kadın: `manken-2` (önden, düz duruş), `manken-2-eller-belde`, `manken-2-yuruyus`, `manken-2-yan`, `manken-2-arka` (düz arkadan, sırt detayı), `manken-2-omuz` (arkadan, omuz üstü bakış), `manken-2-portre`. |
| `not` | Kusur açıklaması veya ek bilgi. |

Ürün sırası = sitede görünme sırası. En yeni ürünleri en üste koyun; ana sayfadaki "Bu Hafta Gelen Stoklar" ilk 12 ürünü gösterir.

## Yapay zekâ görselleri hakkında
- Yapay zekâ ürünü birebir aynı çizmeyebilir (düğme sayısı, desen, logo yeri). Her görseli yayına almadan önce kontrol edin;
  bozuksa `--force` ile yeniden üretin ya da `orijinal`'e dönün.
- Mankene giydirilmiş görsellerin altında ürün sayfasında "Yapay zekâ ile mankene giydirilmiştir" notu çıkar ve ürünün kendi
  fotoğrafı da gösterilir; müşteri gerçek ürünü her zaman görür.
- Manken gerçek bir kişiyse fotoğrafının bu amaçla kullanılması için yazılı izni gerekir.
