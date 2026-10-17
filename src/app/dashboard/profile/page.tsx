import Link from "next/link";
import { ArrowLeft, Crown, Mail } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { InfoForm } from "./ProfileForm";

export const metadata = { title: "Profil" };

export default async function ProfilePage() {
  const { profile, isPro } = await requireUser();
  const name = profile.full_name ?? profile.email ?? "Pengguna";
  const date = (s: string) => new Date(s).toLocaleDateString("id-ID", { dateStyle: "long", timeZone: "Asia/Jakarta" });

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"><ArrowLeft className="h-4 w-4" /> Kembali</Link>

      <div className="grid items-start gap-6 lg:grid-cols-3">
      <div className="card flex min-w-0 items-center gap-4 lg:sticky lg:top-20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {profile.avatar_url ? <img src={profile.avatar_url} alt="" referrerPolicy="no-referrer" className="h-16 w-16 shrink-0 rounded-full object-cover" /> : <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-brand-100 text-2xl font-semibold uppercase text-brand-700">{name.trim().charAt(0)}</span>}
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold">{name}</h1>
          <p className="flex min-w-0 items-center gap-1.5 text-sm text-slate-500" title={profile.email ?? undefined}><Mail className="h-4 w-4 shrink-0" /> <span className="truncate">{profile.email}</span></p>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className={`badge gap-1 ${isPro ? "badge-pro" : ""}`}>{isPro && <Crown className="h-3 w-3" />}{isPro ? "Pro" : "Free"}</span>
            {isPro && profile.plan_expires_at && <span>aktif hingga {date(profile.plan_expires_at)}</span>}
            {!isPro && <Link href="/dashboard/upgrade" className="font-medium text-brand-700 hover:underline">Lihat paket Pro</Link>}
          </p>
        </div>
      </div>

      <div className="min-w-0 space-y-6 lg:col-span-2">
      <InfoForm p={{ full_name: profile.full_name ?? "", phone: profile.phone ?? "", organization: profile.organization ?? "", job_title: profile.job_title ?? "" }} />
      <p className="text-center text-xs text-slate-400">Email akun tidak dapat diubah di sini. Password bisa diganti lewat menu akun di kanan atas.</p>
      </div>
      </div>
    </div>
  );
}
