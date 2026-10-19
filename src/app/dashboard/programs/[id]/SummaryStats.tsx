import { ArrowRight, BadgeCheck, ClipboardList, Clock, Crown, Download, FileArchive, Users } from "lucide-react";
import Link from "next/link";
import { CERT_ZIP_BATCH, FREE_PARTICIPANT_LIMIT } from "@/lib/db";

type Props = { id: string; total: number; pending: number; approved: number; quota: number; isPro: boolean; auto: boolean };

/** Ringkasan angka program (sertifikat terbit, pendaftar, menunggu, kuota) + aksi cepat. */
export default function SummaryStats({ id, total, pending, approved, quota, isPro, auto }: Props) {
  const base = `/dashboard/programs/${id}`;
  const issuedPct = total ? Math.round((approved / total) * 100) : 0;
  const quotaPct = Math.min(100, Math.round((quota / FREE_PARTICIPANT_LIMIT) * 100));
  const quotaFull = quota >= FREE_PARTICIPANT_LIMIT;
  const quotaWarn = quota >= Math.floor(FREE_PARTICIPANT_LIMIT * 0.8);
  // Lebih dari satu bagian ZIP → arahkan ke halaman peserta yang menampilkan pilihan per bagian.
  const zipHref = approved > CERT_ZIP_BATCH ? `${base}/participants` : `/api/programs/${id}/certificates`;

  return (
    <div className="mb-6 space-y-3">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="relative col-span-2 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-900 to-navy p-4 text-white shadow-md ring-1 ring-amber-400/25 lg:col-span-1">
          <div className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-10 -right-2 h-20 w-20 rounded-full bg-amber-400/10" />
          <div className="relative flex items-center justify-between">
            <p className="text-xs font-medium text-brand-100">Sertifikat terbit</p>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-400 text-navy"><BadgeCheck className="h-4 w-4" /></span>
          </div>
          <p className="relative mt-1 text-3xl font-bold leading-none">{approved}</p>
          <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-amber-400" style={{ width: `${issuedPct}%` }} />
          </div>
          <p className="relative mt-1.5 text-[11px] text-brand-100">{total ? `${issuedPct}% dari ${total} pendaftar` : "Belum ada pendaftar"}</p>
        </div>

        <Link href={`${base}/participants`} className="card group flex flex-col !p-4 transition hover:border-brand-300 hover:shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Total pendaftar</p>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-700"><Users className="h-4 w-4" /></span>
          </div>
          <p className="mt-1 text-3xl font-bold leading-none text-navy">{total}</p>
          <p className="mt-auto flex items-center gap-1 pt-3 text-[11px] font-medium text-brand-700">Lihat peserta <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" /></p>
        </Link>

        <Link href={`${base}/participants`} className={`card group flex flex-col !p-4 transition hover:shadow-md ${pending ? "border-amber-200 bg-amber-50/40 hover:border-amber-300" : "hover:border-brand-300"}`}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Menunggu persetujuan</p>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-50 text-amber-600"><Clock className="h-4 w-4" /></span>
          </div>
          <p className="mt-1 text-3xl font-bold leading-none text-navy">{pending}</p>
          <p className="mt-auto pt-3 text-[11px] font-medium text-slate-500">
            {pending ? <span className="flex items-center gap-1 text-amber-700">Tinjau sekarang <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" /></span> : auto ? "Sertifikat terbit otomatis" : "Semua sudah ditinjau"}
          </p>
        </Link>

        {isPro ? (
          <div className="card col-span-2 flex flex-col border-amber-200 bg-gradient-to-br from-amber-50/80 to-white !p-4 lg:col-span-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500">Kuota peserta</p>
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-100 text-amber-700"><Crown className="h-4 w-4" /></span>
            </div>
            <p className="mt-1 text-xl font-bold leading-tight text-navy">Tanpa batas</p>
            <p className="mt-auto pt-3 text-[11px] text-amber-800/80">Paket Pro aktif</p>
          </div>
        ) : (
          <div className={`card col-span-2 flex flex-col !p-4 lg:col-span-1 ${quotaWarn ? "border-amber-300 bg-amber-50/50" : ""}`}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500">Kuota paket Free</p>
              <span className={`text-[11px] font-semibold ${quotaWarn ? "text-amber-700" : "text-slate-400"}`}>{quotaPct}%</span>
            </div>
            <p className="mt-1 text-3xl font-bold leading-none text-navy">{quota}<span className="text-base font-semibold text-slate-400"> / {FREE_PARTICIPANT_LIMIT}</span></p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full rounded-full ${quotaWarn ? "bg-amber-500" : "bg-brand-600"}`} style={{ width: `${quotaPct}%` }} />
            </div>
            {quotaWarn ? (
              <Link href="/dashboard/upgrade" className="mt-1.5 text-[11px] font-semibold text-amber-800 hover:underline">{quotaFull ? "Kuota penuh" : "Hampir penuh"} · Upgrade ke Pro →</Link>
            ) : (
              <p className="mt-1.5 text-[11px] text-slate-500">Peran Peserta saja yang dihitung</p>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <Link href={`${base}/participants`} className="btn btn-primary btn-sm justify-center"><Users className="h-4 w-4" /> Kelola peserta</Link>
        <Link href={`${base}/form`} className="btn btn-sm justify-center bg-white"><ClipboardList className="h-4 w-4" /> Atur formulir</Link>
        {approved > 0 && <a href={zipHref} className="btn btn-sm justify-center bg-white"><FileArchive className="h-4 w-4" /> Unduh sertifikat (ZIP)</a>}
        <a href={`/api/programs/${id}/export`} className="btn btn-sm justify-center bg-white"><Download className="h-4 w-4" /> <span>Rekap<span className="hidden sm:inline"> kehadiran</span> (CSV)</span></a>
      </div>
    </div>
  );
}
