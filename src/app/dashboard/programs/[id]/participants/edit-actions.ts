"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import type { Program, ProgramField } from "@/lib/db";
import { cleanParticipantData } from "@/lib/participant-data";
import { approveParticipants } from "@/lib/approve";
import { DEFAULT_ROLE, normRole } from "@/lib/cert-types";
import { randomCode } from "@/lib/util";

/**
 * Panitia mengubah isian seorang peserta. Isian divalidasi sama seperti formulir;
 * data untuk field yang sudah dihapus dari formulir tetap disimpan.
 * Sertifikat dibuat saat diunduh, jadi perubahan langsung terlihat di PDF & halaman sertifikat.
 */
export async function updateParticipantData(programId: string, participantId: string, raw: Record<string, string>, role?: string): Promise<{ error?: string; data?: Record<string, string> }> {
  const { supabase, profile } = await requireUser();
  const [{ data: prog }, { data: f }, { data: part }] = await Promise.all([
    supabase.from("programs").select("id, owner_id, mapping").eq("id", programId).maybeSingle(),
    supabase.from("program_fields").select("*").eq("program_id", programId).order("sort"),
    supabase.from("participants").select("id, data").eq("id", participantId).eq("program_id", programId).maybeSingle(),
  ]);
  if (!prog || !part) return { error: "Peserta tidak ditemukan" };
  if (prog.owner_id !== profile.id) return { error: "Hanya pemilik program yang dapat mengubah data peserta." };

  const fields = (f ?? []) as ProgramField[];
  const res = cleanParticipantData(fields, (prog as Pick<Program, "mapping">).mapping?.name, raw ?? {});
  if ("error" in res) return { error: res.error };

  const data: Record<string, string> = { ...((part.data as Record<string, string>) ?? {}) };
  for (const field of fields) {
    if (res.data[field.id] !== undefined) data[field.id] = res.data[field.id];
    else delete data[field.id];
  }
  const { error } = await supabase.from("participants").update(role === undefined ? { data } : { data, role: normRole(role) }).eq("id", participantId).eq("program_id", programId);
  if (error) return { error: "Gagal menyimpan, silakan coba lagi." };
  revalidatePath(`/dashboard/programs/${programId}/participants`);
  return { data };
}

/**
 * Penyelenggara menambah satu orang secara manual (pembicara, narasumber, panitia, dll.).
 * Hanya nama yang wajib; kolom formulir lain opsional. Langsung disetujui & sertifikat terbit.
 * Peran selain Peserta tidak dihitung kuota paket Free (dijaga trigger database).
 */
export async function addManualParticipant(programId: string, input: { role: string; data: Record<string, string>; sendEmail: boolean }): Promise<{ error?: string; ok?: boolean; name?: string }> {
  const { supabase, profile } = await requireUser();
  const [{ data: prog }, { data: f }] = await Promise.all([
    supabase.from("programs").select("*").eq("id", programId).maybeSingle(),
    supabase.from("program_fields").select("*").eq("program_id", programId).order("sort"),
  ]);
  if (!prog) return { error: "Program tidak ditemukan" };
  const program = prog as Program;
  if (program.owner_id !== profile.id) return { error: "Hanya pemilik program yang dapat menambah peserta." };

  const nameId = program.mapping?.name;
  // Hanya nama yang wajib untuk input manual.
  const fields = ((f ?? []) as ProgramField[]).map((x) => ({ ...x, required: false }));
  const res = cleanParticipantData(fields, nameId, input.data ?? {});
  if ("error" in res) return { error: res.error };
  const role = normRole(input.role);

  const { data: ins, error } = await supabase.from("participants").insert({ program_id: programId, code: randomCode(6), data: res.data, role }).select("id").single();
  if (error || !ins) {
    return { error: error?.message.includes("PLAN_LIMIT_PARTICIPANTS") ? "Kuota 100 peserta paket Free sudah penuh. Peran selain Peserta tidak dihitung kuota." : "Gagal menyimpan, silakan coba lagi." };
  }
  await approveParticipants({ ...program, notify_email: !!input.sendEmail }, [ins.id as string]);
  revalidatePath(`/dashboard/programs/${programId}`, "layout");
  return { ok: true, name: (nameId && res.data[nameId]) || (role === DEFAULT_ROLE ? "Peserta" : role) };
}
