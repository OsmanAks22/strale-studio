import { whatsappLink } from "@/components/sites/strale/site-config";
import { dbConfigured, query, transaction, type PaymentMethod } from "@/lib/db";
import { enabledPaymentMethods, newOrderCode, orderMessage, quote, validateCustomer, type CheckoutLine } from "@/lib/orders";
import { applyStock } from "@/lib/stock";
import { getSettings, storeChanged } from "@/lib/store-data";
import { throttled } from "@/lib/throttle";

type Body = {
  lines?: CheckoutLine[];
  customer?: Record<string, string>;
  paymentMethod?: PaymentMethod;
  discountCode?: string;
  consents?: { preInfo?: boolean; contract?: boolean };
  /** Honeypot: hidden from people, bots fill it. */
  website?: string;
};

const bad = (error: string, extra: Record<string, unknown> = {}, status = 400) => Response.json({ error, ...extra }, { status });

/**
 * Places an order: recomputes prices, checks stock, stores the order (when a database is configured),
 * takes the stock out of products.json and returns the WhatsApp message + payment details.
 */
export async function POST(request: Request) {
  if (throttled(request, "order", 5, 10 * 60 * 1000)) return bad("Çok fazla deneme. Lütfen birkaç dakika sonra tekrar deneyin.", {}, 429);
  try {
    const body = (await request.json()) as Body;
    if (body.website) return bad("Sipariş alınamadı.");
    if (!body.consents?.preInfo || !body.consents?.contract) {
      return bad("Ön Bilgilendirme Formu ve Mesafeli Satış Sözleşmesi'ni onaylamanız gerekiyor.");
    }
    const settings = await getSettings();
    // Without a database the order only exists as the WhatsApp message, so a number is required.
    if (!dbConfigured() && !settings.whatsapp) {
      return bad("Şu anda online sipariş alınamıyor. Lütfen iletişim sayfasındaki kanallardan bize ulaşın.", {}, 503);
    }
    const methods = enabledPaymentMethods(settings);
    if (!body.paymentMethod || !methods.includes(body.paymentMethod)) return bad("Ödeme yöntemi seçin.");
    const lines = (Array.isArray(body.lines) ? body.lines : []).slice(0, 30);
    if (!lines.length) return bad("Sepetiniz boş.");
    const checked = validateCustomer(body.customer ?? {});
    if ("error" in checked) return bad(checked.error);
    const { customer } = checked;

    const priced = await quote(lines, body.paymentMethod, body.discountCode);
    if (priced.problems.length) return bad("Sepetinizdeki bazı ürünlerin stoğu değişti.", { problems: priced.problems }, 409);
    if (priced.discountError) return bad(priced.discountError, { field: "discountCode" });

    const order = {
      code: newOrderCode(),
      items: priced.items,
      subtotal: priced.subtotal,
      discount: priced.discount,
      discount_code: priced.discountCode,
      shipping: priced.shipping,
      cod_fee: priced.codFee,
      total: priced.total,
      payment_method: body.paymentMethod,
      customer,
    };

    let saved = false;
    if (dbConfigured()) {
      await transaction(async (client) => {
        await client.query(
          `insert into orders (code, payment_method, customer, items, subtotal, discount, discount_code, shipping, cod_fee, total)
           values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [order.code, order.payment_method, customer, JSON.stringify(order.items), order.subtotal, order.discount, order.discount_code, order.shipping, order.cod_fee, order.total],
        );
        if (order.discount_code) {
          await client.query("update discount_codes set used_count = used_count + 1 where code = $1", [order.discount_code]);
        }
      });
      saved = true;
      // Take the pieces out of stock; if someone else bought the last one in the meantime, cancel.
      const stock = await applyStock(
        order.items.map((i) => ({ handle: i.handle, size: i.size, qty: i.qty })),
        -1,
        `sipariş ${order.code}`,
      ).catch((error: Error) => ({ ok: false as const, error: error.message }));
      if (stock.ok) {
        await query("update orders set stock_applied = true where code = $1", [order.code]);
        storeChanged();
      } else if (stock.error === "short") {
        await query("update orders set status = 'iptal', admin_note = 'Stok yetmedi, otomatik iptal' where code = $1", [order.code]);
        if (order.discount_code) await query("update discount_codes set used_count = greatest(used_count - 1, 0) where code = $1", [order.discount_code]);
        return bad("Siz sipariş verirken bir ürünün son adedi satıldı. Lütfen sepetinizi kontrol edin.", {}, 409);
      } else {
        // Saved but stock not updated (database error): the panel flags it.
        console.error("Stock not applied for", order.code, stock.error);
      }
    }

    const message = orderMessage(order);
    return Response.json({
      code: order.code,
      saved,
      total: order.total,
      paymentMethod: order.payment_method,
      whatsappUrl: whatsappLink(settings, message),
      message,
      bank: order.payment_method === "havale" ? settings.bank : undefined,
    });
  } catch (error) {
    console.error(error);
    return bad("Sipariş kaydedilemedi. Lütfen tekrar deneyin veya WhatsApp'tan yazın.", {}, 500);
  }
}
