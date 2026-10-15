"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

type Filter = { param: string; label: string; options: [value: string, label: string][] };

/** Kolom cari + filter untuk daftar admin; nilai disimpan di URL dan mereset halaman ke 1. */
export default function ListToolbar({ placeholder, filters = [], pageParam = "page" }: { placeholder: string; filters?: Filter[]; pageParam?: string }) {
  const router = useRouter();
  const path = usePathname();
  const sp = useSearchParams();
  const [, start] = useTransition();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => setQ(sp.get("q") ?? ""), [sp]);

  function set(k: string, v: string) {
    const next = new URLSearchParams(sp.toString());
    if (v) next.set(k, v);
    else next.delete(k);
    next.delete(pageParam);
    const qs = next.toString();
    start(() => router.replace(qs ? `${path}?${qs}` : path, { scroll: false }));
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[14rem] flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          className="input !pl-9"
          value={q}
          placeholder={placeholder}
          aria-label={placeholder}
          onChange={(e) => {
            setQ(e.target.value);
            clearTimeout(timer.current);
            timer.current = setTimeout(() => set("q", e.target.value.trim()), 300);
          }}
        />
      </div>
      {filters.map((f) => (
        <select key={f.param} className="input !w-auto" value={sp.get(f.param) ?? ""} onChange={(e) => set(f.param, e.target.value)} aria-label={f.label}>
          <option value="">{f.label}: semua</option>
          {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      ))}
    </div>
  );
}
