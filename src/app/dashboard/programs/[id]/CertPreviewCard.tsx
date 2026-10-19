"use client";

import { Award, Eye, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import CertificateSvg from "@/components/CertificateSvg";
import type { Layout } from "@/lib/certificate/types";

type Props = { programId: string; templateName: string; layout: Layout; bgUrl: string | null; images: Record<string, string>; logoPlaceholder: boolean };

/** Kartu pratinjau sertifikat yang sedang dipakai (sama seperti di halaman form). */
export default function CertPreviewCard({ programId, templateName, layout, bgUrl, images, logoPlaceholder }: Props) {
  const [zoom, setZoom] = useState(false);
  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setZoom(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom]);
  const svg = <CertificateSvg layout={layout} backgroundUrl={bgUrl} images={images} logoPlaceholder={logoPlaceholder} className="block h-auto w-full" />;

  return (
    <div className="card !p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700"><Award className="h-4 w-4" /></span>
          <div className="min-w-0">
            <p className="text-xs text-slate-500">Sertifikat yang dipilih</p>
            <p className="truncate text-sm font-semibold text-navy">{templateName}</p>
          </div>
        </div>
        <Link href={`/dashboard/programs/${programId}/form?pick=1`} className="btn btn-sm shrink-0">Ganti</Link>
      </div>
      <button type="button" className="group relative block w-full overflow-hidden rounded-lg border border-slate-200 text-left" onClick={() => setZoom(true)} aria-label="Perbesar pratinjau sertifikat">
        {svg}
        <span className="absolute inset-0 grid place-items-center bg-slate-900/0 opacity-0 transition group-hover:bg-slate-900/25 group-hover:opacity-100">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm font-medium shadow"><Eye className="h-4 w-4" /> Perbesar</span>
        </span>
      </button>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button type="button" className="btn btn-sm" onClick={() => setZoom(true)}><Eye className="h-4 w-4" /> Pratinjau</button>
        <a href={`/api/programs/${programId}/sample`} target="_blank" className="btn btn-sm">Contoh PDF</a>
      </div>

      {zoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-3 sm:p-6" onClick={() => setZoom(false)} role="dialog" aria-modal="true" aria-label="Pratinjau sertifikat">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
              <p className="truncate font-semibold">{templateName}</p>
              <button className="btn btn-sm !px-2" onClick={() => setZoom(false)} aria-label="Tutup"><X className="h-4 w-4" /></button>
            </div>
            <div className="bg-slate-100 p-3 sm:p-5"><div className="mx-auto max-w-3xl overflow-hidden rounded-lg bg-white shadow-md">{svg}</div></div>
          </div>
        </div>
      )}
    </div>
  );
}
