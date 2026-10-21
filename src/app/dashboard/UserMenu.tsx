"use client";

import { ChevronDown, Crown, Gift, KeyRound, LogOut, Sparkles, UserRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import SocialIcon from "@/components/SocialIcon";

type Props = { name: string; email: string | null; avatarUrl: string | null; isPro: boolean; planUntil?: string | null; helpUrl?: string | null };

function Avatar({ name, url, size }: { name: string; url: string | null; size: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  if (url) return <img src={url} alt="" referrerPolicy="no-referrer" className={`${size} shrink-0 rounded-full object-cover`} />;
  return <span className={`${size} grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-semibold uppercase text-white`}>{name.trim().charAt(0)}</span>;
}

export default function UserMenu({ name, email, avatarUrl, isPro, planUntil, helpUrl }: Props) {
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

  const item = "group flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 transition hover:bg-brand-50/70 hover:text-navy";
  const ic = "grid h-7 w-7 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-500 transition group-hover:bg-white group-hover:text-brand-700";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 rounded-full border bg-white py-1 pl-1 pr-2.5 shadow-sm transition hover:shadow ${open ? "border-brand-300 ring-4 ring-brand-100/70" : "border-slate-200 hover:border-slate-300"}`}
      >
        <Avatar name={name} url={avatarUrl} size="h-8 w-8" />
        <span className="hidden max-w-[9rem] truncate text-sm font-medium text-slate-700 sm:inline">{name}</span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-full z-40 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-brand-900/10">
          <div className="border-b border-slate-100 p-4">
            <div className="flex items-center gap-3">
              <span className="rounded-full ring-2 ring-brand-100"><Avatar name={name} url={avatarUrl} size="h-11 w-11" /></span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-navy">{name}</p>
                <p className="truncate text-xs text-slate-500">{email}</p>
              </div>
            </div>
            <div className={`mt-3 flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-xs ${isPro ? "bg-amber-50 text-amber-900" : "bg-slate-50 text-slate-700"}`}>
              <span className="flex items-center gap-1.5 font-semibold">{isPro ? <Crown className="h-3.5 w-3.5 text-amber-500" /> : <Sparkles className="h-3.5 w-3.5 text-brand-600" />} Paket {isPro ? "Pro" : "Free"}</span>
              <span className={isPro ? "text-amber-800/80" : ""}>{isPro ? (planUntil ? `s.d. ${planUntil}` : "Tanpa batas") : <Link href="/dashboard/upgrade/paket" onClick={() => setOpen(false)} className="font-semibold text-brand-700 hover:underline">Upgrade →</Link>}</span>
            </div>
          </div>
          <div className="space-y-0.5 p-1.5">
            <Link href="/dashboard/upgrade" role="menuitem" className={item} onClick={() => setOpen(false)}><span className={ic}><Sparkles className="h-4 w-4" /></span> <span className="flex-1">Berlangganan</span></Link>
            <Link href="/dashboard/referral" role="menuitem" className={item} onClick={() => setOpen(false)}><span className={ic}><Gift className="h-4 w-4" /></span> <span className="flex-1">Referral</span><span className="badge badge-pro gap-0.5 !px-1.5 !py-0 text-[10px]"><Crown className="h-2.5 w-2.5" />Pro</span></Link>
            <div className="my-1 border-t border-slate-100" />
            <Link href="/dashboard/profile" role="menuitem" className={item} onClick={() => setOpen(false)}><span className={ic}><UserRound className="h-4 w-4" /></span> Profil saya</Link>
            <Link href="/dashboard/password" role="menuitem" className={item} onClick={() => setOpen(false)}><span className={ic}><KeyRound className="h-4 w-4" /></span> Ganti password</Link>
            {helpUrl && <a href={helpUrl} target="_blank" rel="noopener noreferrer" role="menuitem" className={item} onClick={() => setOpen(false)}><span className={ic}><SocialIcon name="whatsapp" className="h-4 w-4" /></span> Bantuan via WhatsApp</a>}
          </div>
          <form action="/auth/signout" method="post" className="border-t border-slate-100 p-1.5">
            <button role="menuitem" className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"><span className="grid h-7 w-7 place-items-center rounded-md bg-red-50"><LogOut className="h-4 w-4" /></span> Keluar</button>
          </form>
        </div>
      )}
    </div>
  );
}
