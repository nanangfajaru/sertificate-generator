"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { getReferralDefaults, normalizeCode } from "@/lib/billing";
import { createAdminClient } from "@/lib/supabase/admin";

export type ReferralState = { error?: string; ok?: boolean };

const codeSchema = z.string().regex(/^[A-Z0-9]{4,20}$/, "Kode 4–20 karakter, hanya huruf dan angka");

export async function createReferral(_: ReferralState, fd: FormData): Promise<ReferralState> {
  const { profile } = await requireUser();
  const code = normalizeCode(String(fd.get("code") ?? "")).replace(/[-_]/g, "");
  const p = codeSchema.safeParse(code);
  if (!p.success) return { error: p.error.issues[0]?.message ?? "Kode tidak valid" };
  const admin = createAdminClient();
  const { data: mine } = await admin.from("vouchers").select("id").eq("owner_id", profile.id).maybeSingle();
  if (mine) return { error: "Anda sudah memiliki kode referral" };
  const d = await getReferralDefaults(admin);
  const { error } = await admin.from("vouchers").insert({
    code: p.data,
    label: profile.full_name ?? profile.email,
    owner_id: profile.id,
    discount_percent: d.discount_percent,
    commission_percent: d.commission_percent,
  });
  if (error) return { error: error.code === "23505" ? "Kode sudah dipakai, coba kode lain" : "Gagal membuat kode referral" };
  revalidatePath("/dashboard/referral");
  return { ok: true };
}

export async function savePayoutInfo(_: ReferralState, fd: FormData): Promise<ReferralState> {
  const { profile } = await requireUser();
  const info = String(fd.get("payout") ?? "").trim().slice(0, 300);
  await createAdminClient().from("vouchers").update({ payout_info: info || null }).eq("owner_id", profile.id);
  revalidatePath("/dashboard/referral");
  return { ok: true };
}
