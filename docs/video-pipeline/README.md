# Video üretim pipeline'ı: Higgsfield API

Ana sayfa hero videosu gibi site videoları burada **spec dosyası** olarak tutulur. Her spec bir videonun kararlarını, ortak stil satırını, API ayarlarını ve plan (shot) prompt'larını içerir.

| Dosya | Ne işe yarar |
|---|---|
| `hero-kapadokya.json` | Ana sayfa hero: Kapadokya bozkırı, sonbahar altın saati, insansız, sıcak 35mm film, 6 planlı 15 sn montaj |
| `../../scripts/higgsfield_video.py` | Spec'i API'ye gönderir, take'leri indirir, seçilen take'i siteye hazırlar |

## Model: Kling 3.0 Standard (`kling-video/v3.0/std/text-to-video`)

- `multi_shots: true` ile `multi_prompt` alanına en fazla **6 plan** verilir. Her planın prompt'u en fazla 512 karakter olabilir ve kendi süresi vardır. Toplam süre en fazla 15 sn. Montaj **tek çağrıda, tek klip** olarak gelir, ayrıca birleştirme gerekmez.
- `sound: "off"`: site videosu sessiz oynar.
- `aspect_ratio`: `16:9`, `9:16` veya `1:1`. Mobil hero 4:5 olduğu için 16:9 video ortadan kırpılır. Önemli öğeleri kadrajın ortasında tutun.
- `cfg_scale` (0–1, varsayılan 0.5): yükseldikçe prompt'a daha sıkı uyar ama doğallık azalır.
- **Fiyat:** $0.042/sn (Ekim 2026, %50 indirimli). 15 sn'lik take ≈ **$0.63**.

## Akış

```bash
npm run video:generate -- docs/video-pipeline/hero-kapadokya.json --dry-run    # istek + maliyet, API çağrısı yok
npm run video:generate -- docs/video-pipeline/hero-kapadokya.json              # 1 take ≈ $0.63
npm run video:generate -- docs/video-pipeline/hero-kapadokya.json --takes 2 --budget 1.5
npm run video:generate -- docs/video-pipeline/hero-kapadokya.json --finalize temp/higgsfield/video/hero-kapadokya-1.mp4
```

1. **Önce dry-run** ile prompt'u ve maliyeti kontrol edin.
2. **Tek take üretin** ve izleyin. Beğenmediğiniz planın prompt'unu spec'te düzeltip yeni take alın. Her seferinde tek değişiklik yapın.
3. **Seçilen take'i `--finalize` ile hazırlayın.** Plan kesmelerini bulup her birine `output.crossfade` sn'lik geçiş koyar; `output.loop` açıksa sonu başa eritir (video her geçiş kadar kısalır). Sesi atar, H.264 + faststart'a çevirir, 1920 genişliğe ölçekler ve poster karesini çıkarır. Çıktı `public/sites/strale/video/hero.mp4` ve `hero-poster.jpg` olarak yazılır.
4. Her ücretli çağrı `temp/higgsfield/video/log.jsonl` dosyasına yazılır. Gerçek bakiye: [console.higgsfield.ai](https://console.higgsfield.ai/dashboard).

## Prompt yazım kuralları (öğrenilenler)

- **Stil satırı tek ve ortak** (`style`): film stoku, renk paleti, ışık, kare hızı ve yasaklar (insan, yazı, logo, balon, araç). Her planın sonuna eklenir. Böylece planlar arasında renk ve doku tutarlı kalır.
- **Plan prompt'u tek cümle:** plan tipi (geniş / yakın / statik), konu, ışık, kamera hareketi.
- **Metin alanı:** hero yazısı sol altta durur. Son planda bunu açıkça istiyoruz ("lower left falls into soft shadow").
- **Döngü:** video sessiz döngüde oynar. Son plan ile ilk plan aynı amber altın saatte olsun; pembe alacakaranlık başa dönüşte sıçrama yapar.
- **Akış:** kamera yönünü planlar boyunca aynı tutun (hep sağa) ve her plana bir sonrakinin ipucunu koyun (uzakta toz → atlar → toz içinde otlar).
- Kling arka ışıkta sık sık yeşil lens yansıması (flare) ekliyor; yasaklara "no lens flare" yazmak işe yaramıyor (take 3 daha kötü çıktı). Asıl sebep güneşin kadrajda olması.
- Kapadokya'da AI sık sık sıcak hava balonu ekler. Yasaklar listesinde tutun.
