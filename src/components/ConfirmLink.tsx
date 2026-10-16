"use client";

import { LayoutTemplate } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/** Tautan yang meminta konfirmasi lewat dialog kecil sebelum berpindah halaman. */
export default function ConfirmLink({ href, title, message, confirmLabel = "Ya, lanjutkan", skip, className, children }: {
  href: string;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  /** lewati konfirmasi (mis. tautan ke halaman upgrade) */
  skip?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    router.prefetch(href);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); setOpen(false); } };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, href, router]);

  if (skip) return <Link href={href} className={className}>{children}</Link>;
  return (
    <>
      <button type="button" className={className} onClick={(e) => { e.stopPropagation(); setOpen(true); }}>{children}</button>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4" onClick={(e) => { e.stopPropagation(); setOpen(false); }} role="dialog" aria-modal="true" aria-label={title}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 text-left shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600"><LayoutTemplate className="h-5 w-5" /></span>
            <p className="mt-3 text-base font-semibold text-slate-900">{title}</p>
            <div className="mt-1 text-sm text-slate-600">{message}</div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="btn" onClick={() => setOpen(false)}>Batal</button>
              <button type="button" className="btn btn-primary" autoFocus onClick={() => router.push(href)}>{confirmLabel}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
