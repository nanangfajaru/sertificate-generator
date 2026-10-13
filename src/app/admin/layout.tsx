import Link from "next/link";
import { Award } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import AdminNav from "./AdminNav";

export const metadata = { title: "Admin" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireAdmin();
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2 font-semibold"><Award className="h-5 w-5 text-brand-600" /> Admin</Link>
            <AdminNav />
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-slate-500 sm:inline">{profile.email}</span>
            <Link href="/dashboard" className="btn btn-sm">Dashboard</Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
