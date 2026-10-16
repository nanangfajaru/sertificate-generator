import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { FREE_PROGRAM_LIMIT } from "@/lib/db";
import { TEMPLATES } from "@/lib/certificate/templates";
import { LayoutTemplate } from "lucide-react";
import { createProgram } from "../../actions";
import ProgramForm from "../../ProgramForm";

export const metadata = { title: "Program baru" };

export default async function NewProgramPage({ searchParams }: { searchParams: Promise<{ template?: string; design?: string }> }) {
  const { supabase, isPro, profile } = await requireUser();
  const sp = await searchParams;
  // Template / desain yang dipilih dari halaman Template (Pro dijaga lagi di server saat menyimpan).
  const tpl = TEMPLATES.find((t) => t.id === sp.template && (t.tier === "free" || isPro));
  const { data: design } = isPro && sp.design && /^[0-9a-f-]{36}$/.test(sp.design)
    ? await supabase.from("program_designs").select("id, name").eq("id", sp.design).eq("owner_id", profile.id).maybeSingle()
    : { data: null };
  const chosen = design ? `Desain sendiri: ${design.name}` : tpl?.name;
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
      {chosen && (
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3 text-sm">
          <LayoutTemplate className="h-4 w-4 shrink-0 text-brand-600" />
          <p className="min-w-0 flex-1 text-brand-900">Sertifikat memakai <b>{chosen}</b>. Isi data acara, lalu lanjut atur formulir.</p>
          <Link href="/dashboard/templates" className="text-xs font-medium text-brand-700 hover:underline">Ganti template</Link>
        </div>
      )}
      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2"><ProgramForm wizard action={createProgram} submitLabel={chosen ? "Simpan & lanjut" : "Simpan & pilih sertifikat"} defaultOrg={profile.organization ?? ""} preset={{ templateId: tpl?.id, designId: design?.id }} /></div>
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
