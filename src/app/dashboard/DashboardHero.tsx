import { ArrowRight, BadgeCheck, Clock, FolderOpen, Plus, Users } from "lucide-react";
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

/** Kepala halaman Program: sapaan, tombol program baru, dan ringkasan angka seluruh program. */
export default function DashboardHero({ greeting, programs, programLimit, active, participants, approved, pending, atLimit }: Props) {
  const issuedPct = participants ? Math.min(100, Math.round((approved / participants) * 100)) : 0;
  const programPct = programLimit ? Math.min(100, Math.round((programs / programLimit) * 100)) : 0;
  const tile = "relative flex flex-col rounded-xl bg-white/[0.07] p-3.5 ring-1 ring-white/10 backdrop-blur-sm sm:p-4";

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-900 to-navy p-5 text-white shadow-lg ring-1 ring-amber-400/25 sm:p-6">
      <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border border-white/10" />
      <div className="pointer-events-none absolute -right-4 -top-10 h-40 w-40 rounded-full border border-amber-400/20" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-white/[0.04]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

      <div className="relative flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-brand-100">{greeting}</p>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight sm:text-[1.75rem]">Program Anda</h1>
          <p className="mt-1 text-sm text-brand-100">{programs ? `${active} dari ${programs} program sedang membuka pendaftaran` : "Mulai dengan membuat program pertama"}</p>
        </div>
        {atLimit ? (
          <Link href="/dashboard/upgrade" className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-semibold ring-1 ring-white/20 hover:bg-white/15">Batas program Free tercapai · Upgrade</Link>
        ) : (
          <Link href="/dashboard/programs/new" className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-semibold text-navy shadow-md shadow-black/20 transition hover:bg-amber-300"><Plus className="h-4 w-4" /> Program baru</Link>
        )}
      </div>

      <div className="relative mt-5 grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        <div className={tile}>
          <div className="flex items-center justify-between">
            <p className="text-xs text-brand-100">Program</p>
            <FolderOpen className="h-4 w-4 text-brand-200" />
          </div>
          <p className="mt-1.5 text-2xl font-bold leading-none sm:text-3xl">{programs}{programLimit ? <span className="text-sm font-semibold text-brand-200"> / {programLimit}</span> : null}</p>
          {programLimit ? (
            <div className="mt-auto pt-3">
              <div className="h-1 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-brand-300" style={{ width: `${programPct}%` }} /></div>
              <p className="mt-1.5 text-[11px] text-brand-200">Kuota paket Free</p>
            </div>
          ) : (
            <p className="mt-auto pt-3 text-[11px] text-brand-200">{active} dibuka</p>
          )}
        </div>

        <div className={tile}>
          <div className="flex items-center justify-between">
            <p className="text-xs text-brand-100">Peserta terdaftar</p>
            <Users className="h-4 w-4 text-brand-200" />
          </div>
          <p className="mt-1.5 text-2xl font-bold leading-none sm:text-3xl">{participants.toLocaleString("id-ID")}</p>
          <p className="mt-auto pt-3 text-[11px] text-brand-200">Di semua program</p>
        </div>

        <div className={`${tile} !bg-amber-400/10 !ring-amber-400/30`}>
          <div className="flex items-center justify-between">
            <p className="text-xs text-amber-100">Sertifikat terbit</p>
            <span className="grid h-6 w-6 place-items-center rounded-md bg-amber-400 text-navy"><BadgeCheck className="h-3.5 w-3.5" /></span>
          </div>
          <p className="mt-1.5 text-2xl font-bold leading-none sm:text-3xl">{approved.toLocaleString("id-ID")}</p>
          <div className="mt-auto pt-3">
            <div className="h-1 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-amber-400" style={{ width: `${issuedPct}%` }} /></div>
            <p className="mt-1.5 text-[11px] text-amber-100/80">{participants ? `${issuedPct}% peserta sudah menerima` : "Belum ada peserta"}</p>
          </div>
        </div>

        {pending > 0 ? (
          <Link href="/dashboard?status=pending" className={`${tile} group transition hover:bg-white/[0.12]`}>
            <div className="flex items-center justify-between">
              <p className="text-xs text-brand-100">Menunggu persetujuan</p>
              <span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-400" /></span>
            </div>
            <p className="mt-1.5 text-2xl font-bold leading-none sm:text-3xl">{pending}</p>
            <p className="mt-auto flex items-center gap-1 pt-3 text-[11px] font-semibold text-amber-300">Tinjau sekarang <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" /></p>
          </Link>
        ) : (
          <div className={tile}>
            <div className="flex items-center justify-between">
              <p className="text-xs text-brand-100">Menunggu persetujuan</p>
              <Clock className="h-4 w-4 text-brand-200" />
            </div>
            <p className="mt-1.5 text-2xl font-bold leading-none sm:text-3xl">0</p>
            <p className="mt-auto pt-3 text-[11px] text-brand-200">Semua sudah ditinjau</p>
          </div>
        )}
      </div>
    </section>
  );
}
