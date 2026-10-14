import Link from "next/link";
import { Crown, LogOut } from "lucide-react";
import Logo from "@/components/Logo";
import { requireUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, isPro } = await requireUser();
  const name = profile.full_name ?? profile.email ?? "Pengguna";
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50/70 via-slate-50 to-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Logo href="/dashboard" size={32} />
          <div className="flex items-center gap-3 text-sm">
            {profile.is_admin && <Link href="/admin" className="btn btn-sm">Admin</Link>}
            <span className={`badge gap-1 ${isPro ? "badge-pro" : ""}`}>{isPro && <Crown className="h-3 w-3" />}{isPro ? "Pro" : "Free"}</span>
            <Link href="/dashboard/profile" className="flex items-center gap-2 rounded-full py-0.5 pl-0.5 pr-2 transition hover:bg-slate-100" title="Profil saya">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {profile.avatar_url ? <img src={profile.avatar_url} alt="" referrerPolicy="no-referrer" className="h-8 w-8 rounded-full object-cover" /> : <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-xs font-semibold uppercase text-brand-700">{name.trim().charAt(0)}</span>}
              <span className="hidden max-w-[10rem] truncate text-slate-700 sm:inline">{name}</span>
            </Link>
            <form action="/auth/signout" method="post">
              <button className="btn btn-sm" title="Keluar"><LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Keluar</span></button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
