import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Navigasi halaman sederhana. `params` = query string saat ini (tanpa parameter halaman). */
export default function Pager({ path, params, page, total, size, param = "page", noun = "data" }: { path: string; params: Record<string, string | undefined>; page: number; total: number; size: number; param?: string; noun?: string }) {
  const pages = Math.max(1, Math.ceil(total / size));
  const href = (n: number) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v && k !== param) u.set(k, v);
    if (n > 1) u.set(param, String(n));
    const qs = u.toString();
    return qs ? `${path}?${qs}` : path;
  };
  const from = total ? (page - 1) * size + 1 : 0;
  return (
    <nav className="flex flex-col-reverse gap-2 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between" aria-label="Halaman">
      <p className="text-center text-xs text-slate-500 sm:text-left sm:text-sm">{total ? `${from}–${Math.min(page * size, total)} dari ${total} ${noun}` : `Tidak ada ${noun}`}</p>
      {pages > 1 && (
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:flex sm:gap-1.5">
          {page > 1 ? <Link href={href(page - 1)} className="btn btn-sm" aria-label="Sebelumnya"><ChevronLeft className="h-4 w-4" /><span className="sm:hidden">Sebelumnya</span></Link> : <span className="btn btn-sm cursor-not-allowed opacity-40"><ChevronLeft className="h-4 w-4" /><span className="sm:hidden">Sebelumnya</span></span>}
          <span className="px-2 text-center font-medium text-slate-600">{page} / {pages}</span>
          {page < pages ? <Link href={href(page + 1)} className="btn btn-sm" aria-label="Berikutnya"><span className="sm:hidden">Berikutnya</span><ChevronRight className="h-4 w-4" /></Link> : <span className="btn btn-sm cursor-not-allowed opacity-40"><span className="sm:hidden">Berikutnya</span><ChevronRight className="h-4 w-4" /></span>}
        </div>
      )}
    </nav>
  );
}

export const pageOf = (v: string | undefined) => Math.max(1, Math.floor(Number(v)) || 1);
/** Nilai aman untuk filter ilike PostgREST di dalam .or() (tanpa koma, kurung, %, *). */
export const likeTerm = (q: string | undefined) => (q ?? "").replace(/[%*,()\\]/g, " ").trim().slice(0, 60);
