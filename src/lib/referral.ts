import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getReferralDefaults } from "./billing";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const rand = (n: number) => Array.from({ length: n }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join("");

const cols = "id, code, active, payout_info";

export async function getReferral(admin: SupabaseClient, userId: string) {
  const { data } = await admin.from("vouchers").select(cols).eq("owner_id", userId).maybeSingle();
  return data;
}

/** Membuat kode referral tetap untuk pengguna (nama + karakter acak). Hanya dipanggil lewat tombol, tidak otomatis. */
export async function createReferral(admin: SupabaseClient, user: { id: string; full_name: string | null; email: string | null }) {
  const found = await getReferral(admin, user.id);
  if (found) return found;
  const d = await getReferralDefaults(admin);
  const base = (user.full_name ?? user.email ?? "").split(/[\s@]/)[0].replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 8) || "SK";
  for (let i = 0; i < 6; i++) {
    const { data, error } = await admin
      .from("vouchers")
      .insert({ code: `${base}${rand(i < 3 ? 3 : 5)}`, label: user.full_name ?? user.email, owner_id: user.id, discount_percent: d.discount_percent, commission_percent: d.commission_percent })
      .select(cols)
      .single();
    if (data) return data;
    if (error?.code !== "23505") break;
    // 23505 bisa karena kode bentrok atau pengguna sudah punya (balapan); cek ulang dulu.
    const { data: again } = await admin.from("vouchers").select(cols).eq("owner_id", user.id).maybeSingle();
    if (again) return again;
  }
  return null;
}
