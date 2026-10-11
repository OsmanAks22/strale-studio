import Link from "next/link";
import { formatPrice } from "./catalog";
import { filled, siteConfig, whatsappLink } from "./site-config";

export type ContentPage = {
  title: string;
  eyebrow: string;
  description: string;
  /** Legal drafts get a "review before publishing" notice. */
  legal?: boolean;
  body: React.ReactNode;
};

const c = siteConfig;
const company = c.company;
const shipping = `${formatPrice(c.freeShippingThreshold)} ve üzeri siparişlerde kargo ücretsizdir; altındaki siparişlerde kargo ücreti ${formatPrice(c.shippingFee)}’dir.`;

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="st-heading mt-10 mb-3 text-[13px] first:mt-0 tab:text-[14px]">{children}</h2>;
}

function List({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

function SellerTable() {
  const rows = [
    ["Unvan", filled(company.title)],
    ["Adres", filled(company.address)],
    ["Vergi dairesi / No", `${filled(company.taxOffice)} / ${filled(company.taxNumber)}`],
    ["MERSİS No", filled(company.mersis)],
    ["Telefon", filled(c.phone)],
    ["E-posta", filled(c.email)],
  ];
  return (
    <dl className="border-t border-sand">
      {rows.map(([label, value]) => (
        <div key={label} className="grid grid-cols-[140px_1fr] gap-3 border-b border-sand py-2">
          <dt className="text-graphite">{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function WhatsAppLine() {
  const href = whatsappLink("Merhaba, sipariş vermek istiyorum.");
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className="st-underline">
      WhatsApp hattımız
    </a>
  ) : (
    <span>WhatsApp hattımız</span>
  );
}

export const contentPages: Record<string, ContentPage> = {
  hakkimizda: {
    title: "Hakkımızda",
    eyebrow: "STRALE",
    description: "STRALE, Türkiye’de yurt dışı siparişler için üretilmiş ihraç fazlası giyim ürünlerini satar.",
    body: (
      <>
        <p>
          Türkiye, dünyanın en büyük hazır giyim üreticilerinden biri. Avrupa, İngiltere ve ABD için üretilen her
          siparişte; fazla üretim, iptal edilen partiler ya da sezon kapanışı nedeniyle sevkiyata girmeyen parçalar
          kalır. STRALE bu parçaları fabrikalardan doğrudan alır, tek tek kontrol eder ve önceki fiyatının çok altında
          satar.
        </p>
        <H2>Ne satıyoruz?</H2>
        <List
          items={[
            "İhracat standartlarında üretilmiş, markasız veya STRALE etiketli giyim ürünleri.",
            "Kusursuz ürünler ve açıkça etiketlenmiş hafif kusurlu ürünler.",
            "Başka bir markaya ait logo, isim veya etiket taşıyan ürün satmıyoruz.",
          ]}
        />
        <H2>Neden sınırlı?</H2>
        <p>
          Her ürün belirli bir partiden gelir; çoğu modelden yalnızca birkaç adet ve birkaç beden vardır. Tükenen bir
          ürünün yenisi genellikle gelmez. Yeni stoklar her hafta eklenir.
        </p>
      </>
    ),
  },

  iletisim: {
    title: "İletişim",
    eyebrow: "Destek",
    description: "STRALE iletişim bilgileri ve çalışma saatleri.",
    body: (
      <>
        <p>
          Sipariş, beden ve stok soruların için <WhatsAppLine /> en hızlı yol. Çalışma saatlerimiz: {c.hours}.
        </p>
        <H2>İletişim bilgileri</H2>
        <dl className="border-t border-sand">
          {[
            ["WhatsApp", c.whatsapp ? `+${c.whatsapp}` : ""],
            ["Telefon", c.phone],
            ["E-posta", c.email],
            ["Instagram", c.instagram ? `@${c.instagram}` : ""],
            ["Adres", company.address],
          ]
            .filter(([, value]) => value)
            .map(([label, value]) => (
              <div key={label} className="grid grid-cols-[120px_1fr] gap-3 border-b border-sand py-2">
                <dt className="text-graphite">{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
        </dl>
        {!c.whatsapp && !c.phone && !c.email ? (
          <p className="mt-4 text-graphite">İletişim kanallarımız çok yakında burada olacak.</p>
        ) : null}
      </>
    ),
  },

  sss: {
    title: "Sıkça Sorulan Sorular",
    eyebrow: "Destek",
    description: "İhraç fazlası ürünler, sipariş, kargo ve iade hakkında sık sorulan sorular.",
    body: (
      <>
        <H2>İhraç fazlası ürün ne demek?</H2>
        <p>
          Yurt dışı siparişler için Türkiye’de üretilen, fazla üretim veya iptal nedeniyle sevkiyata girmeyen ürünler.
          Kalite, ihracat standardındadır.
        </p>
        <H2>Ürünler orijinal mi, markalı mı?</H2>
        <p>
          Sattığımız ürünler markasız veya STRALE etiketlidir. Başka bir markanın logosunu, ismini veya etiketini
          taşıyan ürün satmıyoruz.
        </p>
        <H2>“Hafif kusurlu” ne demek?</H2>
        <p>
          Küçük bir renk farkı, dikiş izi gibi kullanımı etkilemeyen üretim kusurları. Kusur ürün sayfasında açıkça
          yazılır ve bu ürünler ekstra indirimlidir.
        </p>
        <H2>Nasıl sipariş veririm?</H2>
        <p>
          Ürün sayfasında bedenini seçip “WhatsApp ile Sipariş Ver” butonuna bas. Ayrıntılar{" "}
          <Link href="/sayfa/siparis" className="st-underline">
            sipariş rehberinde
          </Link>
          .
        </p>
        <H2>Bedenim olmazsa?</H2>
        <p>
          Teslimattan itibaren {c.returnDays} gün içinde stokta varsa farklı bedenle değiştirebilir ya da iade
          edebilirsin.{" "}
          <Link href="/sayfa/beden-rehberi" className="st-underline">
            Beden rehberine
          </Link>{" "}
          göz atmayı unutma.
        </p>
        <H2>Kargo ne kadar sürer?</H2>
        <p>
          Siparişler {c.dispatchDays} iş gününde kargoya verilir. {shipping}
        </p>
      </>
    ),
  },

  siparis: {
    title: "Nasıl Sipariş Verilir?",
    eyebrow: "Yardım",
    description: "STRALE’de WhatsApp üzerinden adım adım sipariş.",
    body: (
      <>
        <ol className="list-decimal space-y-3 pl-5">
          <li>Beğendiğin ürünün sayfasında bedenini seç.</li>
          <li>
            “WhatsApp ile Sipariş Ver” butonuna bas. Ürün adı, beden ve fiyat mesaja otomatik eklenir; mesajı gönder.
          </li>
          <li>Stok ve beden kontrolünden sonra sana sipariş özetini ve ödeme bilgilerini iletiriz.</li>
          <li>Ad-soyad, teslimat adresi ve telefon bilgini paylaş; ödeme yöntemini seç ({c.paymentMethods.join(" veya ")}).</li>
          <li>
            Siparişin {c.dispatchDays} iş gününde kargoya verilir ve kargo takip numarası WhatsApp’tan gönderilir.
          </li>
        </ol>
        <p className="mt-6">
          Sipariş onayından önce{" "}
          <Link href="/sayfa/on-bilgilendirme" className="st-underline">
            Ön Bilgilendirme Formu
          </Link>{" "}
          ve{" "}
          <Link href="/sayfa/mesafeli-satis-sozlesmesi" className="st-underline">
            Mesafeli Satış Sözleşmesi
          </Link>{" "}
          sana iletilir.
        </p>
      </>
    ),
  },

  "kargo-teslimat": {
    title: "Kargo & Teslimat",
    eyebrow: "Yardım",
    description: "Kargo süreleri ve ücretleri.",
    body: (
      <>
        <List
          items={[
            `Siparişler ödeme onayından sonra ${c.dispatchDays} iş gününde kargoya verilir.`,
            shipping,
            "Teslimat süresi kargoya verildikten sonra bulunduğun ile göre genellikle 1–3 iş günüdür.",
            "Şu an yalnızca Türkiye içine gönderim yapıyoruz.",
            "Kargo takip numarası WhatsApp veya SMS ile iletilir.",
          ]}
        />
        <p className="mt-6">
          Teslim alırken paketi kontrol et; hasarlı paketler için kargo görevlisine tutanak tutturup bize bildir.
        </p>
      </>
    ),
  },

  "iade-degisim": {
    title: "İade & Değişim",
    eyebrow: "Yardım",
    description: `Teslimattan itibaren ${c.returnDays} gün içinde iade ve değişim.`,
    body: (
      <>
        <p>
          6502 sayılı Tüketicinin Korunması Hakkında Kanun gereği, ürünü teslim aldığın tarihten itibaren{" "}
          {c.returnDays} gün içinde herhangi bir gerekçe göstermeden cayma hakkını kullanabilirsin.
        </p>
        <H2>Nasıl iade ederim?</H2>
        <List
          items={[
            "WhatsApp veya e-posta ile sipariş bilgini ve iade/değişim talebini bildir.",
            "Ürünü kullanılmamış, yıkanmamış ve etiketleriyle birlikte gönder.",
            "Ürün bize ulaştıktan sonra en geç 14 gün içinde ödemen aynı yöntemle iade edilir.",
          ]}
        />
        <H2>Değişim</H2>
        <p>Stokta olması hâlinde farklı beden veya renkle değişim yapılır. Stok sınırlı olduğu için önce bize yaz.</p>
        <H2>Hafif kusurlu ürünler</H2>
        <p>
          Ürün sayfasında belirtilen kusur nedeniyle iade talep edilemez; ancak cayma hakkın ve belirtilmeyen başka bir
          ayıp için yasal hakların saklıdır.
        </p>
      </>
    ),
  },

  odeme: {
    title: "Ödeme Seçenekleri",
    eyebrow: "Yardım",
    description: "STRALE ödeme yöntemleri.",
    body: (
      <>
        <List items={c.paymentMethods.map((method) => method)} />
        <p className="mt-6">
          Havale/EFT bilgileri sipariş özetiyle birlikte WhatsApp’tan iletilir. Açıklama kısmına adını ve sipariş
          numaranı yazmayı unutma. Kapıda ödemede kargo firmasının ek hizmet bedeli uygulanabilir.
        </p>
      </>
    ),
  },

  "beden-rehberi": {
    title: "Beden Rehberi",
    eyebrow: "Yardım",
    description: "Üst ve alt giyim beden ölçüleri (cm).",
    body: (
      <>
        <p>
          İhraç fazlası ürünler Avrupa ve ABD kalıplarında üretildiği için modelden modele küçük farklar olabilir.
          Emin değilsen ürünün ölçülerini WhatsApp’tan sor.
        </p>
        <H2>Üst giyim (cm)</H2>
        <SizeTable
          head={["Beden", "Göğüs", "Bel", "Boy"]}
          rows={[
            ["S", "92–96", "78–82", "170–175"],
            ["M", "96–100", "82–86", "175–180"],
            ["L", "100–106", "86–92", "178–183"],
            ["XL", "106–112", "92–98", "180–186"],
            ["XXL", "112–118", "98–104", "182–188"],
          ]}
        />
        <H2>Alt giyim (cm)</H2>
        <SizeTable
          head={["Beden", "Bel", "Basen", "İç boy"]}
          rows={[
            ["30 / S", "76–80", "94–98", "80"],
            ["32 / M", "81–85", "99–103", "81"],
            ["34 / L", "86–90", "104–108", "82"],
            ["36 / XL", "91–96", "109–113", "83"],
          ]}
        />
      </>
    ),
  },

  kvkk: {
    title: "KVKK Aydınlatma Metni",
    eyebrow: "Yasal",
    legal: true,
    description: "Kişisel verilerin işlenmesine ilişkin aydınlatma metni.",
    body: (
      <>
        <p>
          6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca, veri sorumlusu sıfatıyla{" "}
          {filled(company.title)} (“STRALE”) olarak kişisel verilerinizi aşağıda açıklanan kapsamda işliyoruz.
        </p>
        <H2>İşlenen veriler</H2>
        <List
          items={[
            "Kimlik ve iletişim: ad-soyad, telefon, e-posta, teslimat adresi.",
            "Müşteri işlem: sipariş içeriği, ödeme yöntemi, yazışma kayıtları (WhatsApp dahil).",
            "Fatura bilgileri: T.C. kimlik veya vergi numarası (fatura düzenlenmesi için).",
            "İnternet sitesi kullanımı: çerezler aracılığıyla toplanan teknik veriler.",
          ]}
        />
        <H2>İşleme amaçları ve hukuki sebepler</H2>
        <List
          items={[
            "Siparişin alınması, teslimatı, iade ve değişim süreçleri — sözleşmenin kurulması ve ifası (KVKK m.5/2-c).",
            "Fatura düzenlenmesi ve yasal saklama yükümlülükleri — hukuki yükümlülük (m.5/2-ç).",
            "Müşteri sorularının yanıtlanması — meşru menfaat (m.5/2-f).",
          ]}
        />
        <H2>Aktarım</H2>
        <p>
          Verileriniz yalnızca yukarıdaki amaçlarla sınırlı olarak kargo firmalarına, ödeme/banka kuruluşlarına, mali
          müşavirimize ve yetkili kamu kurumlarına aktarılabilir. WhatsApp üzerinden yürütülen yazışmalar WhatsApp’ın
          (Meta) altyapısında işlenir.
        </p>
        <H2>Haklarınız</H2>
        <p>
          KVKK m.11 kapsamında verilerinize erişme, düzeltme, silme ve itiraz haklarınızı {filled(c.email)} adresine
          veya {filled(company.address)} adresine yazılı olarak başvurarak kullanabilirsiniz.
        </p>
      </>
    ),
  },

  "on-bilgilendirme": {
    title: "Ön Bilgilendirme Formu",
    eyebrow: "Yasal",
    legal: true,
    description: "Mesafeli sözleşmeler öncesi ön bilgilendirme.",
    body: (
      <>
        <H2>Satıcı bilgileri</H2>
        <SellerTable />
        <H2>Ürün, fiyat ve ödeme</H2>
        <p>
          Ürünün temel nitelikleri, KDV dahil satış fiyatı, beden ve adet bilgisi ürün sayfasında ve sipariş öncesi
          WhatsApp’tan iletilen sipariş özetinde yer alır. Ödeme yöntemleri: {c.paymentMethods.join(", ")}. {shipping}
        </p>
        <H2>Teslimat</H2>
        <p>
          Ürün, ödeme onayından sonra {c.dispatchDays} iş günü içinde kargoya verilir ve her hâlükârda 30 günlük yasal
          süreyi aşmamak üzere alıcının bildirdiği adrese teslim edilir.
        </p>
        <H2>Cayma hakkı</H2>
        <p>
          Alıcı, ürünü teslim aldığı tarihten itibaren {c.returnDays} gün içinde herhangi bir gerekçe göstermeksizin ve
          cezai şart ödemeksizin cayma hakkına sahiptir. Cayma bildirimi {filled(c.email)} adresine veya WhatsApp
          hattına yapılabilir. Satıcı, bildirimden itibaren 14 gün içinde ödemeyi iade eder.
        </p>
        <H2>Şikâyet ve itiraz</H2>
        <p>
          Uyuşmazlıklarda, Ticaret Bakanlığınca ilan edilen parasal sınırlar dahilinde alıcının yerleşim yerindeki
          Tüketici Hakem Heyetleri ile Tüketici Mahkemeleri yetkilidir.
        </p>
      </>
    ),
  },

  "mesafeli-satis-sozlesmesi": {
    title: "Mesafeli Satış Sözleşmesi",
    eyebrow: "Yasal",
    legal: true,
    description: "6502 sayılı Kanun ve Mesafeli Sözleşmeler Yönetmeliği kapsamında satış sözleşmesi.",
    body: (
      <>
        <H2>1. Taraflar</H2>
        <p>Satıcı:</p>
        <SellerTable />
        <p className="mt-3">
          Alıcı: Sipariş sırasında ad-soyad, adres ve iletişim bilgilerini bildiren gerçek veya tüzel kişi.
        </p>
        <H2>2. Konu</H2>
        <p>
          İşbu sözleşmenin konusu, alıcının satıcıya ait internet sitesi ve WhatsApp hattı üzerinden siparişini verdiği,
          nitelikleri ve satış fiyatı sipariş özetinde belirtilen ürünün satışı ve teslimidir.
        </p>
        <H2>3. Ürün ve ödeme</H2>
        <p>
          Ürün bilgileri, KDV dahil fiyat, kargo bedeli ve ödeme yöntemi alıcıya iletilen sipariş özetinde yer alır.{" "}
          {shipping}
        </p>
        <H2>4. Teslimat</H2>
        <p>
          Ürün, ödeme onayından itibaren {c.dispatchDays} iş günü içinde kargoya verilir; teslimat süresi 30 günü
          geçemez. Ürün, alıcının bildirdiği adrese teslim edilir.
        </p>
        <H2>5. Cayma hakkı</H2>
        <p>
          Alıcı, teslim tarihinden itibaren {c.returnDays} gün içinde gerekçe göstermeksizin cayma hakkını kullanabilir.
          Ürünün kullanılmamış ve yeniden satılabilir durumda iade edilmesi gerekir. Satıcı, cayma bildiriminin
          kendisine ulaşmasından itibaren 14 gün içinde ödemeyi iade eder.
        </p>
        <H2>6. Hafif kusurlu ürünler</H2>
        <p>
          Ürün sayfasında ve sipariş özetinde açıkça belirtilen kusurlar, alıcı tarafından bilinerek kabul edilmiş
          sayılır; bu durum alıcının cayma hakkını ve belirtilmeyen ayıplara ilişkin yasal haklarını ortadan kaldırmaz.
        </p>
        <H2>7. Uyuşmazlık</H2>
        <p>
          Uyuşmazlıklarda Ticaret Bakanlığınca ilan edilen parasal sınırlar dahilinde Tüketici Hakem Heyetleri ve
          Tüketici Mahkemeleri yetkilidir.
        </p>
        <H2>8. Yürürlük</H2>
        <p>Alıcı, siparişi onayladığında işbu sözleşmenin tüm koşullarını kabul etmiş sayılır.</p>
      </>
    ),
  },

  "cerez-politikasi": {
    title: "Çerez Politikası",
    eyebrow: "Yasal",
    legal: true,
    description: "Sitede kullanılan çerezler.",
    body: (
      <>
        <p>
          Bu site yalnızca çalışması için zorunlu teknik çerezleri ve tarayıcı depolamasını kullanır. Reklam veya
          üçüncü taraf izleme çerezi kullanılmaz.
        </p>
        <p className="mt-4">
          İleride analiz veya pazarlama çerezleri eklenirse bu sayfa güncellenecek ve onayınız alınacaktır. Çerezleri
          tarayıcı ayarlarınızdan silebilir veya engelleyebilirsiniz.
        </p>
      </>
    ),
  },
};

function SizeTable({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[360px] border-collapse text-left">
        <thead>
          <tr className="border-b border-ink">
            {head.map((cell) => (
              <th key={cell} className="st-micro py-2 pr-3 text-[10px]">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]} className="border-b border-sand">
              {row.map((cell, index) => (
                <td key={index} className="py-2 pr-3">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
