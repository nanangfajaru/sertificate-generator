"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { getTemplate } from "@/lib/certificate/templates";
import { FIELD_TYPES, type Program } from "@/lib/db";
import { approveParticipants } from "@/lib/approve";
import { notifyApproved } from "@/lib/notify";
import { dbError } from "@/lib/db-errors";
import { slugify } from "@/lib/util";
import { useDesign as applyDesign } from "./design-actions";

export type ActionState = { error?: string; ok?: boolean };

const opt = (max: number) =>
  z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? null : v), z.string().trim().max(max).nullable());

const eventSchema = z.object({
  name: z.string().trim().min(3, "Nama kegiatan minimal 3 karakter").max(150),
  org_name: z.string().trim().min(2, "Nama instansi wajib diisi").max(150),
  cert_type: z.string().trim().min(1, "Jenis sertifikat wajib diisi").max(60),
  description: z.string().trim().min(1, "Kalimat deskripsi wajib diisi").max(150),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal mulai wajib diisi"),
  end_date: z.preprocess((v) => (v === "" ? null : v), z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable()),
  location: opt(100),
  signer1_name: opt(80),
  signer1_title: opt(80),
  signer2_name: opt(80),
  signer2_title: opt(80),
});

function formToObject(fd: FormData) {
  return Object.fromEntries([...fd.entries()].filter(([, v]) => typeof v === "string"));
}

// ───────────────────────── program ─────────────────────────

export async function createProgram(_: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase, profile, isPro } = await requireUser();
  const raw = formToObject(fd);
  const parsed = eventSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const approval_mode = raw.approval_mode === "manual" ? "manual" : "auto";
  const template = getTemplate(String(raw.template_id));
  if (template.tier === "pro" && !isPro) return { error: "Template ini khusus paket Pro." };

  const nameField = randomUUID();
  const emailField = randomUUID();
  const orgField = randomUUID();
  const id = randomUUID();

  const { error } = await supabase.from("programs").insert({
    id,
    owner_id: profile.id,
    slug: slugify(parsed.data.name),
    ...parsed.data,
    approval_mode,
    notify_email: raw.notify_email === "on",
    template_id: template.id,
    mapping: { name: nameField, extra: orgField },
    setup_done: false,
  });
  if (error) return { error: dbError(error.message) };

  const { error: fErr } = await supabase.from("program_fields").insert([
    { id: nameField, program_id: id, label: "Nama lengkap", type: "text", required: true, sort: 0 },
    { id: emailField, program_id: id, label: "Email", type: "email", required: true, sort: 1 },
    { id: orgField, program_id: id, label: "Instansi / asal", type: "text", required: false, sort: 2 },
  ]);
  if (fErr) return { error: dbError(fErr.message) };

  // Desain sendiri dipilih dari halaman Template: langsung dipakai (khusus Pro, dijaga di useDesign).
  const designId = String(raw.design_id ?? "");
  if (/^[0-9a-f-]{36}$/.test(designId)) await applyDesign(id, designId);

  revalidatePath("/dashboard");
  // Lanjut ke langkah 4 (formulir & sertifikat) dari alur pembuatan program.
  redirect(`/dashboard/programs/${id}/form?setup=1`);
}

export async function updateProgram(id: string, _: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await requireUser();
  const raw = formToObject(fd);
  const parsed = eventSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const numberFormat = String(raw.number_format ?? "").trim() || "{no}/SERT/{bulan}/{tahun}";
  if (numberFormat.length > 80 || !numberFormat.includes("{no}")) return { error: "Format nomor harus memuat {no}" };

  const { data, error } = await supabase
    .from("programs")
    .update({
      ...parsed.data,
      approval_mode: raw.approval_mode === "manual" ? "manual" : "auto",
      is_open: raw.is_open === "on",
      show_qr: raw.show_qr === "on",
      notify_email: raw.notify_email === "on",
      number_format: numberFormat,
    })
    .eq("id", id)
    .select("id");
  if (error) return { error: dbError(error.message) };
  if (!data?.length) return { error: "Program tidak ditemukan" };
  revalidatePath(`/dashboard/programs/${id}`);
  return { ok: true };
}

export async function deleteProgram(id: string) {
  const { supabase, isPro } = await requireUser();
  if (!isPro) return;
  const { data: p } = await supabase.from("programs").select("design_path, design_preview_path").eq("id", id).maybeSingle();
  const { error } = await supabase.from("programs").delete().eq("id", id);
  if (error) return;
  const paths = [p?.design_path, p?.design_preview_path].filter(Boolean) as string[];
  if (paths.length) await supabase.storage.from("designs").remove(paths);
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

// ───────────────────────── form builder ─────────────────────────

const fieldsSchema = z
  .array(
    z.object({
      id: z.string().uuid(),
      label: z.string().trim().min(1, "Label field tidak boleh kosong").max(80),
      type: z.enum(FIELD_TYPES.map((t) => t.value) as [string, ...string[]]),
      required: z.boolean(),
      options: z.array(z.string().trim().min(1).max(80)).max(50),
      slot: z.enum(["", "name", "extra"]),
    }),
  )
  .min(1, "Minimal satu field")
  .max(30, "Maksimal 30 field");

export async function saveFields(programId: string, input: unknown, finishSetup = false): Promise<ActionState> {
  const { supabase } = await requireUser();
  const parsed = fieldsSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const fields = parsed.data;

  const names = fields.filter((f) => f.slot === "name");
  if (names.length !== 1) return { error: 'Tentukan tepat satu field sebagai "Nama peserta"' };
  if (fields.filter((f) => f.slot === "extra").length > 1) return { error: 'Hanya satu field yang boleh menjadi "Keterangan tambahan"' };
  for (const f of fields) if (f.type === "select" && f.options.length === 0) return { error: `Field "${f.label}" butuh minimal satu pilihan` };

  const { data: prog } = await supabase.from("programs").select("id").eq("id", programId).maybeSingle();
  if (!prog) return { error: "Program tidak ditemukan" };

  const { data: existing } = await supabase.from("program_fields").select("id").eq("program_id", programId);
  const keep = new Set(fields.map((f) => f.id));
  const removed = (existing ?? []).map((f) => f.id).filter((id) => !keep.has(id));
  if (removed.length) {
    const { error } = await supabase.from("program_fields").delete().in("id", removed);
    if (error) return { error: dbError(error.message) };
  }
  const { error } = await supabase.from("program_fields").upsert(
    fields.map((f, i) => ({
      id: f.id,
      program_id: programId,
      label: f.label,
      type: f.type,
      required: f.slot === "name" ? true : f.required,
      options: f.type === "select" ? f.options : [],
      sort: i,
    })),
  );
  if (error) return { error: dbError(error.message) };

  const mapping = { name: names[0].id, extra: fields.find((f) => f.slot === "extra")?.id ?? null };
  const { error: mErr } = await supabase.from("programs").update(finishSetup ? { mapping, setup_done: true } : { mapping }).eq("id", programId);
  if (mErr) return { error: dbError(mErr.message) };

  revalidatePath(`/dashboard/programs/${programId}`, "layout");
  return { ok: true };
}

// ───────────────────────── sertifikat ─────────────────────────

export async function chooseTemplate(programId: string, templateId: string): Promise<ActionState> {
  const { supabase, isPro } = await requireUser();
  const t = getTemplate(templateId);
  if (t.id !== templateId) return { error: "Template tidak ditemukan" };
  if (t.tier === "pro" && !isPro) return { error: "Template ini khusus paket Pro." };
  const { error } = await supabase.from("programs").update({ template_id: t.id, cert_mode: "template" }).eq("id", programId);
  if (error) return { error: dbError(error.message) };
  revalidatePath(`/dashboard/programs/${programId}`, "layout");
  return { ok: true };
}

export async function switchToTemplate(programId: string): Promise<ActionState> {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("programs").update({ cert_mode: "template" }).eq("id", programId);
  if (error) return { error: dbError(error.message) };
  revalidatePath(`/dashboard/programs/${programId}`, "layout");
  return { ok: true };
}

// ───────────────────────── peserta ─────────────────────────

export async function setParticipantStatus(programId: string, ids: string[], status: "approved" | "rejected" | "pending"): Promise<ActionState> {
  const { supabase } = await requireUser();
  if (!ids.length) return { error: "Pilih peserta terlebih dahulu" };
  if (ids.length > 500) return { error: "Maksimal 500 peserta sekali proses" };
  const { data: program } = await supabase.from("programs").select("*").eq("id", programId).maybeSingle();
  if (!program) return { error: "Program tidak ditemukan" };

  // Pastikan semua id memang milik program ini (RLS membatasi ke program milik user).
  const { data: owned } = await supabase.from("participants").select("id").eq("program_id", programId).in("id", ids);
  const ownedIds = (owned ?? []).map((r) => r.id);

  if (status === "approved") await approveParticipants(program as Program, ownedIds);
  else await supabase.from("participants").update({ status, revoked_at: null, revoked_reason: null }).in("id", ownedIds);

  revalidatePath(`/dashboard/programs/${programId}/participants`);
  return { ok: true };
}

export async function deleteParticipants(programId: string, ids: string[]): Promise<ActionState> {
  const { supabase } = await requireUser();
  if (!ids.length) return { error: "Pilih peserta terlebih dahulu" };
  const { error } = await supabase.from("participants").delete().eq("program_id", programId).in("id", ids);
  if (error) return { error: dbError(error.message) };
  revalidatePath(`/dashboard/programs/${programId}/participants`);
  return { ok: true };
}

export async function resendCertificateEmails(programId: string, ids: string[]): Promise<ActionState & { message?: string }> {
  const { supabase } = await requireUser();
  if (!ids.length) return { error: "Pilih peserta terlebih dahulu" };
  if (ids.length > 100) return { error: "Maksimal 100 peserta sekali kirim" };
  const { data: owned } = await supabase.from("participants").select("id").eq("program_id", programId).eq("status", "approved").in("id", ids);
  const ownedIds = (owned ?? []).map((r) => r.id);
  if (!ownedIds.length) return { error: "Hanya peserta yang sudah disetujui yang dapat dikirimi email" };

  const r = await notifyApproved(programId, ownedIds, true);
  revalidatePath(`/dashboard/programs/${programId}/participants`);
  if (!r.sent && r.failed) return { error: "Email gagal dikirim. Periksa konfigurasi SMTP." };
  if (!r.sent) return { error: "Tidak ada email terkirim. Pastikan form memiliki field bertipe Email dan SMTP sudah dikonfigurasi." };
  return { ok: true, message: `${r.sent} email terkirim${r.failed ? `, ${r.failed} gagal` : ""}${r.skipped ? `, ${r.skipped} dilewati (tanpa email)` : ""}.` };
}

/** Mencabut sertifikat yang sudah terbit: catatan tetap ada, tautan/QR menampilkan "dicabut". */
export async function revokeParticipants(programId: string, ids: string[], reason: string): Promise<ActionState & { message?: string }> {
  const { supabase } = await requireUser();
  if (!ids.length) return { error: "Pilih peserta terlebih dahulu" };
  if (ids.length > 500) return { error: "Maksimal 500 peserta sekali proses" };
  const note = reason.trim().slice(0, 200) || null;

  const { data, error } = await supabase
    .from("participants")
    .update({ status: "revoked", revoked_at: new Date().toISOString(), revoked_reason: note })
    .eq("program_id", programId)
    .eq("status", "approved")
    .in("id", ids)
    .select("id");
  if (error) return { error: dbError(error.message) };
  if (!data?.length) return { error: "Hanya sertifikat yang sudah terbit (status Disetujui) yang dapat dicabut" };
  revalidatePath(`/dashboard/programs/${programId}/participants`);
  return { ok: true, message: `${data.length} sertifikat dicabut. Tautan dan QR-nya kini menampilkan status "dicabut".` };
}
