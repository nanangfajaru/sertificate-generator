"use client";

import { ChevronDown, Crown, LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Props = { name: string; email: string | null; avatarUrl: string | null; isPro: boolean };

function Avatar({ name, url, size }: { name: string; url: string | null; size: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  if (url) return <img src={url} alt="" referrerPolicy="no-referrer" className={`${size} shrink-0 rounded-full object-cover`} />;
  return <span className={`${size} grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-semibold uppercase text-white`}>{name.trim().charAt(0)}</span>;
}

export default function UserMenu({ name, email, avatarUrl, isPro }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const item = "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-2.5 shadow-sm transition hover:border-slate-300 hover:shadow"
      >
        <Avatar name={name} url={avatarUrl} size="h-8 w-8" />
        <span className="hidden max-w-[9rem] truncate text-sm font-medium text-slate-700 sm:inline">{name}</span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-full z-40 mt-2 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
          <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
            <Avatar name={name} url={avatarUrl} size="h-11 w-11" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
              <p className="truncate text-xs text-slate-500">{email}</p>
              <span className={`badge mt-1 gap-1 ${isPro ? "badge-pro" : ""}`}>{isPro && <Crown className="h-3 w-3" />}Paket {isPro ? "Pro" : "Free"}</span>
            </div>
          </div>
          <div className="mt-1.5 space-y-0.5">
            <Link href="/dashboard/profile" role="menuitem" className={item} onClick={() => setOpen(false)}><UserRound className="h-4 w-4 text-slate-500" /> Profil saya</Link>
          </div>
          <form action="/auth/signout" method="post" className="mt-1.5 border-t border-slate-100 pt-1.5">
            <button role="menuitem" className={`${item} text-red-600 hover:bg-red-50`}><LogOut className="h-4 w-4" /> Keluar</button>
          </form>
        </div>
      )}
    </div>
  );
}
