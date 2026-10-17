import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/auth";
import { invoiceNumber, renderInvoicePdf } from "@/lib/invoice";
import { createAdminClient } from "@/lib/supabase/admin";
import { contentDisposition } from "@/lib/util";

export const runtime = "nodejs";

/** Invoice (bukti pembelian) PDF untuk pesanan lunas. Hanya pemilik pesanan atau admin. */
export async function GET(_: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const s = await getSessionProfile();
  if (!s) return new NextResponse("Unauthorized", { status: 401 });
  if (!/^[A-Za-z0-9_-]{4,80}$/.test(orderId)) return new NextResponse("Not found", { status: 404 });

  const admin = createAdminClient();
  const { data: o } = await admin
    .from("orders")
    .select("order_id, user_id, plan, base_amount, discount_amount, amount, voucher_code, status, paid_at, created_at")
    .eq("order_id", orderId)
    .maybeSingle();
  if (!o || (o.user_id !== s.profile.id && !s.profile.is_admin)) return new NextResponse("Not found", { status: 404 });
  if (o.status !== "paid") return new NextResponse("Invoice tersedia setelah pembayaran lunas.", { status: 409 });

  const { data: buyer } = await admin.from("profiles").select("full_name, email, organization").eq("id", o.user_id).maybeSingle();
  const paidAt = (o.paid_at ?? o.created_at) as string;
  const invoiceNo = invoiceNumber(o.order_id, paidAt);
  const discount = Number(o.discount_amount ?? 0);
  const bytes = await renderInvoicePdf({
    invoiceNo,
    orderId: o.order_id,
    paidAt,
    plan: o.plan,
    baseAmount: Number(o.base_amount ?? Number(o.amount) + discount),
    discountAmount: discount,
    amount: Number(o.amount),
    voucherCode: o.voucher_code,
    buyer: { name: buyer?.full_name ?? null, email: buyer?.email ?? null, organization: buyer?.organization ?? null },
  });
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": contentDisposition(`Invoice SertifikatKu ${invoiceNo.replaceAll("/", "-")}.pdf`),
      "Cache-Control": "private, no-store",
    },
  });
}
