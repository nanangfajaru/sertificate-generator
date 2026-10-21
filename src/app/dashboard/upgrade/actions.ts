"use server";

import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { PLANS, applyMidtransStatus, createSnapTransaction, expireTransaction, fetchTransactionStatus, findVoucher, getCheckoutSetting, getPricing, activatePaidOrder, midtransConfigured, priceWith, type PlanKey } from "@/lib/billing";
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

export async function startCheckout(plan: string, rawCode: string): Promise<{ url?: string; orderId?: string; error?: string }> {
  return createCheckout(plan, rawCode);
}

/** `replacing`: pesanan menunggu bayar milik pengguna yang akan diganti (sudah dicek pemiliknya). */
async function createCheckout(plan: string, rawCode: string, replacing?: string): Promise<{ url?: string; orderId?: string; error?: string }> {
  const { profile } = await requireUser();
  if (!isPlan(plan)) return { error: "Paket tidak valid" };
  if (!midtransConfigured()) return { error: "Pembayaran belum dikonfigurasi. Hubungi admin." };
  const admin = createAdminClient();
  const checkout = await getCheckoutSetting(admin);
  if (!checkout.enabled) return { error: checkout.message };

  let voucher = null;
  if (rawCode.trim()) {
    const r = await findVoucher(admin, rawCode, profile.id, replacing);
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
    return { url: `/dashboard/upgrade?order=${orderId}`, orderId };
  }

  const { error } = await admin.from("orders").insert(row);
  if (error) return { error: "Gagal membuat pesanan" };
  try {
    const url = await createSnapTransaction({ orderId, amount: price.amount, plan, email: profile.email, name: profile.full_name });
    await admin.from("orders").update({ payment_url: url }).eq("order_id", orderId);
    return { url, orderId };
  } catch (e) {
    await admin.from("orders").update({ status: "failed" }).eq("order_id", orderId);
    console.error("midtrans error", e);
    return { error: "Gagal membuka pembayaran. Coba lagi beberapa saat." };
  }
}

/** Pesanan "menunggu bayar" milik pengguna yang sedang login. */
async function ownPending(orderId: string) {
  const { profile } = await requireUser();
  const admin = createAdminClient();
  const { data: o } = await admin.from("orders").select("order_id, user_id, plan, voucher_code, status").eq("order_id", orderId).maybeSingle();
  if (!o || o.user_id !== profile.id) return { error: "Pesanan tidak ditemukan" as const };
  if (o.status !== "pending") return { error: "Pesanan ini sudah tidak menunggu pembayaran" as const };
  return { admin, o };
}

async function cancelPending(admin: ReturnType<typeof createAdminClient>, orderId: string) {
  // Batalkan juga di Midtrans agar nomor VA / kode bayar lama tidak bisa dipakai lagi.
  if (midtransConfigured()) await expireTransaction(orderId);
  await admin.from("orders").update({ status: "cancelled" }).eq("order_id", orderId).eq("status", "pending");
}

/** Batalkan pesanan yang belum dibayar. */
export async function cancelOrder(orderId: string): Promise<{ error?: string }> {
  const r = await ownPending(orderId);
  if ("error" in r) return { error: r.error };
  await cancelPending(r.admin, orderId);
  revalidatePath("/dashboard/upgrade", "layout");
  return {};
}

/** Ganti metode bayar: buat pesanan baru (paket & voucher sama), lalu batalkan pesanan lama. */
export async function changePaymentMethod(orderId: string): Promise<{ url?: string; orderId?: string; error?: string }> {
  const r = await ownPending(orderId);
  if ("error" in r) return { error: r.error };
  const next = await createCheckout(r.o.plan, r.o.voucher_code ?? "", orderId);
  if (!next.url) return next;
  await cancelPending(r.admin, orderId);
  return next;
}

/**
 * Status ringkas pesanan menunggu bayar milik pengguna (untuk pembaruan otomatis halaman Berlangganan).
 * `sync`: tanyakan juga ke Midtrans (cadangan bila notifikasi webhook terlambat).
 */
export async function pendingSnapshot(sync = false): Promise<{ pending: number; key: string }> {
  const { profile } = await requireUser();
  const admin = createAdminClient();
  if (sync && midtransConfigured()) {
    const { data: open } = await admin.from("orders").select("order_id").eq("user_id", profile.id).eq("status", "pending").order("created_at", { ascending: false }).limit(3);
    for (const o of open ?? []) {
      const st = await fetchTransactionStatus(o.order_id);
      if (st) await applyMidtransStatus(admin, st);
    }
  }
  const { data } = await admin.from("orders").select("order_id, status, payment_method").eq("user_id", profile.id).order("created_at", { ascending: false }).limit(20);
  const rows = data ?? [];
  return { pending: rows.filter((r) => r.status === "pending").length, key: rows.map((r) => `${r.order_id}:${r.status}:${r.payment_method ?? ""}`).join("|") };
}
