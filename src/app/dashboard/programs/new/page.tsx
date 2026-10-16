import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { FREE_PROGRAM_LIMIT } from "@/lib/db";
import { TEMPLATES } from "@/lib/certificate/templates";
import type { DesignDTO } from "@/lib/designs";
import { createAdminClient } from "@/lib/supabase/admin";
import { siteUrl } from "@/lib/util";
import NewProgramClient, { type Sel } from "./NewProgramClient";
import { brandLayout } from "@/lib/certificate/branding";
import { resolveLayout } from "@/lib/certificate/sources";
import { librarySample } from "@/lib/designs";

export const metadata = { title: "Program baru" };

export default async function NewProgramPage({ searchParams }: { searchParams: Promise<{ template?: string; design?: string }> }) {
  const { supabase, isPro, profile } = await requireUser();
  if (!isPro) {
    const { count } = await supabase.from("programs").select("id", { count: "exact", head: true });
    if ((count ?? 0) >= FREE_PROGRAM_LIMIT) redirect("/dashboard");
  }
  const sp = await searchParams;

  // Pustaka desain sendiri (khusus Pro) untuk popup Ganti sertifikat.
  let designs: DesignDTO[] = [];
  if (isPro) {
    const { data: rows } = await supabase.from("program_designs").select("id, name, kind, layout, preview_path, updated_at").eq("owner_id", profile.id).order("created_at");
    const paths = (rows ?? []).map((r) => r.preview_path);
    const { data: signed } = paths.length ? await createAdminClient().storage.from("designs").createSignedUrls(paths, 3600) : { data: [] };
    const urlByPath = new Map((signed ?? []).map((x) => [x.path, x.signedUrl]));
    designs = (rows ?? []).map((r) => ({ id: r.id, name: r.name, kind: r.kind, layout: r.layout as DesignDTO["layout"], previewUrl: urlByPath.get(r.preview_path) ?? null, updatedAt: r.updated_at }));
  }

  // Template / desain yang dipilih dari menu Template (Pro dijaga lagi di server saat menyimpan).
  const tpl = TEMPLATES.find((t) => t.id === sp.template && (t.tier === "free" || isPro));
  const design = designs.find((d) => d.id === sp.design);
  const sample = librarySample(`${siteUrl()}/v/contoh`);
  const initial: Sel = design
    ? { kind: "design", id: design.id, name: `Desain sendiri: ${design.name}`, layout: resolveLayout(design.layout, sample), bg: design.previewUrl }
    : tpl
      ? { kind: "template", id: tpl.id, name: tpl.name, layout: brandLayout(resolveLayout(tpl.layout, sample), { certMode: "template", templateId: tpl.id, logo: true, sig1: false, sig2: false }), bg: null }
      : null;

  return (
    <div>
      <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-800">← Kembali</Link>
      <div className="mb-6 mt-2">
        <h1 className="text-2xl font-bold tracking-tight">Program baru</h1>
        <p className="mt-1 text-sm text-slate-500">Empat langkah: data acara, penandatangan, alur, lalu formulir pendaftaran & sertifikat.</p>
      </div>
      <NewProgramClient initial={initial} designs={designs} isPro={isPro} defaultOrg={profile.organization ?? ""} verifyUrl={`${siteUrl()}/v/contoh`} />
    </div>
  );
}
