import "server-only";
import { notFound } from "next/navigation";
import { cache } from "react";
import { requireUser } from "./auth";
import type { Program, ProgramField } from "./db";

// cache(): layout dan halaman yang sama-sama memanggil ini dalam satu permintaan hanya
// memicu satu set query. Program dan field diambil paralel (bukan berurutan).
const load = cache(async (id: string) => {
  const s = await requireUser();
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const [{ data: program }, { data: fields }] = await Promise.all([
    s.supabase.from("programs").select("*").eq("id", id).maybeSingle(),
    s.supabase.from("program_fields").select("*").eq("program_id", id).order("sort"),
  ]);
  if (!program) notFound();
  return { ...s, program: program as Program, fields: (fields ?? []) as ProgramField[] };
});

/** Ambil program milik user yang sedang login (RLS memastikan kepemilikan). */
export function getOwnedProgram(id: string) {
  return load(id);
}
