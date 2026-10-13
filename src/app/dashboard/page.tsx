import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { FREE_PROGRAM_LIMIT } from "@/lib/db";
import { formatDateRange } from "@/lib/certificate/sources";

export const metadata = { title: "Program" };

export default async function DashboardPage() {
  const { supabase, isPro } = await requireUser();
  const { data } = await supabase
    .from("programs")
    .select("id, name, org_name, start_date, end_date, approval_mode, is_open, participants(count)")
    .order("created_at", { ascending: false });
  const programs = data ?? [];
  const atLimit = !isPro && programs.length >= FREE_PROGRAM_LIMIT;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Program</h1>
          <p className="text-sm text-slate-500">
            {isPro ? `${programs.length} program · tanpa batas` : `${programs.length} / ${FREE_PROGRAM_LIMIT} program (paket Free)`}
          </p>
        </div>
        {atLimit ? (
          <span className="btn cursor-not-allowed opacity-50">Batas program Free tercapai</span>
        ) : (
          <Link href="/dashboard/programs/new" className="btn btn-primary"><Plus className="h-4 w-4" /> Program baru</Link>
        )}
      </div>

      {atLimit && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Anda sudah memakai {FREE_PROGRAM_LIMIT} program. Upgrade ke Pro untuk program tanpa batas, seluruh template, dan unggah desain sendiri.
        </div>
      )}

      {programs.length === 0 ? (
        <div className="card mt-8 text-center">
          <p className="text-slate-600">Belum ada program. Buat program pertama Anda dan bagikan tautan pendaftarannya.</p>
          <Link href="/dashboard/programs/new" className="btn btn-primary mt-4">Buat program</Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((p) => {
            const count = (p.participants as unknown as { count: number }[])?.[0]?.count ?? 0;
            return (
              <Link key={p.id} href={`/dashboard/programs/${p.id}`} className="card transition hover:border-brand-500">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold leading-snug">{p.name}</h2>
                  <span className={`badge ${p.is_open ? "badge-ok" : ""}`}>{p.is_open ? "Dibuka" : "Ditutup"}</span>
                </div>
                <p className="mt-1 text-sm text-slate-500">{p.org_name}</p>
                <p className="mt-3 text-xs text-slate-500">{formatDateRange(p.start_date, p.end_date)}</p>
                <div className="mt-3 flex items-center gap-3 text-xs text-slate-600">
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {count} peserta</span>
                  <span>{p.approval_mode === "auto" ? "Otomatis" : "Perlu approval"}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
