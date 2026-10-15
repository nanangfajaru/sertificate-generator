"use client";

import { ArrowLeft, BadgePercent, FolderOpen, LayoutDashboard, Mail, Menu, Users, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import UserMenu from "../dashboard/UserMenu";

const ITEMS = [
  { href: "/admin", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/admin/users", label: "Pengguna", icon: Users },
  { href: "/admin/programs", label: "Program", icon: FolderOpen },
  { href: "/admin/vouchers", label: "Voucher & referral", icon: BadgePercent },
  { href: "/admin/email", label: "Email", icon: Mail },
];

type Props = { name: string; email: string | null; avatarUrl: string | null; isPro: boolean; children: React.ReactNode };

export default function AdminShell({ name, email, avatarUrl, isPro, children }: Props) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  const current = ITEMS.find((i) => (i.href === "/admin" ? path === i.href : path.startsWith(i.href)));

  const nav = (uid: string) => (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2 px-5">
        <Logo href="/admin" size={28} uid={uid} />
        <span className="rounded-md bg-slate-900 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">Admin</span>
      </div>
      <nav className="mt-2 flex-1 space-y-1 px-3 text-sm">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = current?.href === href;
          return (
            <Link key={href} href={href} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition ${active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}>
              <Icon className={`h-[18px] w-[18px] ${active ? "text-brand-600" : "text-slate-400"}`} /> {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-100 p-3">
        <Link href="/dashboard" className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4 text-slate-400" /> Kembali ke dashboard
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-slate-200 bg-white lg:block">{nav("lm-admin-side")}</aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl">
            <button className="absolute right-3 top-3 rounded-md p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Tutup menu" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
            {nav("lm-admin-drawer")}
          </aside>
        </div>
      )}

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 backdrop-blur">
          <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
            <button className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Buka menu" onClick={() => setOpen(true)}><Menu className="h-5 w-5" /></button>
            <p className="text-sm text-slate-500">Admin <span className="text-slate-300">/</span> <span className="font-medium text-slate-900">{current?.label ?? "Admin"}</span></p>
            <div className="ml-auto"><UserMenu name={name} email={email} avatarUrl={avatarUrl} isPro={isPro} /></div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
