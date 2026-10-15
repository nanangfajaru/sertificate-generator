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
    <nav className="flex flex-wrap items-center justify-between gap-2 text-sm" aria-label="Halaman">
      <p className="text-slate-500">{total ? `${from}–${Math.min(page * size, total)} dari ${total} ${noun}` : `Tidak ada ${noun}`}</p>
      {pages > 1 && (
        <div className="flex items-center gap-1.5">
          {page > 1 ? <Link href={href(page - 1)} className="btn btn-sm" aria-label="Sebelumnya"><ChevronLeft className="h-4 w-4" /></Link> : <span className="btn btn-sm cursor-not-allowed opacity-40"><ChevronLeft className="h-4 w-4" /></span>}
          <span className="px-2 text-slate-600">{page} / {pages}</span>
          {page < pages ? <Link href={href(page + 1)} className="btn btn-sm" aria-label="Berikutnya"><ChevronRight className="h-4 w-4" /></Link> : <span className="btn btn-sm cursor-not-allowed opacity-40"><ChevronRight className="h-4 w-4" /></span>}
        </div>
      )}
    </nav>
  );
}

export const pageOf = (v: string | undefined) => Math.max(1, Math.floor(Number(v)) || 1);
/** Nilai aman untuk filter ilike PostgREST di dalam .or() (tanpa koma, kurung, %, *). */
export const likeTerm = (q: string | undefined) => (q ?? "").replace(/[%*,()\\]/g, " ").trim().slice(0, 60);
