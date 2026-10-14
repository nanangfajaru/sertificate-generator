import { NextResponse } from "next/server";
import { applyMidtransStatus, verifySignature, type MidtransStatus } from "@/lib/billing";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// Webhook Midtrans (Dashboard → Settings → Payment → Notification URL).
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as MidtransStatus | null;
  if (!body || !verifySignature(body)) return new NextResponse("Invalid signature", { status: 403 });
  await applyMidtransStatus(createAdminClient(), body);
  return NextResponse.json({ ok: true });
}
