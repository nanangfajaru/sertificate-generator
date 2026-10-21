"use server";

import { revalidatePath } from "next/cache";
import { getSessionProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/** Buka/tutup pembelian paket Pro beserta pesan yang tampil ke pengguna saat ditutup. */
export async function saveCheckoutSetting(enabled: boolean, message: string): Promise<{ error?: string }> {
  const s = await getSessionProfile();
  if (!s?.profile.is_admin) return { error: "Tidak diizinkan" };
  const { error } = await createAdminClient().from("app_settings").upsert({
    key: "checkout",
    value: { enabled, message: message.trim().slice(0, 240) },
    updated_at: new Date().toISOString(),
  });
  if (error) return { error: "Gagal menyimpan pengaturan" };
  revalidatePath("/admin/transaksi");
  revalidatePath("/dashboard/upgrade", "layout");
  return {};
}

/** Hapus transaksi (mis. data uji coba). Status Pro pengguna tidak diubah. */
export async function deleteOrder(orderId: string): Promise<{ error?: string }> {
  const s = await getSessionProfile();
  if (!s?.profile.is_admin) return { error: "Tidak diizinkan" };
  const { error } = await createAdminClient().from("orders").delete().eq("order_id", orderId);
  if (error) return { error: "Gagal menghapus transaksi" };
  revalidatePath("/admin", "layout");
  revalidatePath("/dashboard/upgrade", "layout");
  revalidatePath("/dashboard/referral");
  return {};
}
