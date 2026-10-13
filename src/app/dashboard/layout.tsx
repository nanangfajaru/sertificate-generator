import Link from "next/link";
import { Award, LogOut } from "lucide-react";
import { requireUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, isPro } = await requireUser();
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Award className="h-5 w-5 text-brand-600" /> Sertifikat Online
          </Link>
          <div className="flex items-center gap-3 text-sm">
            {profile.is_admin && <Link href="/admin" className="btn btn-sm">Admin</Link>}
            <span className={`badge ${isPro ? "badge-pro" : ""}`}>{isPro ? "Pro" : "Free"}</span>
            <span className="hidden text-slate-600 sm:inline">{profile.full_name ?? profile.email}</span>
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
