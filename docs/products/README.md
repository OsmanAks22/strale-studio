# Ürün listesi nasıl doldurulur

`urun-sablonu.csv` dosyasını Excel / Google Sheets ile açıp her ürün için bir satır doldurun. Dolu dosya
`src/components/sites/strale/data.ts` içindeki `newArrivals` listesine aktarılır.

| Sütun | Açıklama |
|---|---|
| `ad` | Markasız ürün adı (ör. "Yün Polar Ceket"). **Başka marka adı yazılmaz.** |
| `renk` | Kartta adın sonuna eklenir ("— Kahve"). |
| `kategori` | Tişört · Pantolon · Triko · Gömlek · Dış Giyim · Eşofman & Sweat · Aksesuar |
| `indirimli_fiyat` | Satış fiyatı, TL, tam sayı. |
| `onceki_fiyat_son30gun_en_dusuk` | Üstü çizili fiyat. Yönetmelik gereği indirimden önceki **son 30 günde bu mağazada uygulanan en düşük fiyat** olmalı. Bilinmiyorsa boş bırakın; o üründe indirim rozeti gösterilmez. |
| `stok` | Adet. 3 ve altında kartta "Son N adet" yazar. |
| `bedenler` | `|` ile ayrılmış: `S|M|L`. |
| `durum` | `kusursuz` veya `hafif-kusurlu`. Hafif kusurlu ise `not` sütununda kusuru açıkça yazın. |
| `kumas` | Etiketteki içerik oranı. |
| `mensei_uretim` | Üretim yeri ve kaynağı (ör. "Türkiye - AB siparişi fazlası"). |
| `foto_dosyasi` | Kendi çekiminiz; 4:5 oran, düz açık zemin, en az 1200×1500 px. |
| `not` | Kusur açıklaması veya ek bilgi. |

## Satılabilecek ürünler
- Marka etiketi olmayan ya da etiketi sökülmüş fabrika fazlası ürünler.
- Ürün üzerinde (baskı, nakış, düğme, fermuar başı, iç etiket) **başka markaya ait logo veya isim bulunmamalı.**
- Logolu ürün ancak marka sahibinin yazılı izniyle satılabilir.
