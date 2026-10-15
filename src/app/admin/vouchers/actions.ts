"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSessionProfile } from "@/lib/auth";
import { normalizeCode } from "@/lib/billing";
import { createAdminClient } from "@/lib/supabase/admin";

async function guard() {
  const s = await getSessionProfile();
  return s?.profile.is_admin ? s : null;
}

const schema = z.object({
  code: z.string().regex(/^[A-Z0-9_-]{3,32}$/, "Kode 3–32 karakter: huruf, angka, - atau _"),
  label: z.string().trim().max(80),
  discount: z.coerce.number().int().min(0).max(100),
  commission: z.coerce.number().int().min(0).max(100),
  maxUses: z.preprocess((v) => (v === "" || v == null ? null : v), z.coerce.number().int().min(1).nullable()),
  expires: z.preprocess((v) => (v === "" || v == null ? null : v), z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable()),
});

export async function createVoucher(_: unknown, fd: FormData): Promise<{ error?: string; ok?: boolean }> {
  if (!(await guard())) return { error: "Tidak diizinkan" };
  const p = schema.safeParse({
    code: normalizeCode(String(fd.get("code") ?? "")),
    label: String(fd.get("label") ?? ""),
    discount: fd.get("discount"),
    commission: fd.get("commission"),
    maxUses: fd.get("maxUses"),
    expires: fd.get("expires"),
  });
  if (!p.success) return { error: p.error.issues[0]?.message ?? "Data tidak valid" };
  const { error } = await createAdminClient().from("vouchers").insert({
    code: p.data.code,
    label: p.data.label || null,
    discount_percent: p.data.discount,
    commission_percent: p.data.commission,
    max_uses: p.data.maxUses,
    expires_at: p.data.expires ? `${p.data.expires}T23:59:59+07:00` : null,
  });
  if (error) return { error: error.code === "23505" ? "Kode voucher sudah ada" : "Gagal menyimpan voucher" };
  revalidatePath("/admin/vouchers");
  return { ok: true };
}

export async function setVoucherActive(id: string, active: boolean) {
  if (!(await guard())) return;
  await createAdminClient().from("vouchers").update({ active }).eq("id", id);
  revalidatePath("/admin/vouchers");
}

export async function saveReferralDefaults(_: unknown, fd: FormData): Promise<{ error?: string; ok?: boolean }> {
  if (!(await guard())) return { error: "Tidak diizinkan" };
  const p = z.object({ discount: z.coerce.number().int().min(0).max(100), commission: z.coerce.number().int().min(0).max(100) }).safeParse({ discount: fd.get("discount"), commission: fd.get("commission") });
  if (!p.success) return { error: "Isi persentase 0–100" };
  const { error } = await createAdminClient().from("app_settings").upsert({ key: "referral_defaults", value: { discount_percent: p.data.discount, commission_percent: p.data.commission }, updated_at: new Date().toISOString() });
  if (error) return { error: "Gagal menyimpan pengaturan" };
  revalidatePath("/admin/vouchers");
  revalidatePath("/dashboard/referral");
  return { ok: true };
}

export async function savePricing(_: unknown, fd: FormData): Promise<{ error?: string; ok?: boolean }> {
  if (!(await guard())) return { error: "Tidak diizinkan" };
  const n = z.coerce.number().int().min(0).max(100_000_000);
  const p = z.object({ ml: n, mp: n, yl: n, yp: n }).safeParse({ ml: fd.get("monthlyList"), mp: fd.get("monthlyPrice"), yl: fd.get("yearlyList"), yp: fd.get("yearlyPrice") });
  if (!p.success) return { error: "Isi harga dengan angka rupiah" };
  const d = p.data;
  if (d.mp < 1 || d.yp < 1) return { error: "Harga jual minimal Rp1" };
  if (d.ml < d.mp || d.yl < d.yp) return { error: "Harga coret tidak boleh lebih kecil dari harga jual" };
  const { error } = await createAdminClient().from("app_settings").upsert({
    key: "pricing",
    value: { monthly: { list: d.ml, price: d.mp }, yearly: { list: d.yl, price: d.yp } },
    updated_at: new Date().toISOString(),
  });
  if (error) return { error: "Gagal menyimpan harga" };
  revalidatePath("/admin/vouchers");
  revalidatePath("/dashboard/upgrade");
  return { ok: true };
}
