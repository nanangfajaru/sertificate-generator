"use server";

import { requireUser } from "@/lib/auth";
import { PLANS, createSnapTransaction, findVoucher, getPricing, activatePaidOrder, midtransConfigured, priceWith, type PlanKey } from "@/lib/billing";
import { randomCode } from "@/lib/util";
import { createAdminClient } from "@/lib/supabase/admin";

const isPlan = (p: string): p is PlanKey => p === "monthly" || p === "yearly";

export type VoucherCheck = { error?: string; code?: string; percent?: number; prices?: Record<PlanKey, number> };

/** Cek voucher dan hitung harga baru untuk kedua paket. */
export async function checkVoucher(rawCode: string): Promise<VoucherCheck> {
  const { profile } = await requireUser();
  const admin = createAdminClient();
  const [r, pricing] = await Promise.all([findVoucher(admin, rawCode, profile.id), getPricing(admin)]);
  if (!r.voucher) return { error: r.error };
  const v = r.voucher;
  return {
    code: v.code,
    percent: v.discount_percent,
    prices: { monthly: priceWith("monthly", pricing, v).amount, yearly: priceWith("yearly", pricing, v).amount },
  };
}

export async function startCheckout(plan: string, rawCode: string): Promise<{ url?: string; error?: string }> {
  const { profile } = await requireUser();
  if (!isPlan(plan)) return { error: "Paket tidak valid" };
  if (!midtransConfigured()) return { error: "Pembayaran belum dikonfigurasi. Hubungi admin." };
  const admin = createAdminClient();

  let voucher = null;
  if (rawCode.trim()) {
    const r = await findVoucher(admin, rawCode, profile.id);
    if (!r.voucher) return { error: r.error };
    voucher = r.voucher;
  }
  const price = priceWith(plan, await getPricing(admin), voucher);
  const orderId = `SO-${Date.now().toString(36)}-${randomCode(3)}`.toUpperCase();
  const row = {
    order_id: orderId,
    user_id: profile.id,
    plan,
    base_amount: price.base,
    discount_amount: price.discount,
    amount: price.amount,
    voucher_id: voucher?.id ?? null,
    voucher_code: voucher?.code ?? null,
    commission_amount: price.commission,
  };

  // Gratis penuh (diskon 100%): aktifkan langsung tanpa Midtrans.
  if (price.amount <= 0) {
    const { error } = await admin.from("orders").insert({ ...row, status: "paid", paid_at: new Date().toISOString() });
    if (error) return { error: "Gagal membuat pesanan" };
    await activatePaidOrder(admin, orderId, profile.id, PLANS[plan].months);
    return { url: `/dashboard/upgrade?order=${orderId}` };
  }

  const { error } = await admin.from("orders").insert(row);
  if (error) return { error: "Gagal membuat pesanan" };
  try {
    const url = await createSnapTransaction({ orderId, amount: price.amount, plan, email: profile.email, name: profile.full_name });
    await admin.from("orders").update({ payment_url: url }).eq("order_id", orderId);
    return { url };
  } catch (e) {
    await admin.from("orders").update({ status: "failed" }).eq("order_id", orderId);
    console.error("midtrans error", e);
    return { error: "Gagal membuka pembayaran. Coba lagi beberapa saat." };
  }
}
