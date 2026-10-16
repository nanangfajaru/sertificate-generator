"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CalendarDays, Eye, MapPin } from "lucide-react";
import ProgramTabs from "./ProgramTabs";

type Props = {
  id: string;
  name: string;
  org: string;
  dateText: string;
  location: string | null;
  isOpen: boolean;
  auto: boolean;
  viewOnly: boolean;
};

/**
 * Kepala halaman program. Saat alur pembuatan program baru (?setup=1) tampil seperti wizard
 * (judul "Program baru", tanpa banner & tab edit) agar langkah Sertifikat dan Formulir terasa satu alur.
 */
export default function ProgramChrome(p: Props) {
  const setup = useSearchParams().get("setup") === "1";

  if (setup) {
    return (
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-800">← Kembali</Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Program baru</h1>
        <p className="mt-1 text-sm text-slate-500">Lima langkah: data acara, penandatangan, alur, pilih sertifikat, lalu atur formulir pendaftaran.</p>
      </div>
    );
  }

  return (
    <>
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"><ArrowLeft className="h-4 w-4" /> Semua program</Link>
      <div className="relative mt-3 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-900 p-5 text-white shadow-md sm:p-6">
        <div className="pointer-events-none absolute -right-8 -top-12 h-44 w-44 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-16 right-32 h-36 w-36 rounded-full bg-white/5" />
        <div className="relative flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-bold sm:text-2xl">{p.name}</h1>
            <p className="mt-0.5 text-sm text-brand-100">{p.org}</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-brand-100">
              <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> {p.dateText}</span>
              {p.location && <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {p.location}</span>}
            </div>
          </div>
          <div className="flex gap-2 text-xs font-medium">
            <span className={`rounded-full px-3 py-1 ${p.isOpen ? "bg-emerald-400/20 text-emerald-100 ring-1 ring-emerald-300/40" : "bg-white/15 text-white"}`}>{p.isOpen ? "Pendaftaran dibuka" : "Pendaftaran ditutup"}</span>
            <span className="rounded-full bg-white/15 px-3 py-1">{p.auto ? "Otomatis" : "Perlu approval"}</span>
          </div>
        </div>
      </div>
      {p.viewOnly && (
        <p className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
          <Eye className="mt-0.5 h-4 w-4 shrink-0" />
          <span><b>Mode lihat (admin).</b> Program ini milik pengguna lain. Perubahan form, desain, dan peserta hanya bisa dilakukan oleh pemiliknya.</span>
        </p>
      )}
      <ProgramTabs id={p.id} />
      <div className="mt-6" />
    </>
  );
}
