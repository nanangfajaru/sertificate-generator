"use client";

import { Crown, FolderOpen, LayoutTemplate, Menu, Search, ShieldCheck, Sparkles, X } from "lucide-react";
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
    { href: "/dashboard/templates", label: "Template", icon: LayoutTemplate, active: path.startsWith("/dashboard/templates") || path.startsWith("/dashboard/designs") },
  ];
  const until = planUntil ? new Date(planUntil).toLocaleDateString("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" }) : null;
  const link = (active: boolean) =>
    `group flex items-center gap-3 rounded-xl px-2.5 py-2 font-medium transition ${active ? "bg-gradient-to-r from-brand-700 to-brand-900 text-white shadow-md shadow-brand-900/15" : "text-slate-600 hover:bg-brand-50/70 hover:text-navy"}`;
  const tile = (active: boolean) =>
    `grid h-8 w-8 place-items-center rounded-lg transition ${active ? "bg-white/15 text-amber-300" : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-brand-700 group-hover:shadow-sm"}`;

  const nav = (uid: string) => (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5"><Logo href="/dashboard" size={30} uid={uid} /></div>
      <nav className="mt-3 flex-1 space-y-1.5 px-3 text-sm">
        <p className="px-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Menu</p>
        {items.map(({ href, label, icon: Icon, active }) => (
          <Link key={href} href={href} className={link(active)}>
            <span className={tile(active)}><Icon className="h-[18px] w-[18px]" /></span>
            <span className="flex-1">{label}</span>
            {active && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />}
          </Link>
        ))}
        {isAdmin && (
          <>
            <p className="px-2.5 pb-1 pt-5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Administrasi</p>
            <Link href="/admin" className={link(false)}>
              <span className={tile(false)}><ShieldCheck className="h-[18px] w-[18px]" /></span> Admin owner
            </Link>
          </>
        )}
      </nav>
      <div className="p-3">
        {isPro ? (
          <Link href="/dashboard/upgrade" className="relative block overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-900 to-navy p-3.5 text-xs text-white ring-1 ring-amber-400/25 transition hover:shadow-lg">
            <span className="pointer-events-none absolute -right-6 -top-8 h-20 w-20 rounded-full border border-white/10" />
            <p className="relative flex items-center gap-1.5 font-semibold"><Crown className="h-3.5 w-3.5 text-amber-400" /> Paket Pro aktif</p>
            <p className="relative mt-0.5 text-brand-100">{until ? `Hingga ${until}` : "Tanpa batas waktu"}</p>
          </Link>
        ) : (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-900 to-navy p-3.5 text-xs text-white ring-1 ring-amber-400/25">
            <span className="pointer-events-none absolute -right-6 -top-8 h-20 w-20 rounded-full border border-white/10" />
            <p className="relative flex items-center gap-1.5 font-semibold"><Sparkles className="h-3.5 w-3.5 text-amber-400" /> Buka semua fitur</p>
            <p className="relative mt-0.5 text-brand-100">Program tanpa batas, template bertema, desain sendiri, tanpa watermark.</p>
            <Link href="/dashboard/upgrade/paket" className="relative mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-amber-400 py-1.5 font-semibold text-navy hover:bg-amber-300"><Crown className="h-3.5 w-3.5" /> Upgrade ke Pro</Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-slate-200/80 bg-gradient-to-b from-white via-white to-brand-50/40 lg:block">{nav("lm-side")}</aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-gradient-to-b from-white via-white to-brand-50/40 shadow-xl">
            <button className="absolute right-3 top-4 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Tutup menu" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
            {nav("lm-drawer")}
          </aside>
        </div>
      )}

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 shadow-[0_1px_12px_-6px_rgba(15,29,74,0.12)] backdrop-blur-md">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Buka menu" onClick={() => setOpen(true)}><Menu className="h-5 w-5" /></button>
            <div className="lg:hidden"><Logo href="/dashboard" size={26} uid="lm-head" /></div>
            <form action="/dashboard" role="search" className="relative ml-auto hidden max-w-sm flex-1 sm:block lg:ml-0">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input name="q" className="h-10 w-full rounded-full border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/70" placeholder="Cari program…" />
            </form>
            <div className="ml-auto flex items-center gap-2.5">
              {isPro ? (
                <Link href="/dashboard/upgrade" className="hidden items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-300 to-amber-400 px-3 py-1.5 text-xs font-semibold text-navy shadow-sm sm:inline-flex"><Crown className="h-3.5 w-3.5" /> Pro{until ? <span className="font-medium text-navy/70">· s.d. {until}</span> : null}</Link>
              ) : (
                <Link href="/dashboard/upgrade/paket" className="hidden items-center gap-1.5 rounded-full bg-navy px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-800 sm:inline-flex"><Sparkles className="h-3.5 w-3.5 text-amber-400" /> Upgrade</Link>
              )}
              <UserMenu name={name} email={email} avatarUrl={avatarUrl} isPro={isPro} planUntil={until} />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
