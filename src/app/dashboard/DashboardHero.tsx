import { BadgeCheck, Clock, FolderOpen, Lock, Plus, Users } from "lucide-react";
import Link from "next/link";

type Props = {
  greeting: string;
  programs: number;
  /** batas program paket Free; null untuk Pro */
  programLimit: number | null;
  active: number;
  participants: number;
  approved: number;
  pending: number;
  atLimit: boolean;
};

/** Kepala halaman Program: sapaan, tombol program baru, dan ringkasan angka seluruh program (ringkas). */
export default function DashboardHero({ greeting, programs, programLimit, active, participants, approved, pending, atLimit }: Props) {
  const issuedPct = participants ? Math.min(100, Math.round((approved / participants) * 100)) : 0;
  const tile = "flex items-center gap-3 rounded-xl bg-white/[0.07] px-3.5 py-3 ring-1 ring-white/10";
  const icon = "hidden h-9 w-9 shrink-0 place-items-center rounded-lg sm:grid";
  const value = "text-xl font-bold leading-none";
  const label = "mt-1 text-[11px] leading-tight text-brand-200";

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-900 to-navy p-4 text-white shadow-lg ring-1 ring-amber-400/25 sm:px-6 sm:py-5">
      <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border border-white/10" />
      <div className="pointer-events-none absolute -right-4 -top-10 h-36 w-36 rounded-full border border-amber-400/20" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Program Anda</h1>
          <p className="mt-0.5 text-sm text-brand-100">{greeting}{programs ? ` · ${active} dari ${programs} program membuka pendaftaran` : ""}</p>
        </div>
        {/* Kuota program Free penuh: tombol tetap tampil, bergembok, mengarah ke halaman upgrade. */}
        <Link
          href={atLimit ? "/dashboard/upgrade" : "/dashboard/programs/new"}
          title={atLimit ? "Batas program paket Free tercapai — upgrade ke Pro untuk menambah program" : undefined}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-navy shadow-md shadow-black/20 transition hover:bg-amber-300"
        >
          {atLimit ? <Lock className="h-4 w-4" /> : <Plus className="h-4 w-4" />} Program baru
        </Link>
      </div>

      <div className="relative mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <div className={tile}>
          <span className={`${icon} bg-white/10 text-brand-100`}><FolderOpen className="h-[18px] w-[18px]" /></span>
          <div className="min-w-0">
            <p className={value}>{programs}{programLimit ? <span className="text-xs font-semibold text-brand-200"> / {programLimit}</span> : null}</p>
            <p className={label}>{programLimit ? "Program · kuota Free" : `Program · ${active} dibuka`}</p>
          </div>
        </div>
        <div className={tile}>
          <span className={`${icon} bg-white/10 text-brand-100`}><Users className="h-[18px] w-[18px]" /></span>
          <div className="min-w-0">
            <p className={value}>{participants.toLocaleString("id-ID")}</p>
            <p className={label}>Peserta terdaftar</p>
          </div>
        </div>
        <div className={`${tile} !bg-amber-400/10 !ring-amber-400/30`}>
          <span className={`${icon} bg-amber-400 text-navy`}><BadgeCheck className="h-[18px] w-[18px]" /></span>
          <div className="min-w-0">
            <p className={value}>{approved.toLocaleString("id-ID")}{participants ? <span className="text-xs font-semibold text-amber-200"> · {issuedPct}%</span> : null}</p>
            <p className="mt-1 text-[11px] leading-tight text-amber-100/80">Sertifikat terbit</p>
          </div>
        </div>
        {pending > 0 ? (
          <Link href="/dashboard?status=pending" className={`${tile} transition hover:bg-white/[0.12]`}>
            <span className={`${icon} bg-amber-400/15 text-amber-300`}><Clock className="h-[18px] w-[18px]" /></span>
            <div className="min-w-0">
              <p className={value}>{pending}</p>
              <p className="mt-1 text-[11px] font-semibold leading-tight text-amber-300">Menunggu · tinjau →</p>
            </div>
          </Link>
        ) : (
          <div className={tile}>
            <span className={`${icon} bg-white/10 text-brand-100`}><Clock className="h-[18px] w-[18px]" /></span>
            <div className="min-w-0">
              <p className={value}>0</p>
              <p className={label}>Menunggu persetujuan</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
