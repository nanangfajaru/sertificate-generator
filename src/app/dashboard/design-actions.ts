"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { customLayoutSchema } from "@/lib/certificate/validate";
import { dbError } from "@/lib/db-errors";
import { defaultCustomLayout, type DesignDTO } from "@/lib/designs";
import { createAdminClient } from "@/lib/supabase/admin";

type DesignResult = { error?: string; design?: DesignDTO };

const metaSchema = z.object({
  name: z.string().trim().max(60).optional(),
  path: z.string().min(5).max(300),
  previewPath: z.string().min(5).max(300),
  kind: z.enum(["pdf", "png", "jpg"]),
  width: z.number().positive(),
  height: z.number().positive(),
});

const nameSchema = z.string().trim().min(1, "Nama desain wajib diisi").max(60, "Nama desain maksimal 60 karakter");

function row2dto(r: { id: string; name: string; kind: "pdf" | "png" | "jpg"; layout: unknown; updated_at: string }, previewUrl: string | null): DesignDTO {
  return { id: r.id, name: r.name, kind: r.kind, layout: r.layout as DesignDTO["layout"], previewUrl, updatedAt: r.updated_at };
}

/** Semua paket boleh membuat & menyimpan desain; batas jumlah dijaga trigger database. */
export async function createDesign(programId: string, meta: unknown): Promise<DesignResult> {
  const { supabase, profile } = await requireUser();
  const parsed = metaSchema.safeParse(meta);
  if (!parsed.success) return { error: "Data desain tidak valid" };
  const m = parsed.data;
  const prefix = `${profile.id}/${programId}/`;
  if (!m.path.startsWith(prefix) || !m.previewPath.startsWith(prefix)) return { error: "Path file tidak valid" };

  const cleanup = () => supabase.storage.from("designs").remove([m.path, m.previewPath]);

  const { data: prog } = await supabase.from("programs").select("mapping, owner_id").eq("id", programId).maybeSingle();
  if (!prog) {
    await cleanup();
    return { error: "Program tidak ditemukan" };
  }
  if (prog.owner_id !== profile.id) {
    await cleanup();
    return { error: "Program ini milik pengguna lain. Sebagai admin Anda hanya bisa melihat; perubahan harus dilakukan pemilik program." };
  }
  const { count } = await supabase.from("program_designs").select("id", { count: "exact", head: true }).eq("program_id", programId);
  const nameField = (prog.mapping as Record<string, string | null>)?.name;

  const { data, error } = await supabase
    .from("program_designs")
    .insert({
      program_id: programId,
      name: m.name || `Desain ${(count ?? 0) + 1}`,
      file_path: m.path,
      preview_path: m.previewPath,
      kind: m.kind,
      layout: defaultCustomLayout(Math.round((1000 * m.height) / m.width), nameField),
    })
    .select("id, name, kind, layout, updated_at")
    .single();
  if (error || !data) {
    await cleanup();
    return { error: dbError(error?.message ?? "") };
  }
  const { data: signed } = await createAdminClient().storage.from("designs").createSignedUrl(m.previewPath, 3600);
  revalidatePath(`/dashboard/programs/${programId}/design`);
  return { design: row2dto(data, signed?.signedUrl ?? null) };
}

/** Simpan nama + posisi elemen. Bila desain ini sedang dipakai, snapshot program ikut diperbarui. */
export async function saveDesign(designId: string, input: { name: string; layout: unknown }): Promise<{ error?: string; ok?: boolean; updatedAt?: string }> {
  const { supabase } = await requireUser();
  const name = nameSchema.safeParse(input.name);
  if (!name.success) return { error: name.error.issues[0].message };
  const layout = customLayoutSchema.safeParse(input.layout);
  if (!layout.success) return { error: "Layout tidak valid" };

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("program_designs")
    .update({ name: name.data, layout: layout.data, updated_at: now })
    .eq("id", designId)
    .select("program_id")
    .maybeSingle();
  if (error) return { error: dbError(error.message) };
  if (!data) return { error: "Desain tidak ditemukan" };

  // Sinkronkan ke program jika desain ini yang aktif (tidak mengganti file, jadi aman bagi paket apa pun).
  await supabase.from("programs").update({ design_layout: layout.data }).eq("id", data.program_id).eq("design_id", designId).eq("cert_mode", "custom");
  revalidatePath(`/dashboard/programs/${data.program_id}`, "layout");
  return { ok: true, updatedAt: now };
}

/** Menggunakan desain untuk sertifikat: khusus Pro (dijaga juga oleh trigger database). */
export async function useDesign(programId: string, designId: string): Promise<{ error?: string; ok?: boolean }> {
  const { supabase, isPro } = await requireUser();
  if (!isPro) return { error: "Menggunakan desain sendiri untuk sertifikat hanya tersedia di paket Pro." };

  const { data: d } = await supabase.from("program_designs").select("id, file_path, preview_path, kind, layout").eq("id", designId).eq("program_id", programId).maybeSingle();
  if (!d) return { error: "Desain tidak ditemukan" };

  const { error } = await supabase
    .from("programs")
    .update({ cert_mode: "custom", design_id: d.id, design_path: d.file_path, design_preview_path: d.preview_path, design_kind: d.kind, design_layout: d.layout })
    .eq("id", programId);
  if (error) return { error: dbError(error.message) };
  revalidatePath(`/dashboard/programs/${programId}`, "layout");
  return { ok: true };
}

export async function deleteDesign(designId: string): Promise<{ error?: string; ok?: boolean }> {
  const { supabase } = await requireUser();
  const { data: d } = await supabase.from("program_designs").select("id, program_id, file_path, preview_path").eq("id", designId).maybeSingle();
  if (!d) return { error: "Desain tidak ditemukan" };

  // Jika sedang dipakai, kembalikan program ke template lebih dulu (beralih ke template diizinkan semua paket).
  await supabase
    .from("programs")
    .update({ cert_mode: "template", design_id: null, design_path: null, design_preview_path: null, design_kind: null, design_layout: null })
    .eq("id", d.program_id)
    .eq("design_id", designId);

  const { error } = await supabase.from("program_designs").delete().eq("id", designId);
  if (error) return { error: dbError(error.message) };
  await supabase.storage.from("designs").remove([d.file_path, d.preview_path]);
  revalidatePath(`/dashboard/programs/${d.program_id}`, "layout");
  return { ok: true };
}
