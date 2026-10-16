import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { FREE_PROGRAM_LIMIT } from "@/lib/db";
import { TEMPLATES } from "@/lib/certificate/templates";
import CertificateSvg from "@/components/CertificateSvg";
import { brandLayout } from "@/lib/certificate/branding";
import { resolveLayout } from "@/lib/certificate/sources";
import type { Layout } from "@/lib/certificate/types";
import { librarySample } from "@/lib/designs";
import { createAdminClient } from "@/lib/supabase/admin";
import { siteUrl } from "@/lib/util";
import { createProgram } from "../../actions";
import ProgramForm from "../../ProgramForm";

export const metadata = { title: "Program baru" };

export default async function NewProgramPage({ searchParams }: { searchParams: Promise<{ template?: string; design?: string }> }) {
  const { supabase, isPro, profile } = await requireUser();
  const sp = await searchParams;
  // Template / desain yang dipilih dari halaman Template (Pro dijaga lagi di server saat menyimpan).
  const tpl = TEMPLATES.find((t) => t.id === sp.template && (t.tier === "free" || isPro));
  const { data: design } = isPro && sp.design && /^[0-9a-f-]{36}$/.test(sp.design)
    ? await supabase.from("program_designs").select("id, name, layout, preview_path").eq("id", sp.design).eq("owner_id", profile.id).maybeSingle()
    : { data: null };
  const chosen = design ? `Desain sendiri: ${design.name}` : tpl?.name;

  // Pratinjau sertifikat terpilih di samping wizard (hanya bila datang dari halaman Template).
  const sample = librarySample(`${siteUrl()}/v/contoh`);
  let preview: { layout: Layout; bg: string | null } | null = null;
  if (design) {
    const { data: signed } = await createAdminClient().storage.from("designs").createSignedUrl(design.preview_path, 3600);
    preview = { layout: resolveLayout(design.layout as Layout, sample), bg: signed?.signedUrl ?? null };
  } else if (tpl) {
    preview = { layout: brandLayout(resolveLayout(tpl.layout, sample), { certMode: "template", templateId: tpl.id, logo: true, sig1: false, sig2: false }), bg: null };
  }
  if (!isPro) {
    const { count } = await supabase.from("programs").select("id", { count: "exact", head: true });
    if ((count ?? 0) >= FREE_PROGRAM_LIMIT) redirect("/dashboard");
  }
  return (
    <div>
      <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-800">← Kembali</Link>
      <div className="mb-6 mt-2">
        <h1 className="text-2xl font-bold tracking-tight">Program baru</h1>
        <p className="mt-1 text-sm text-slate-500">Empat langkah: data acara, penandatangan, alur, lalu formulir pendaftaran & sertifikat.</p>
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2"><ProgramForm wizard action={createProgram} submitLabel="Lanjut" defaultOrg={profile.organization ?? ""} preset={{ templateId: tpl?.id, designId: design?.id }} /></div>
        <aside className="space-y-4 lg:sticky lg:top-20">
          {preview && (
            <div className="card !p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Sertifikat yang dipilih</p>
                  <p className="truncate text-sm font-semibold">{chosen}</p>
                </div>
                <Link href="/dashboard/templates" className="btn btn-sm shrink-0">Ganti</Link>
              </div>
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <CertificateSvg layout={preview.layout} backgroundUrl={preview.bg} logoPlaceholder className="block h-auto w-full" />
              </div>
              <p className="mt-2 text-xs text-slate-500">Teks contoh akan diganti dengan data acara Anda.</p>
            </div>
          )}
        <div className="card space-y-3 text-sm text-slate-600">
          <h2 className="font-semibold text-slate-900">Tips</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Isian tersimpan otomatis setelah langkah 3. Bila terhenti, program bisa dilanjutkan dari daftar program.</li>
            <li>Semua isian bisa diubah lagi kapan saja dari halaman program.</li>
          </ul>
          <p className="text-xs text-slate-500">Logo penyelenggara dan tanda tangan bersifat opsional dan bisa ditambahkan nanti.</p>
        </div>
        </aside>
      </div>
    </div>
  );
}
