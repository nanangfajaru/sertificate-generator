import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { FREE_PROGRAM_LIMIT } from "@/lib/db";
import { createProgram } from "../../actions";
import ProgramForm from "../../ProgramForm";

export const metadata = { title: "Program baru" };

export default async function NewProgramPage() {
  const { supabase, isPro, profile } = await requireUser();
  if (!isPro) {
    const { count } = await supabase.from("programs").select("id", { count: "exact", head: true });
    if ((count ?? 0) >= FREE_PROGRAM_LIMIT) redirect("/dashboard");
  }
  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-800">← Kembali</Link>
      <div className="mb-6 mt-3 rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-900 p-6 text-white shadow-md">
        <h1 className="text-2xl font-bold">Program baru</h1>
        <p className="mt-1 text-sm text-brand-100">Isi data kegiatan, lalu atur formulir dan desain sertifikatnya di langkah berikutnya.</p>
      </div>
      <ProgramForm action={createProgram} submitLabel="Buat program" defaultOrg={profile.organization ?? ""} />
    </div>
  );
}
