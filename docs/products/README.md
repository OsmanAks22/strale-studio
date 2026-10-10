# Ürünleri siteye yükleme

1. `urun-sablonu.csv` dosyasını Excel / Google Sheets ile açın, örnek satırları silip her ürün için bir satır doldurun
   ve CSV olarak kaydedin (virgül veya noktalı virgül ayraçlı olabilir).
2. Ürün fotoğraflarını `public/sites/strale/products/` klasörüne koyun; dosya adını `foto_dosyasi` sütununa yazın.
3. Çalıştırın:

   ```bash
   npm run import-products -- docs/products/urun-listesi.csv
   ```

   Script hataları (eksik fiyat, bilinmeyen kategori) ve uyarıları (bulunamayan fotoğraf, açıklamasız kusur) listeler,
   sonra `src/components/sites/strale/products.json` dosyasını yazar. Ürün ve koleksiyon sayfaları buradan üretilir.

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
| `foto_dosyasi` | Kendi çekiminiz; 4:5 oran, düz açık zemin, en az 1200×1500 px. Boşsa "Fotoğraf yakında" görünür. |
| `not` | Kusur açıklaması veya ek bilgi. |

Ürün sırası = sitede görünme sırası. En yeni ürünleri en üste koyun; ana sayfadaki "Bu Hafta Gelen Stoklar" ilk 12 ürünü gösterir.

## Satılabilecek ürünler
- Marka etiketi olmayan ya da etiketi sökülmüş fabrika fazlası ürünler.
- Ürün üzerinde (baskı, nakış, düğme, fermuar başı, iç etiket) **başka markaya ait logo veya isim bulunmamalı.**
- Logolu ürün ancak marka sahibinin yazılı izniyle satılabilir.
