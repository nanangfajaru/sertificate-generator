"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import CertificateSvg from "@/components/CertificateSvg";
import type { Layout } from "@/lib/certificate/types";
import { librarySample, type DesignDTO } from "@/lib/designs";
import { createProgram } from "../../actions";
import ProgramForm from "../../ProgramForm";

// Popup (beserta data 42 template) baru dimuat saat tombol Ganti diklik.
const TemplatePicker = dynamic(() => import("../[id]/form/TemplatePicker"), { ssr: false });

/** Sertifikat terpilih beserta pratinjaunya (pratinjau awal dihitung di server). */
export type Sel = { kind: "template" | "design"; id: string; name: string; layout: Layout; bg: string | null } | null;

/** Wizard program baru. Bila datang dari menu Template, sertifikat terpilih tampil di kanan dan bisa diganti lewat popup. */
export default function NewProgramClient({ initial, designs, isPro, defaultOrg, verifyUrl }: { initial: Sel; designs: DesignDTO[]; isPro: boolean; defaultOrg: string; verifyUrl: string }) {
  const [sel, setSel] = useState<Sel>(initial);
  const [picking, setPicking] = useState(false);
  const sample = useMemo(() => librarySample(verifyUrl), [verifyUrl]);

  const templateId = sel?.kind === "template" ? sel.id : undefined;
  const designId = sel?.kind === "design" ? sel.id : undefined;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <ProgramForm wizard action={createProgram} submitLabel="Lanjut" defaultOrg={defaultOrg} preset={{ templateId, designId }} />
      </div>
      <aside className="space-y-4 lg:sticky lg:top-20">
        {sel && (
          <div className="card !p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-slate-500">Sertifikat yang dipilih</p>
                <p className="truncate text-sm font-semibold">{sel.name}</p>
              </div>
              <button type="button" className="btn btn-sm shrink-0" onClick={() => setPicking(true)}>Ganti</button>
            </div>
            <button type="button" className="block w-full overflow-hidden rounded-lg border border-slate-200" onClick={() => setPicking(true)} aria-label="Ganti sertifikat">
              <CertificateSvg layout={sel.layout} backgroundUrl={sel.bg} logoPlaceholder className="block h-auto w-full" />
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
          current={{ mode: designId ? "custom" : "template", templateId: templateId ?? "", designId: designId ?? null }}
          designs={designs}
          onClose={() => setPicking(false)}
          onChoose={async (c) => setSel(c)}
        />
      )}
    </div>
  );
}
