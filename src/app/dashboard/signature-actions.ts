"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX = 1024 * 1024;

async function owned(programId: string) {
  const { supabase } = await requireUser();
  if (!/^[0-9a-f-]{36}$/.test(programId)) return null;
  const { data } = await supabase.from("programs").select("id, signer1_sig_path, signer2_sig_path").eq("id", programId).maybeSingle();
  return data ? { supabase, program: data } : null;
}

const col = (n: number) => (n === 1 ? "signer1_sig_path" : "signer2_sig_path") as "signer1_sig_path" | "signer2_sig_path";

export async function uploadSignature(programId: string, n: number, fd: FormData): Promise<{ error?: string; url?: string }> {
  if (n !== 1 && n !== 2) return { error: "Penandatangan tidak valid" };
  const o = await owned(programId);
  if (!o) return { error: "Program tidak ditemukan" };
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Pilih file tanda tangan" };
  if (file.size > MAX) return { error: "Ukuran file maksimal 1 MB" };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const png = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  const jpg = bytes[0] === 0xff && bytes[1] === 0xd8;
  if (!png && !jpg) return { error: "Format harus PNG atau JPG" };

  const admin = createAdminClient();
  const path = `${programId}/sig${n}-${Date.now()}.${png ? "png" : "jpg"}`;
  const up = await admin.storage.from("signatures").upload(path, bytes, { contentType: png ? "image/png" : "image/jpeg" });
  if (up.error) return { error: "Gagal mengunggah file" };
  const old = o.program[col(n)];
  const { error } = await o.supabase.from("programs").update({ [col(n)]: path }).eq("id", programId);
  if (error) {
    await admin.storage.from("signatures").remove([path]);
    return { error: "Gagal menyimpan" };
  }
  if (old) await admin.storage.from("signatures").remove([old]);
  revalidatePath(`/dashboard/programs/${programId}`);
  const { data } = await admin.storage.from("signatures").createSignedUrl(path, 3600);
  return { url: data?.signedUrl };
}

export async function removeSignature(programId: string, n: number): Promise<{ error?: string }> {
  if (n !== 1 && n !== 2) return { error: "Penandatangan tidak valid" };
  const o = await owned(programId);
  if (!o) return { error: "Program tidak ditemukan" };
  const old = o.program[col(n)];
  const { error } = await o.supabase.from("programs").update({ [col(n)]: null }).eq("id", programId);
  if (error) return { error: "Gagal menghapus" };
  if (old) await createAdminClient().storage.from("signatures").remove([old]);
  revalidatePath(`/dashboard/programs/${programId}`);
  return {};
}

// ───────────────────────── logo penyelenggara ─────────────────────────

export async function uploadLogo(programId: string, fd: FormData): Promise<{ error?: string; url?: string }> {
  const { supabase } = await requireUser();
  if (!/^[0-9a-f-]{36}$/.test(programId)) return { error: "Program tidak ditemukan" };
  const { data: own } = await supabase.from("programs").select("id, logo_path").eq("id", programId).maybeSingle();
  if (!own) return { error: "Program tidak ditemukan" };
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Pilih file logo" };
  if (file.size > MAX) return { error: "Ukuran file maksimal 1 MB" };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const png = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  const jpg = bytes[0] === 0xff && bytes[1] === 0xd8;
  if (!png && !jpg) return { error: "Format harus PNG atau JPG" };

  const admin = createAdminClient();
  const path = `${programId}/logo-${Date.now()}.${png ? "png" : "jpg"}`;
  const up = await admin.storage.from("signatures").upload(path, bytes, { contentType: png ? "image/png" : "image/jpeg" });
  if (up.error) return { error: "Gagal mengunggah file" };
  const { error } = await supabase.from("programs").update({ logo_path: path }).eq("id", programId);
  if (error) {
    await admin.storage.from("signatures").remove([path]);
    return { error: "Gagal menyimpan" };
  }
  if (own.logo_path) await admin.storage.from("signatures").remove([own.logo_path]);
  revalidatePath(`/dashboard/programs/${programId}`, "layout");
  const { data } = await admin.storage.from("signatures").createSignedUrl(path, 3600);
  return { url: data?.signedUrl };
}

export async function removeLogo(programId: string): Promise<{ error?: string }> {
  const { supabase } = await requireUser();
  if (!/^[0-9a-f-]{36}$/.test(programId)) return { error: "Program tidak ditemukan" };
  const { data: own } = await supabase.from("programs").select("id, logo_path").eq("id", programId).maybeSingle();
  if (!own) return { error: "Program tidak ditemukan" };
  const { error } = await supabase.from("programs").update({ logo_path: null }).eq("id", programId);
  if (error) return { error: "Gagal menghapus" };
  if (own.logo_path) await createAdminClient().storage.from("signatures").remove([own.logo_path]);
  revalidatePath(`/dashboard/programs/${programId}`, "layout");
  return {};
}
