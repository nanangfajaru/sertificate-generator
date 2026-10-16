"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import type { Program, ProgramField } from "@/lib/db";
import { cleanParticipantData } from "@/lib/participant-data";

/**
 * Panitia mengubah isian seorang peserta. Isian divalidasi sama seperti formulir;
 * data untuk field yang sudah dihapus dari formulir tetap disimpan.
 * Sertifikat dibuat saat diunduh, jadi perubahan langsung terlihat di PDF & halaman sertifikat.
 */
export async function updateParticipantData(programId: string, participantId: string, raw: Record<string, string>): Promise<{ error?: string; data?: Record<string, string> }> {
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
  const { error } = await supabase.from("participants").update({ data }).eq("id", participantId).eq("program_id", programId);
  if (error) return { error: "Gagal menyimpan, silakan coba lagi." };
  revalidatePath(`/dashboard/programs/${programId}/participants`);
  return { data };
}
