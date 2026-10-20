import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { invoiceEmail } from "./email-templates";
import { invoiceNumber, renderInvoicePdf, type InvoiceData } from "./invoice";
import { describeMailError, mailConfigured, sendMail } from "./mailer";
import { siteUrl } from "./util";

const PLAN_MONTHS: Record<string, number> = { monthly: 1, yearly: 12 };

type OrderRow = {
  order_id: string;
  user_id: string;
  plan: string;
  base_amount: number | null;
  discount_amount: number | null;
  amount: number;
  voucher_code: string | null;
  status: string;
  paid_at: string | null;
  created_at: string;
  period_start: string | null;
  period_end: string | null;
  payment_method: string | null;
};

const ORDER_COLS = "order_id, user_id, plan, base_amount, discount_amount, amount, voucher_code, status, paid_at, created_at, period_start, period_end, payment_method";

export async function loadOrder(admin: SupabaseClient, orderId: string) {
  const { data } = await admin.from("orders").select(ORDER_COLS).eq("order_id", orderId).maybeSingle();
  return data as OrderRow | null;
}

/** Metode bayar tercatat; pesanan lama yang belum tercatat diambil sekali dari Midtrans lalu disimpan. */
async function resolvePaymentMethod(admin: SupabaseClient, o: OrderRow): Promise<string> {
  if (o.payment_method) return o.payment_method;
  if (Number(o.amount) <= 0) return "Voucher (gratis)";
  // Impor dinamis: billing juga mengimpor modul ini (kirim invoice).
  const { fetchTransactionStatus, midtransConfigured, paymentMethodLabel } = await import("./billing");
  if (!midtransConfigured()) return "Online";
  const st = await fetchTransactionStatus(o.order_id).catch(() => null);
  const label = st ? paymentMethodLabel(st) : null;
  if (!label) return "Online";
  await admin.from("orders").update({ payment_method: label }).eq("order_id", o.order_id);
  return label;
}

/** Data invoice dari pesanan lunas. Pesanan lama tanpa periode tercatat: tanggal bayar + durasi paket. */
export async function invoiceData(admin: SupabaseClient, o: OrderRow): Promise<InvoiceData> {
  const [{ data: buyer }, paymentMethod] = await Promise.all([
    admin.from("profiles").select("full_name, email, organization").eq("id", o.user_id).maybeSingle(),
    resolvePaymentMethod(admin, o),
  ]);
  const paidAt = o.paid_at ?? o.created_at;
  const discount = Number(o.discount_amount ?? 0);
  let period: InvoiceData["period"] = null;
  if (o.period_start) period = { start: o.period_start, end: o.period_end };
  else if (PLAN_MONTHS[o.plan]) {
    const end = new Date(paidAt);
    end.setMonth(end.getMonth() + PLAN_MONTHS[o.plan]);
    period = { start: paidAt, end: end.toISOString() };
  }
  return {
    invoiceNo: invoiceNumber(o.order_id, paidAt),
    orderId: o.order_id,
    paidAt,
    plan: o.plan,
    baseAmount: Number(o.base_amount ?? Number(o.amount) + discount),
    discountAmount: discount,
    amount: Number(o.amount),
    voucherCode: o.voucher_code,
    period,
    paymentMethod,
    buyer: { name: buyer?.full_name ?? null, email: buyer?.email ?? null, organization: buyer?.organization ?? null },
  };
}

export const invoiceFileName = (invoiceNo: string) => `Invoice SertifikatKu ${invoiceNo.replaceAll("/", "-")}.pdf`;

/** Kirim invoice PDF ke email pembeli, sekali per pesanan (ditandai invoice_sent_at). Tidak pernah melempar error. */
export async function sendInvoiceEmail(admin: SupabaseClient, orderId: string) {
  try {
    if (!mailConfigured()) return;
    const o = await loadOrder(admin, orderId);
    if (!o || o.status !== "paid") return;
    // Klaim pengiriman lebih dulu agar webhook + halaman yang berjalan bersamaan tidak mengirim dobel.
    const { data: claimed } = await admin.from("orders").update({ invoice_sent_at: new Date().toISOString() }).eq("order_id", orderId).is("invoice_sent_at", null).select("order_id");
    if (!claimed?.length) return;
    const d = await invoiceData(admin, o);
    if (!d.buyer.email) return;
    try {
      const pdf = await renderInvoicePdf(d);
      const mail = invoiceEmail({ ...d, url: `${siteUrl()}/dashboard/upgrade` });
      await sendMail({ to: d.buyer.email, ...mail, attachments: [{ filename: invoiceFileName(d.invoiceNo), content: Buffer.from(pdf), contentType: "application/pdf" }] });
    } catch (e) {
      await admin.from("orders").update({ invoice_sent_at: null }).eq("order_id", orderId);
      console.error("invoice email error", orderId, describeMailError(e));
    }
  } catch (e) {
    console.error("invoice email error", orderId, e);
  }
}
