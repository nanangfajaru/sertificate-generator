import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/auth";
import { renderInvoicePdf } from "@/lib/invoice";
import { invoiceData, invoiceFileName, loadOrder } from "@/lib/invoice-mail";
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
  const o = await loadOrder(admin, orderId);
  if (!o || (o.user_id !== s.profile.id && !s.profile.is_admin)) return new NextResponse("Not found", { status: 404 });
  if (o.status !== "paid") return new NextResponse("Invoice tersedia setelah pembayaran lunas.", { status: 409 });

  const d = await invoiceData(admin, o);
  const bytes = await renderInvoicePdf(d);
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": contentDisposition(invoiceFileName(d.invoiceNo)),
      "Cache-Control": "private, no-store",
    },
  });
}
