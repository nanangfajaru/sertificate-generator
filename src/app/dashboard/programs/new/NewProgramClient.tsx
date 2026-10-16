"use client";

import { useMemo, useState } from "react";
import CertificateSvg from "@/components/CertificateSvg";
import { brandLayout } from "@/lib/certificate/branding";
import { resolveLayout } from "@/lib/certificate/sources";
import { TEMPLATES } from "@/lib/certificate/templates";
import { librarySample, type DesignDTO } from "@/lib/designs";
import { createProgram } from "../../actions";
import ProgramForm from "../../ProgramForm";
import TemplatePicker from "../[id]/form/TemplatePicker";

type Sel = { kind: "template" | "design"; id: string } | null;

/** Wizard program baru. Bila datang dari menu Template, sertifikat terpilih tampil di kanan dan bisa diganti lewat popup. */
export default function NewProgramClient({ initial, designs, isPro, defaultOrg, verifyUrl }: { initial: Sel; designs: DesignDTO[]; isPro: boolean; defaultOrg: string; verifyUrl: string }) {
  const [sel, setSel] = useState<Sel>(initial);
  const [picking, setPicking] = useState(false);
  const sample = useMemo(() => librarySample(verifyUrl), [verifyUrl]);

  const tpl = sel?.kind === "template" ? TEMPLATES.find((t) => t.id === sel.id) : undefined;
  const design = sel?.kind === "design" ? designs.find((d) => d.id === sel.id) : undefined;
  const name = design ? `Desain sendiri: ${design.name}` : tpl?.name;
  const preview = useMemo(() => {
    if (design) return { layout: resolveLayout(design.layout, sample), bg: design.previewUrl };
    if (tpl) return { layout: brandLayout(resolveLayout(tpl.layout, sample), { certMode: "template", templateId: tpl.id, logo: true, sig1: false, sig2: false }), bg: null };
    return null;
  }, [design, tpl, sample]);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <ProgramForm wizard action={createProgram} submitLabel="Lanjut" defaultOrg={defaultOrg} preset={{ templateId: tpl?.id, designId: design?.id }} />
      </div>
      <aside className="space-y-4 lg:sticky lg:top-20">
        {preview && (
          <div className="card !p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-slate-500">Sertifikat yang dipilih</p>
                <p className="truncate text-sm font-semibold">{name}</p>
              </div>
              <button type="button" className="btn btn-sm shrink-0" onClick={() => setPicking(true)}>Ganti</button>
            </div>
            <button type="button" className="block w-full overflow-hidden rounded-lg border border-slate-200" onClick={() => setPicking(true)} aria-label="Ganti sertifikat">
              <CertificateSvg layout={preview.layout} backgroundUrl={preview.bg} logoPlaceholder className="block h-auto w-full" />
            </button>
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
      {picking && (
        <TemplatePicker
          isPro={isPro}
          sample={sample}
          images={{}}
          current={{ mode: sel?.kind === "design" ? "custom" : "template", templateId: tpl?.id ?? "", designId: design?.id ?? null }}
          designs={designs}
          onClose={() => setPicking(false)}
          onChoose={async (c) => setSel({ kind: c.kind, id: c.id })}
        />
      )}
    </div>
  );
}
