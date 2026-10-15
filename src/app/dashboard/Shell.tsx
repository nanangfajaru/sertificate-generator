"use client";

import { Crown, FolderOpen, Gift, Menu, Search, ShieldCheck, Sparkles, UserRound, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import UserMenu from "./UserMenu";

type Props = {
  name: string;
  email: string | null;
  avatarUrl: string | null;
  isPro: boolean;
  isAdmin: boolean;
  planUntil: string | null;
  children: React.ReactNode;
};

export default function Shell({ name, email, avatarUrl, isPro, isAdmin, planUntil, children }: Props) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);

  const items = [
    { href: "/dashboard", label: "Program", icon: FolderOpen, active: path === "/dashboard" || path.startsWith("/dashboard/programs") },
    { href: "/dashboard/referral", label: "Referral", icon: Gift, active: path.startsWith("/dashboard/referral"), pro: true },
    { href: "/dashboard/upgrade", label: isPro ? "Paket & perpanjang" : "Paket Pro", icon: Sparkles, active: path.startsWith("/dashboard/upgrade") },
    { href: "/dashboard/profile", label: "Profil saya", icon: UserRound, active: path.startsWith("/dashboard/profile") },
  ];
  const until = planUntil ? new Date(planUntil).toLocaleDateString("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" }) : null;

  const nav = (uid: string) => (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center px-5"><Logo href="/dashboard" size={30} uid={uid} /></div>
      <nav className="mt-2 flex-1 space-y-1 px-3 text-sm">
        {items.map(({ href, label, icon: Icon, active, pro }) => (
          <Link key={href} href={href} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition ${active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}>
            <Icon className={`h-[18px] w-[18px] ${active ? "text-brand-600" : "text-slate-400"}`} />
            <span className="flex-1">{label}</span>
            {pro && <span className="badge badge-pro gap-0.5 !px-1.5 !py-0 text-[10px]"><Crown className="h-2.5 w-2.5" />Pro</span>}
          </Link>
        ))}
        {isAdmin && (
          <>
            <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Administrasi</p>
            <Link href="/admin" className="flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
              <ShieldCheck className="h-[18px] w-[18px] text-slate-400" /> Admin owner
            </Link>
          </>
        )}
      </nav>
      <div className="p-3">
        {isPro ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
            <p className="flex items-center gap-1.5 font-semibold"><Crown className="h-3.5 w-3.5 text-amber-600" /> Paket Pro aktif</p>
            <p className="mt-0.5 text-amber-800/80">{until ? `Hingga ${until}` : "Tanpa batas waktu"}</p>
          </div>
        ) : (
          <div className="rounded-xl bg-gradient-to-br from-brand-600 to-indigo-800 p-3.5 text-xs text-white">
            <p className="font-semibold">Buka semua fitur</p>
            <p className="mt-0.5 text-brand-100">Program tanpa batas, template bertema, desain sendiri, tanpa watermark.</p>
            <Link href="/dashboard/upgrade" className="mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-white py-1.5 font-semibold text-brand-700 hover:bg-brand-50"><Sparkles className="h-3.5 w-3.5" /> Upgrade ke Pro</Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-slate-200 bg-white lg:block">{nav("lm-side")}</aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl">
            <button className="absolute right-3 top-3 rounded-md p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Tutup menu" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
            {nav("lm-drawer")}
          </aside>
        </div>
      )}

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 backdrop-blur">
          <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
            <button className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Buka menu" onClick={() => setOpen(true)}><Menu className="h-5 w-5" /></button>
            <div className="lg:hidden"><Logo href="/dashboard" size={26} uid="lm-head" /></div>
            <form action="/dashboard" role="search" className="relative ml-auto hidden max-w-sm flex-1 sm:block lg:ml-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input name="q" className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100" placeholder="Cari program…" />
            </form>
            <div className="ml-auto flex items-center gap-3">
              {isPro ? (
                <Link href="/dashboard/upgrade" className="badge badge-pro gap-1"><Crown className="h-3 w-3" /> Pro{until ? <span className="hidden sm:inline"> · s.d. {until}</span> : null}</Link>
              ) : (
                <Link href="/dashboard/upgrade" className="badge hover:bg-slate-200">Free</Link>
              )}
              <UserMenu name={name} email={email} avatarUrl={avatarUrl} isPro={isPro} />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
