# Görsel üretim pipeline'ı: Higgsfield AI Stylist

Sitenin editoryal görselleri (hero, içerik kartları, kategori kartları, mega menü) Higgsfield **AI Stylist** ile üretilir.
Bu klasör o işin bilgi birikimini ve takip dosyalarını tutar.

| Dosya | Ne işe yarar |
|---|---|
| `README.md` | Bu doküman: araç bilgisi, kurallar, adım adım akış |
| `shot-list.json` | Sitedeki her görsel alanı (slot): id, kullanıldığı yer, hedef boyut, kırpma yönü, brief, kıyafet / poz / arka plan seçimi |
| `../../scripts/ingest-generated-images.mjs` | İndirilen görselleri slot boyutuna kırpıp `public/sites/strale/` altına yazar |

Kaynak: [AI Stylist: Recreate Any Outfit with Try-On](https://higgsfield.ai/blog/AI-Stylist-Recreate-Any-Outfit-with-Try-On)

---

## 1. Araç hakkında bilinenler

AI Stylist, Higgsfield içinde **Apps → AI Stylist** altında çalışan bir web uygulaması. Akışı şöyle:

1. **Fotoğraf yükle.** Bir kişinin (manken / "subject") fotoğrafı. Tek kural: temiz, ışığı okunur, bulanıklığı az bir görsel ("clarity improves consistency").
2. **Kıyafet seç.** İki yol var:
   - **A. Hazır outfit preset'i:** tek seçimde komple görünüm.
   - **B. Parça parça kur:** Headwear, Outerwear, Base, Pants, Footwear, Accessories kategorilerinden seç.
3. **Poz preset'i seç.** Beden dili görselin tonunu belirler (casual / editoryal / ürün odaklı).
4. **Arka plan preset'i seç.** Sade, minimal fon kıyafeti öne çıkarır. Dokulu veya mekân fonu hikâye katar.

**Blogda olmayanlar** (UI'da kontrol edip buraya not edin):

- Çıktı çözünürlüğü ve formatı ("publish-ready" deniyor, rakam yok)
- Kredi ve fiyat, ticari kullanım hakları (planınıza göre kontrol edin)
- Kendi ürün fotoğrafımızı kıyafet referansı olarak yükleyip yükleyemediğimiz
- Altta hangi modelin çalıştığı
- **API:** AI Stylist için herkese açık bir API bulamadık. Bu yüzden üretim adımı manuel (web arayüzü), sonrası otomatik.

> Bu belirsizlikler netleşince bu bölümü güncelleyin. Özellikle "kendi kıyafetimizi yükleme" mümkünse ürün sadakati büyük ölçüde artar.

## 2. Ne AI Stylist ile, ne değil

| Slot tipi | Araç | Neden |
|---|---|---|
| Hero / video poster, içerik kartları, kategori kartları, mega menü | `ai-stylist` | Mankenli, atmosferli editoryal görsel. Try-on'un tam işi. |
| New Arrivals ürün kartları (12 adet) | `packshot` | Mevcut tasarım hayalet manken / düz çekim, açık gri fon, **gerçek ürün**. AI try-on ürünü birebir göstermez. Satılan ürünün görseli gerçek olmalı (iade ve güven riski). Gerçek çekim ya da ürün fotoğrafından fon temizleme ile hazırlanır. |
| Hero ve performance **videoları** | kapsam dışı | Şimdilik sadece poster kareleri üretiliyor. Video için ayrı bir akış kurulacak. |

## 3. Tutarlılık kuralları (marka dili)

1. **Tek manken (subject-a).** Tüm editoryal görseller aynı baz fotoğraftan üretilir. Baz fotoğraf: tam boy, önden, nötr ve sade kıyafet, eşit ışık, düz fon, en az 2000 px uzun kenar. `temp/higgsfield/_subject-a.jpg` olarak saklayın. Gerçek bir kişiyse **yazılı model izni** alın.
2. **Her denemede tek değişken.** Önce kıyafeti sabitleyin, sonra pozu, sonra fonu. Aynı anda üçünü değiştirmeyin (blogun ana tavsiyesi).
3. **Poz kıyafetin havasına uysun.** Sweat seti → oturur, rahat. Dış giyim → editoryal ayakta. Kategori kartı → ürün odaklı, önden.
4. **Fon kıyafetle yarışmasın.** Kategori ve menü kartları: hepsi **aynı** açık gri stüdyo fonu (ızgarada bütünlük). İçerik kartları ve hero: mekân fonu serbest.
5. **Metin alanını boş bırakın.** Hero ve içerik kartlarında yazı sol altta durur. O bölge sakin ve koyu tonda kalmalı (brief'lerde belirtildi).
6. **Palet:** sezon renkleri (kahve, antrasit, lacivert, petrol, gri melanj). Neon ve logo yok. AI'ın uydurduğu yazı, logo ve etiketleri reddedin.
7. **Kalite kontrol:** el ve parmaklar, fermuar ve düğme sayısı, yaka simetrisi, kumaş dokusu, ayakkabı çifti aynı mı? Bozuksa yeniden üretin, rötuşla kurtarmaya çalışmayın.

## 4. Adım adım akış

```
shot-list.json  →  Higgsfield AI Stylist (manuel)  →  temp/higgsfield/<slot-id>.png  →  npm run images:ingest  →  public/sites/strale/...
```

1. **Durumu gör:** `npm run images:status`. Her slot `waiting`, `inbox` veya `done` olarak listelenir.
2. **Slot seç.** `shot-list.json` içinden `brief` ve `stylist` (outfit / pose / background) alanlarını okuyun. `reference` alanı, mevcut sitedeki aynı yerin görselidir. Kompozisyon ve kadraj için ona bakın.
3. **Higgsfield'da üretin:** Apps → AI Stylist → `_subject-a` yükle → outfit → poz → fon. Birkaç varyasyon alın ve en iyisini seçin.
4. **İndirin ve adlandırın:** dosya adı **slot id'si** olmalı, ör. `temp/higgsfield/content-sweats.png` (`.png`, `.jpg`, `.jpeg`, `.webp` kabul edilir). `temp/` git'e girmez.
   - Kaynağı hedef boyuttan büyük indirin. Hero ve poster için ≥1920×1080 gerekir. Küçükse Higgsfield'ın upscaler'ından geçirin. Betik küçük kaynakta uyarı verir.
   - Kaynağın oranı hedefle aynı olmak zorunda değil. Betik, slotun `gravity` değerine göre (left / right / top / bottom / center) kırpar.
5. **İçeri alın:** `npm run images:ingest` (tek slot için `npm run images:ingest -- content-sweats`). Çıktı tam boyutta, kaliteli JPG olarak `public/sites/strale/<output>` yoluna yazılır.
6. **Kontrol edin:** `npm run dev` ile sayfada yerinde bakın. Yazı okunuyor mu, kırpma doğru mu?
7. **Kaydedin:** görselleri commit'leyin. Seçimde kullandığınız preset adlarını `shot-list.json` içindeki `stylist` alanına geri yazın. Böylece bir sonraki sezon aynı görünüm tekrar üretilebilir.

## 5. Siteye geçiş

Görseller `public/sites/strale/` altında, mevcut `public/sites/reigningchamp/` ile **aynı klasör yapısında** toplanır. Böylece:

- Üretim sürerken site eski görsellerle çalışmaya devam eder.
- Tüm slotlar `done` olduğunda tek satırlık değişiklik yeterli: `src/components/sites/reigningchamp/data.ts` içindeki `ASSET_ROOT` değeri `"/sites/strale"` yapılır. Fontlar ve videolar da o klasöre taşınmalı veya kopyalanmalı.

## 6. Slot listesi (özet)

| Grup | Adet | Boyut | Not |
|---|---|---|---|
| Video posterleri | 3 | 1920×1080, 750×938 | hero sol altta metin |
| İçerik kartları | 2 | 1080×1350 | sol altta metin |
| Mega menü | 4 | 720×900 | 336×420'de görünür, sade siluet |
| Kategori kartları | 5 | 750×938 | hepsi aynı stüdyo fonu |
| Ürün kartları | 12 | 720×900 | `packshot`, AI Stylist değil |

Detaylar ve brief'ler için `shot-list.json` dosyasına bakın.

## 7. Öğrenilenler (sürekli güncelleyin)

- _Higgsfield'da denedikçe buraya ekleyin: hangi preset neyle iyi sonuç verdi, kredi maliyeti, çözünürlük, tekrar eden hatalar._
