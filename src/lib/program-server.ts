import "server-only";
import { notFound } from "next/navigation";
import { requireUser } from "./auth";
import type { Program, ProgramField } from "./db";

/** Ambil program milik user yang sedang login (RLS memastikan kepemilikan). */
export async function getOwnedProgram(id: string) {
  const s = await requireUser();
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { data: program } = await s.supabase.from("programs").select("*").eq("id", id).maybeSingle();
  if (!program) notFound();
  const { data: fields } = await s.supabase.from("program_fields").select("*").eq("program_id", id).order("sort");
  return { ...s, program: program as Program, fields: (fields ?? []) as ProgramField[] };
}
