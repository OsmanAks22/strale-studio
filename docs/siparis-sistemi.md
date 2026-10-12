# Sipariş sistemi

Sepet → ödeme sayfası → sipariş kaydı → panelde takip. Müşteri hesap açmaz; sipariş kodu ve telefonunun son 4 hanesiyle
siparişini takip eder.

## Müşteri tarafı

| Sayfa | Ne var |
|---|---|
| Ürün sayfası | Beden seç → **Sepete Ekle**, ♡ favori, tükenen beden için **Gelince haber ver**, WhatsApp'tan soru sor |
| `/sepet` | Adet değiştirme, ücretsiz kargoya kalan tutar, tükenen ürün uyarısı |
| `/odeme` | Teslimat bilgileri (81 il listesi), ödeme yöntemi, indirim kodu, Ön Bilgilendirme Formu + Mesafeli Satış Sözleşmesi onayı (yasal zorunluluk) |
| `/siparis/tamam` | Sipariş kodu, havale seçildiyse IBAN + kopyala, “WhatsApp ile gönder” |
| `/siparis-takip` | Sipariş kodu + telefonun son 4 hanesi → durum adımları, kargo takip linki |
| `/favoriler` | Kalp ile eklenen ürünler (tarayıcıda saklanır) |

Fiyat, indirim, kargo ve stok **her zaman sunucuda** yeniden hesaplanır; tarayıcıdan gelen fiyata güvenilmez.

## Stok

- Sipariş verildiği anda stok veritabanında düşer ve ürün sayfaları hemen güncellenir. Beden bazlı stok tutulan üründe
  o bedenin stoğu düşer.
- Aynı anda gelen siparişler veritabanında sıraya girer (satır kilidi); son adedi iki kişi birden alamaz. Geç kalan
  sipariş “Stok yetmedi, otomatik iptal” notuyla iptal edilir ve müşteriye uyarı gösterilir.
- Panelde sipariş **İptal** veya **İade edildi** yapılınca ürünler stoğa geri eklenir; yeniden açılınca tekrar düşülür.
- Panelde ürün düzenlerken sipariş gelirse kaydetme sırasında değişiklikleriniz son listeyle otomatik birleştirilir;
  satılan adetler kaybolmaz.

## Panel (`/yonetim`)

| Sekme | Ne işe yarar |
|---|---|
| **Siparişler** | Bugünkü sipariş/ciro, hazırlanacaklar, ödeme bekleyen havaleler. Sipariş detayı: ürünler, adres (kopyala), ara / WhatsApp, **sipariş fişi yazdır**, durum, ödeme durumu, kargo firması + takip no (takip no girilince durum “Kargoda” olur), iç not. Hazır WhatsApp mesajları: sipariş onayı, ödeme hatırlatma (IBAN ile), kargoya verildi (takip linkiyle). |
| **Haber Ver Listesi** | “Gelince haber ver” diyen müşteriler ürün/bedene göre gruplu. Ürün stoğa girince “Stokta” etiketi çıkar; “Mesaj gönder” WhatsApp'ı hazır mesajla açar ve kaydı “haber verildi” yapar. |
| **İndirim Kodları** | Yüzde veya tutar indirimi, en az sepet tutarı, son gün, kullanım sınırı; durdur/aç. Kullanım sayısı otomatik artar. |
| **Mağaza Ayarları** | Duyuru çubuğu, WhatsApp/telefon/e-posta/Instagram, satıcı (şirket) bilgileri, kargo ücreti ve ücretsiz kargo sınırı, iade süresi, ödeme yöntemleri, kapıda ödeme ücreti, IBAN, ETBİS bağlantısı. Kaydedince site yeniden derlenir. |

## Kurulum

Bkz. [`KURULUM.md`](KURULUM.md): Supabase'i Vercel'e bağlamak ve `ADMIN_PASSWORD` eklemek yeterli. Sonra panelde
**Mağaza Ayarları**'ndan WhatsApp numarası, satıcı bilgileri ve IBAN'ı girin (**havale seçeneği IBAN girilmeden
müşteriye gösterilmez**). Mesafeli Satış Sözleşmesi ve KVKK metinleri bu bilgileri kullanır; eksikse “[doldurulacak]”
görünür.

Veritabanı bağlı değilken site yine çalışır: sipariş sayfası siparişi kaydetmez, müşteriyi WhatsApp'a yönlendirir;
panelde Siparişler sekmesi kurulum uyarısı gösterir.

### Kartla ödeme (beklemede)
Altyapı hazır; ödeme yöntemi listesine “Kredi / banka kartı” ödeme firması bağlanınca eklenir. Gerekenler: şirket
(şahıs şirketi yeterli), vergi levhası, ödeme firması başvurusu (iyzico / PayTR / Shopier). Onay gelince API
anahtarlarını Vercel'e ekleyip entegrasyonu tamamlarız.

## Yasal kontrol listesi (Türkiye, e-ticaret)
- [ ] Satıcı bilgileri (unvan, adres, vergi no, MERSİS) Mağaza Ayarları'nda dolu
- [ ] **ETBİS** kaydı (Ticaret Bakanlığı, ücretsiz, e-ticarete başlamadan önce zorunlu) → doğrulama bağlantısını ayarlara girin
- [ ] Mesafeli Satış Sözleşmesi ve Ön Bilgilendirme Formu metinleri bir hukukçuya okutuldu
- [ ] Faturalar düzenleniyor (e-Arşiv); sipariş fişi fatura yerine geçmez
- [ ] Toplu SMS/e-posta kampanyası gönderilecekse **İYS** kaydı (“Gelince haber ver” mesajları müşterinin talebine
      cevap olduğu için ticari ileti sayılmaz; genel kampanya mesajı göndermeyin)
- [ ] Sipariş kayıtları yurt dışındaki sunucularda (Supabase Frankfurt / Vercel) tutulur; KVKK metninde belirtildi. Yurt dışı aktarım
      için güncel KVKK şartlarını bir uzmana teyit ettirin.
