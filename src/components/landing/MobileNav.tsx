"use client";

import { ArrowRight, Menu, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const LINKS = [
  ["#fitur", "Fitur"],
  ["#template", "Template"],
  ["#kegunaan", "Kegunaan"],
  ["#contoh", "Contoh Program"],
] as const;

/** Menu landing untuk layar kecil (di desktop menu tampil di header). */
export default function MobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button type="button" className="grid h-10 w-10 place-items-center rounded-lg text-slate-700 hover:bg-slate-100" onClick={() => setOpen((o) => !o)} aria-label={open ? "Tutup menu" : "Buka menu"} aria-expanded={open}>
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      {open && (
        <>
          <div className="fixed inset-x-0 bottom-0 top-16 z-20 bg-slate-900/30" onClick={() => setOpen(false)} aria-hidden />
          <nav className="absolute inset-x-0 top-16 z-30 border-b border-slate-200 bg-white px-5 pb-5 pt-2 shadow-lg">
            <Link href="/tentang" onClick={() => setOpen(false)} className="mb-2 flex items-center gap-3 rounded-xl border border-brand-100 bg-gradient-to-r from-brand-50 to-amber-50 p-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white shadow-sm"><Sparkles className="h-4 w-4 text-amber-500" /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-brand-800">Solusi dari kami</span>
                <span className="block text-xs text-slate-600">Hemat waktu panitia, sertifikat resmi dan dapat divalidasi</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-brand-600" />
            </Link>
            {LINKS.map(([href, label]) => (
              <a key={href} href={href} onClick={() => setOpen(false)} className="block border-b border-slate-100 px-1 py-3 text-sm font-medium text-slate-700 last:border-0">{label}</a>
            ))}
            <Link href="/login" onClick={() => setOpen(false)} className="btn mt-3 w-full">Masuk</Link>
          </nav>
        </>
      )}
    </div>
  );
}
