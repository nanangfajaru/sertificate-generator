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
    <div>
      <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-800">← Kembali</Link>
      <div className="mb-6 mt-2">
        <h1 className="text-2xl font-bold tracking-tight">Program baru</h1>
        <p className="mt-1 text-sm text-slate-500">Lima langkah: data acara, penandatangan, alur, pilih sertifikat, lalu atur formulir pendaftaran.</p>
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2"><ProgramForm wizard action={createProgram} submitLabel="Simpan & pilih sertifikat" defaultOrg={profile.organization ?? ""} /></div>
        <aside className="card space-y-3 text-sm text-slate-600 lg:sticky lg:top-20">
          <h2 className="font-semibold text-slate-900">Tips</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Program tersimpan setelah langkah 3, lalu Anda diarahkan memilih sertifikat dan formulir.</li>
            <li>Semua isian bisa diubah lagi kapan saja dari halaman program.</li>
          </ul>
          <p className="text-xs text-slate-500">Logo penyelenggara dan tanda tangan bersifat opsional dan bisa ditambahkan nanti.</p>
        </aside>
      </div>
    </div>
  );
}
