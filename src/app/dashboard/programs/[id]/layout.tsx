import Link from "next/link";
import { ArrowLeft, CalendarDays, Eye, MapPin } from "lucide-react";
import { formatDateRange } from "@/lib/certificate/sources";
import { getOwnedProgram } from "@/lib/program-server";
import ProgramTabs from "./ProgramTabs";

export default async function ProgramLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { program, profile } = await getOwnedProgram(id);
  const viewOnly = program.owner_id !== profile.id;
  return (
    <div>
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"><ArrowLeft className="h-4 w-4" /> Semua program</Link>
      <div className="relative mt-3 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-900 p-5 text-white shadow-md sm:p-6">
        <div className="pointer-events-none absolute -right-8 -top-12 h-44 w-44 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-16 right-32 h-36 w-36 rounded-full bg-white/5" />
        <div className="relative flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-bold sm:text-2xl">{program.name}</h1>
            <p className="mt-0.5 text-sm text-brand-100">{program.org_name}</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-brand-100">
              <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> {formatDateRange(program.start_date, program.end_date)}</span>
              {program.location && <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {program.location}</span>}
            </div>
          </div>
          <div className="flex gap-2 text-xs font-medium">
            <span className={`rounded-full px-3 py-1 ${program.is_open ? "bg-emerald-400/20 text-emerald-100 ring-1 ring-emerald-300/40" : "bg-white/15 text-white"}`}>{program.is_open ? "Pendaftaran dibuka" : "Pendaftaran ditutup"}</span>
            <span className="rounded-full bg-white/15 px-3 py-1">{program.approval_mode === "auto" ? "Otomatis" : "Perlu approval"}</span>
          </div>
        </div>
      </div>
      {viewOnly && (
        <p className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
          <Eye className="mt-0.5 h-4 w-4 shrink-0" />
          <span><b>Mode lihat (admin).</b> Program ini milik pengguna lain. Perubahan form, desain, dan peserta hanya bisa dilakukan oleh pemiliknya.</span>
        </p>
      )}
      <ProgramTabs id={id} />
      <div className="mt-6">{children}</div>
    </div>
  );
}
