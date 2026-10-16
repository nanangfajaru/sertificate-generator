"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { customLayoutSchema } from "@/lib/certificate/validate";
import type { Layout } from "@/lib/certificate/types";
import { dbError } from "@/lib/db-errors";
import { adaptLayout, defaultCustomLayout, fieldIdsOf, type DesignDTO, type ForeignField } from "@/lib/designs";
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
const NOT_OWNER = "Program ini milik pengguna lain. Sebagai admin Anda hanya bisa melihat; perubahan harus dilakukan pemilik program.";

function row2dto(r: { id: string; name: string; kind: "pdf" | "png" | "jpg"; layout: unknown; updated_at: string }, previewUrl: string | null): DesignDTO {
  return { id: r.id, name: r.name, kind: r.kind, layout: r.layout as DesignDTO["layout"], previewUrl, updatedAt: r.updated_at };
}

function revalidateDesigns(programIds: (string | null | undefined)[]) {
  revalidatePath("/dashboard/templates");
  for (const id of new Set(programIds)) if (id) revalidatePath(`/dashboard/programs/${id}`, "layout");
}

/** Sesuaikan layout desain dengan field program tujuan (field dari program lain dipetakan lewat label). */
async function layoutFor(supabase: SupabaseClient, layout: Layout, programId: string): Promise<Layout> {
  const { data: fields } = await supabase.from("program_fields").select("id, label").eq("program_id", programId);
  const target = { fields: fields ?? [] };
  const own = new Set(target.fields.map((f) => f.id));
  const unknown = [...new Set(fieldIdsOf(layout))].filter((id) => !own.has(id));
  const foreign = new Map<string, ForeignField>();
  if (unknown.length) {
    const { data: rows } = await supabase.from("program_fields").select("id, label, program_id").in("id", unknown);
    const progIds = [...new Set((rows ?? []).map((r) => r.program_id))];
    const { data: progs } = progIds.length ? await supabase.from("programs").select("id, mapping").in("id", progIds) : { data: [] };
    const nameOf = new Map((progs ?? []).map((p) => [p.id, (p.mapping as Record<string, string | null> | null)?.name ?? null]));
    for (const r of rows ?? []) foreign.set(r.id, { label: r.label, isName: nameOf.get(r.program_id) === r.id });
  }
  return adaptLayout(layout, target, foreign);
}

/** Desain baru masuk pustaka pengguna; batas jumlah dijaga trigger database. */
export async function createDesign(programId: string | null, meta: unknown): Promise<DesignResult> {
  const { supabase, profile } = await requireUser();
  const parsed = metaSchema.safeParse(meta);
  if (!parsed.success) return { error: "Data desain tidak valid" };
  const m = parsed.data;
  const prefix = `${profile.id}/`;
  if (!m.path.startsWith(prefix) || !m.previewPath.startsWith(prefix)) return { error: "Path file tidak valid" };

  const cleanup = () => supabase.storage.from("designs").remove([m.path, m.previewPath]);

  if (programId) {
    const { data: prog } = await supabase.from("programs").select("owner_id").eq("id", programId).maybeSingle();
    if (!prog || prog.owner_id !== profile.id) {
      await cleanup();
      return { error: prog ? NOT_OWNER : "Program tidak ditemukan" };
    }
  }
  const { count } = await supabase.from("program_designs").select("id", { count: "exact", head: true }).eq("owner_id", profile.id);

  const { data, error } = await supabase
    .from("program_designs")
    .insert({
      owner_id: profile.id,
      program_id: programId,
      name: m.name || `Desain ${(count ?? 0) + 1}`,
      file_path: m.path,
      preview_path: m.previewPath,
      kind: m.kind,
      layout: defaultCustomLayout(Math.round((1000 * m.height) / m.width)),
    })
    .select("id, name, kind, layout, updated_at")
    .single();
  if (error || !data) {
    await cleanup();
    return { error: dbError(error?.message ?? "") };
  }
  const { data: signed } = await createAdminClient().storage.from("designs").createSignedUrl(m.previewPath, 3600);
  revalidateDesigns([programId]);
  return { design: row2dto(data, signed?.signedUrl ?? null) };
}

/** Simpan nama + posisi elemen. Program yang sedang memakai desain ini ikut diperbarui. */
export async function saveDesign(designId: string, input: { name: string; layout: unknown }): Promise<{ error?: string; ok?: boolean; updatedAt?: string }> {
  const { supabase, profile } = await requireUser();
  const name = nameSchema.safeParse(input.name);
  if (!name.success) return { error: name.error.issues[0].message };
  const layout = customLayoutSchema.safeParse(input.layout);
  if (!layout.success) return { error: "Layout tidak valid" };

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("program_designs")
    .update({ name: name.data, layout: layout.data, updated_at: now })
    .eq("id", designId)
    .eq("owner_id", profile.id)
    .select("id")
    .maybeSingle();
  if (error) return { error: dbError(error.message) };
  if (!data) return { error: "Desain tidak ditemukan" };

  // Sinkronkan ke program yang memakainya (tidak mengganti file, jadi aman bagi paket apa pun).
  const { data: users } = await supabase.from("programs").select("id").eq("design_id", designId).eq("cert_mode", "custom");
  await Promise.all(
    (users ?? []).map(async (p) => supabase.from("programs").update({ design_layout: await layoutFor(supabase, layout.data as Layout, p.id) }).eq("id", p.id)),
  );
  revalidateDesigns((users ?? []).map((p) => p.id));
  return { ok: true, updatedAt: now };
}

/** Menggunakan desain dari pustaka untuk sertifikat program: khusus Pro (dijaga juga oleh trigger database). */
export async function useDesign(programId: string, designId: string): Promise<{ error?: string; ok?: boolean }> {
  const { supabase, isPro, profile } = await requireUser();
  if (!isPro) return { error: "Menggunakan desain sendiri untuk sertifikat hanya tersedia di paket Pro." };

  const [{ data: d }, { data: prog }] = await Promise.all([
    supabase.from("program_designs").select("id, file_path, preview_path, kind, layout").eq("id", designId).eq("owner_id", profile.id).maybeSingle(),
    supabase.from("programs").select("owner_id").eq("id", programId).maybeSingle(),
  ]);
  if (!d) return { error: "Desain tidak ditemukan" };
  if (!prog) return { error: "Program tidak ditemukan" };
  if (prog.owner_id !== profile.id) return { error: NOT_OWNER };

  const { error } = await supabase
    .from("programs")
    .update({ cert_mode: "custom", design_id: d.id, design_path: d.file_path, design_preview_path: d.preview_path, design_kind: d.kind, design_layout: await layoutFor(supabase, d.layout as Layout, programId) })
    .eq("id", programId);
  if (error) return { error: dbError(error.message) };
  revalidateDesigns([programId]);
  return { ok: true };
}

export async function deleteDesign(designId: string): Promise<{ error?: string; ok?: boolean }> {
  const { supabase, profile } = await requireUser();
  const { data: d } = await supabase.from("program_designs").select("id, file_path, preview_path").eq("id", designId).eq("owner_id", profile.id).maybeSingle();
  if (!d) return { error: "Desain tidak ditemukan" };

  // Program yang memakainya kembali ke template lebih dulu (beralih ke template diizinkan semua paket).
  const { data: users } = await supabase
    .from("programs")
    .update({ cert_mode: "template", design_id: null, design_path: null, design_preview_path: null, design_kind: null, design_layout: null })
    .eq("design_id", designId)
    .select("id");

  const { error } = await supabase.from("program_designs").delete().eq("id", designId);
  if (error) return { error: dbError(error.message) };
  await supabase.storage.from("designs").remove([d.file_path, d.preview_path]);
  revalidateDesigns((users ?? []).map((p) => p.id));
  return { ok: true };
}
