import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { after } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isProProfile, type Profile } from "./db";
import { sendInvoiceEmail } from "./invoice-mail";
import { siteUrl } from "./util";

export type PlanKey = "monthly" | "yearly";
export const PLANS: Record<PlanKey, { label: string; price: number; months: number }> = {
  monthly: { label: "Pro Bulanan", price: 49000, months: 1 },
  yearly: { label: "Pro Tahunan", price: 499000, months: 12 },
};

export type PlanPricing = { list: number; price: number };
export type Pricing = Record<PlanKey, PlanPricing>;
// Bawaan: harga jual = harga paket; harga coret (list) bisa diubah admin di pengaturan master.
const DEFAULT_PRICING: Pricing = { monthly: { list: 79000, price: PLANS.monthly.price }, yearly: { list: 699000, price: PLANS.yearly.price } };

/** Harga master: `list` = harga normal (dicoret di tampilan), `price` = harga jual yang menjadi dasar diskon voucher. */
export async function getPricing(admin: SupabaseClient): Promise<Pricing> {
  const { data } = await admin.from("app_settings").select("value").eq("key", "pricing").maybeSingle();
  const v = (data?.value ?? {}) as Partial<Record<PlanKey, Partial<PlanPricing>>>;
  const n = (x: unknown, d: number) => (typeof x === "number" && Number.isFinite(x) && x >= 0 ? Math.round(x) : d);
  const one = (k: PlanKey): PlanPricing => {
    const price = n(v[k]?.price, DEFAULT_PRICING[k].price);
    return { price, list: Math.max(price, n(v[k]?.list, DEFAULT_PRICING[k].list)) };
  };
  return { monthly: one("monthly"), yearly: one("yearly") };
}

export type CheckoutSetting = { enabled: boolean; message: string };
export const CHECKOUT_CLOSED_DEFAULT = "Pembelian paket Pro sedang ditutup sementara. Silakan coba lagi nanti.";

/** Saklar admin untuk membuka/menutup pembelian Pro (app_settings.checkout). Bawaan: dibuka. */
export async function getCheckoutSetting(admin: SupabaseClient): Promise<CheckoutSetting> {
  const { data } = await admin.from("app_settings").select("value").eq("key", "checkout").maybeSingle();
  const v = (data?.value ?? {}) as Partial<CheckoutSetting>;
  return { enabled: v.enabled !== false, message: (typeof v.message === "string" && v.message.trim()) || CHECKOUT_CLOSED_DEFAULT };
}

export type Voucher = {
  id: string;
  code: string;
  label: string | null;
  discount_percent: number;
  commission_percent: number;
  max_uses: number | null;
  expires_at: string | null;
  active: boolean;
  owner_id?: string | null;
};

export type ReferralDefaults = { discount_percent: number; commission_percent: number };
const FALLBACK_DEFAULTS: ReferralDefaults = { discount_percent: 25, commission_percent: 50 };

/** Pengaturan master untuk referral buatan pengguna (diatur admin). */
export async function getReferralDefaults(admin: SupabaseClient): Promise<ReferralDefaults> {
  const { data } = await admin.from("app_settings").select("value").eq("key", "referral_defaults").maybeSingle();
  const v = data?.value as Partial<ReferralDefaults> | undefined;
  const ok = (n: unknown, d: number) => (typeof n === "number" && n >= 0 && n <= 100 ? Math.round(n) : d);
  return { discount_percent: ok(v?.discount_percent, FALLBACK_DEFAULTS.discount_percent), commission_percent: ok(v?.commission_percent, FALLBACK_DEFAULTS.commission_percent) };
}

export const normalizeCode = (c: string) => c.trim().toUpperCase().replace(/\s+/g, "");

/** Mengecek voucher untuk pengguna tertentu. Mengembalikan voucher atau pesan error. */
export async function findVoucher(admin: SupabaseClient, rawCode: string, userId: string): Promise<{ voucher?: Voucher; error?: string }> {
  const code = normalizeCode(rawCode);
  if (!code) return { error: "Masukkan kode voucher" };
  const { data } = await admin.from("vouchers").select("*").eq("code", code).maybeSingle();
  let v = data as Voucher | null;
  if (!v || !v.active) return { error: "Kode voucher tidak valid" };
  if (v.owner_id) {
    if (v.owner_id === userId) return { error: "Anda tidak bisa memakai kode referral milik sendiri" };
    // Kode referral hanya berlaku selama pemiliknya masih Pro.
    const { data: owner } = await admin.from("profiles").select("plan, plan_expires_at").eq("id", v.owner_id).maybeSingle();
    if (!isProProfile(owner as Pick<Profile, "plan" | "plan_expires_at"> | null)) return { error: "Kode voucher tidak valid" };
    // Kode buatan pengguna selalu mengikuti persentase master terbaru.
    v = { ...v, ...(await getReferralDefaults(admin)) };
  }
  if (v.expires_at && new Date(v.expires_at) < new Date()) return { error: "Kode voucher sudah kedaluwarsa" };
  if (v.max_uses != null) {
    const { count } = await admin.from("orders").select("id", { count: "exact", head: true }).eq("voucher_id", v.id).eq("status", "paid");
    if ((count ?? 0) >= v.max_uses) return { error: "Kuota voucher sudah habis" };
  }
  const { count: mine } = await admin.from("orders").select("id", { count: "exact", head: true }).eq("voucher_id", v.id).eq("user_id", userId).eq("status", "paid");
  if (mine) return { error: "Voucher ini sudah pernah Anda gunakan" };
  return { voucher: v };
}

/** Diskon voucher dihitung dari harga jual (bukan harga coret); komisi dari jumlah yang dibayar pembeli. */
export function priceWith(plan: PlanKey, pricing: Pricing, voucher?: Pick<Voucher, "discount_percent" | "commission_percent"> | null) {
  const base = pricing[plan].price;
  const discount = voucher ? Math.round((base * voucher.discount_percent) / 100) : 0;
  const amount = base - discount;
  const commission = voucher ? Math.round((amount * voucher.commission_percent) / 100) : 0;
  return { base, discount, amount, commission };
}

// ───────────────────────── Midtrans ─────────────────────────

const isProd = () => process.env.MIDTRANS_IS_PRODUCTION === "true";
export const midtransConfigured = () => !!process.env.MIDTRANS_SERVER_KEY;
const auth = () => `Basic ${Buffer.from(`${process.env.MIDTRANS_SERVER_KEY}:`).toString("base64")}`;

export async function createSnapTransaction(o: { orderId: string; amount: number; plan: PlanKey; email: string | null; name: string | null }) {
  const base = isProd() ? "https://app.midtrans.com" : "https://app.sandbox.midtrans.com";
  const res = await fetch(`${base}/snap/v1/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: auth() },
    body: JSON.stringify({
      transaction_details: { order_id: o.orderId, gross_amount: o.amount },
      item_details: [{ id: o.plan, price: o.amount, quantity: 1, name: `SertifikatKu ${PLANS[o.plan].label}` }],
      customer_details: { email: o.email ?? undefined, first_name: o.name ?? undefined },
      callbacks: { finish: `${siteUrl()}/dashboard/upgrade?order=${o.orderId}` },
      expiry: { unit: "hours", duration: 24 },
    }),
  });
  const json = (await res.json().catch(() => ({}))) as { redirect_url?: string; error_messages?: string[] };
  if (!res.ok || !json.redirect_url) throw new Error(json.error_messages?.join(", ") || `Midtrans ${res.status}`);
  return json.redirect_url;
}

export type MidtransStatus = {
  order_id: string;
  status_code?: string;
  gross_amount?: string;
  signature_key?: string;
  transaction_status?: string;
  fraud_status?: string;
  payment_type?: string;
  va_numbers?: { bank?: string; va_number?: string }[];
  permata_va_number?: string;
  store?: string;
  issuer?: string;
  bank?: string;
};

const NAMES: Record<string, string> = {
  qris: "QRIS", gopay: "GoPay", shopeepay: "ShopeePay", dana: "DANA", ovo: "OVO", linkaja: "LinkAja",
  akulaku: "Akulaku", kredivo: "Kredivo", indomaret: "Indomaret", alfamart: "Alfamart",
  bca: "BCA", bni: "BNI", bri: "BRI", mandiri: "Mandiri", permata: "Permata", cimb: "CIMB Niaga", bsi: "BSI",
};
const nice = (s: string) => NAMES[s.toLowerCase()] ?? s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/** Nama metode bayar yang mudah dibaca dari notifikasi/status Midtrans, mis. "Virtual Account BCA". */
export function paymentMethodLabel(p: MidtransStatus): string | null {
  const t = p.payment_type;
  if (!t) return null;
  if (t === "bank_transfer") {
    const bank = p.va_numbers?.[0]?.bank ?? (p.permata_va_number ? "permata" : null);
    return bank ? `Virtual Account ${nice(bank)}` : "Transfer bank (Virtual Account)";
  }
  if (t === "echannel") return "Mandiri Bill Payment";
  if (t === "credit_card") return p.bank ? `Kartu kredit/debit (${nice(p.bank)})` : "Kartu kredit/debit";
  if (t === "cstore") return p.store ? nice(p.store) : "Gerai retail";
  return nice(t);
}

/** Batalkan transaksi yang masih menunggu bayar di Midtrans. Diabaikan bila belum ada transaksi (pembeli belum memilih metode). */
export async function expireTransaction(orderId: string) {
  const base = isProd() ? "https://api.midtrans.com" : "https://api.sandbox.midtrans.com";
  await fetch(`${base}/v2/${encodeURIComponent(orderId)}/expire`, { method: "POST", headers: { Accept: "application/json", Authorization: auth() }, cache: "no-store" }).catch(() => null);
}

export async function fetchTransactionStatus(orderId: string): Promise<MidtransStatus | null> {
  const base = isProd() ? "https://api.midtrans.com" : "https://api.sandbox.midtrans.com";
  const res = await fetch(`${base}/v2/${encodeURIComponent(orderId)}/status`, { headers: { Accept: "application/json", Authorization: auth() }, cache: "no-store" });
  if (!res.ok) return null;
  const j = (await res.json().catch(() => null)) as (MidtransStatus & { status_code?: string }) | null;
  if (!j || j.status_code === "404") return null;
  return j;
}

export function verifySignature(p: MidtransStatus) {
  if (!p.signature_key || !p.order_id || !p.status_code || !p.gross_amount) return false;
  const expected = createHash("sha512").update(`${p.order_id}${p.status_code}${p.gross_amount}${process.env.MIDTRANS_SERVER_KEY}`).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(p.signature_key);
  return a.length === b.length && timingSafeEqual(a, b);
}

function addMonths(d: Date, m: number) {
  const r = new Date(d);
  r.setMonth(r.getMonth() + m);
  return r;
}

/**
 * Aktifkan Pro untuk pengguna; memperpanjang jika masih Pro.
 * Mengembalikan periode yang dibeli (end null = tanpa batas) untuk dicatat di pesanan/invoice.
 */
export async function grantPro(admin: SupabaseClient, userId: string, months: number): Promise<{ start: string; end: string | null }> {
  const { data: p } = await admin.from("profiles").select("plan, plan_expires_at").eq("id", userId).maybeSingle();
  const now = new Date();
  let start = now;
  let expires: string | null;
  if (p?.plan === "pro" && !p.plan_expires_at) expires = null; // sudah tanpa batas
  else {
    if (p?.plan === "pro" && p.plan_expires_at && new Date(p.plan_expires_at) > now) start = new Date(p.plan_expires_at);
    expires = addMonths(start, months).toISOString();
  }
  await admin.from("profiles").update({ plan: "pro", plan_expires_at: expires }).eq("id", userId);
  return { start: start.toISOString(), end: expires };
}

/** Pesanan baru lunas: aktifkan Pro, catat periodenya, lalu kirim invoice ke email pembeli (di latar belakang). */
export async function activatePaidOrder(admin: SupabaseClient, orderId: string, userId: string, months: number) {
  const period = await grantPro(admin, userId, months);
  await admin.from("orders").update({ period_start: period.start, period_end: period.end }).eq("order_id", orderId);
  after(() => sendInvoiceEmail(admin, orderId));
}

/** Terapkan status dari Midtrans ke order (idempotent). Mengembalikan status order sekarang. */
export async function applyMidtransStatus(admin: SupabaseClient, p: MidtransStatus): Promise<string | null> {
  const { data: o } = await admin.from("orders").select("*").eq("order_id", p.order_id).maybeSingle();
  if (!o) return null;
  const method = paymentMethodLabel(p);
  if (method && method !== o.payment_method) await admin.from("orders").update({ payment_method: method }).eq("id", o.id);
  if (o.status === "paid") return "paid";
  const ts = p.transaction_status;
  const paid = ts === "settlement" || (ts === "capture" && (p.fraud_status ?? "accept") === "accept");
  if (paid) {
    if (p.gross_amount && Math.round(Number(p.gross_amount)) !== o.amount) return o.status;
    const { data: upd } = await admin.from("orders").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", o.id).neq("status", "paid").select("id");
    if (upd?.length) await activatePaidOrder(admin, o.order_id, o.user_id, PLANS[o.plan as PlanKey].months);
    return "paid";
  }
  if (ts === "expire") {
    await admin.from("orders").update({ status: "expired" }).eq("id", o.id).eq("status", "pending");
    return "expired";
  }
  if (ts === "deny" || ts === "cancel" || ts === "failure") {
    await admin.from("orders").update({ status: "failed" }).eq("id", o.id).eq("status", "pending");
    return "failed";
  }
  return o.status;
}
