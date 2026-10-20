import { NextResponse } from "next/server";
import { applyMidtransStatus, verifySignature, type MidtransStatus } from "@/lib/billing";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// Webhook Midtrans (Dashboard → Settings → Payment → Notification URL).
// Selalu membalas 200 agar Midtrans tidak mengulang kiriman yang memang diabaikan (mis. "Test notification URL"
// dengan order fiktif/tanda tangan contoh); hanya notifikasi bertanda tangan sah yang diproses.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as MidtransStatus | null;
  if (!body?.order_id) {
    console.warn("[midtrans] notifikasi tanpa order_id diabaikan");
    return NextResponse.json({ ok: true, ignored: "no_order_id" });
  }
  if (!verifySignature(body)) {
    console.warn(`[midtrans] tanda tangan tidak sah, diabaikan: ${body.order_id}`);
    return NextResponse.json({ ok: true, ignored: "invalid_signature" });
  }
  const status = await applyMidtransStatus(createAdminClient(), body);
  console.log(`[midtrans] ${body.order_id} ${body.transaction_status} → ${status ?? "order tidak dikenal"}`);
  return NextResponse.json({ ok: true, status });
}
