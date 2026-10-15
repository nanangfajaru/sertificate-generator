"use client";

import { LayoutGrid, Rows3, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

const STATUS = [["all", "Semua"], ["open", "Dibuka"], ["closed", "Ditutup"], ["pending", "Menunggu persetujuan"]] as const;
const SORT = [["new", "Terbaru dibuat"], ["date", "Tanggal kegiatan"], ["name", "Nama A–Z"], ["participants", "Peserta terbanyak"]] as const;

/** Pencarian, filter, urutan, dan tampilan; semuanya disimpan di URL. */
export default function ProgramToolbar({ counts }: { counts: { all: number; open: number; closed: number; pending: number } }) {
  const router = useRouter();
  const path = usePathname();
  const sp = useSearchParams();
  const [, start] = useTransition();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const status = sp.get("status") ?? "all";
  const sort = sp.get("sort") ?? "new";
  const view = sp.get("view") ?? "card";
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Sinkron bila pencarian berubah dari luar (mis. kolom cari di header).
  useEffect(() => setQ(sp.get("q") ?? ""), [sp]);

  function set(patch: Record<string, string | null>) {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v == null || v === "" || (k === "status" && v === "all") || (k === "sort" && v === "new") || (k === "view" && v === "card")) next.delete(k);
      else next.set(k, v);
    }
    if (!("page" in patch)) next.delete("page");
    const qs = next.toString();
    start(() => router.replace(qs ? `${path}?${qs}` : path, { scroll: false }));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[12rem] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              clearTimeout(timer.current);
              timer.current = setTimeout(() => set({ q: e.target.value.trim() }), 300);
            }}
            className="input !pl-9"
            placeholder="Cari nama program atau penyelenggara…"
            aria-label="Cari program"
          />
        </div>
        <select className="input !w-auto" value={sort} onChange={(e) => set({ sort: e.target.value })} aria-label="Urutkan">
          {SORT.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <div className="flex rounded-lg border border-slate-200 bg-white p-0.5" role="group" aria-label="Tampilan">
          {([["card", LayoutGrid, "Kartu"], ["table", Rows3, "Tabel"]] as const).map(([v, Icon, label]) => (
            <button key={v} type="button" aria-label={label} title={label} aria-pressed={view === v} onClick={() => set({ view: v })} className={`rounded-md p-2 ${view === v ? "bg-brand-50 text-brand-700" : "text-slate-500 hover:text-slate-800"}`}>
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {STATUS.map(([v, l]) => (
          <button key={v} type="button" onClick={() => set({ status: v })} className={`rounded-full border px-3 py-1 text-xs font-medium transition ${status === v ? "border-brand-600 bg-brand-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>
            {l} <span className={status === v ? "text-brand-100" : "text-slate-400"}>{counts[v]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
