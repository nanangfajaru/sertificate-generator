import Link from "next/link";
import { Award, CalendarDays, Download, FileCheck2, Lock, MapPin, PencilLine, ShieldCheck, UserCheck } from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { formatDateRange } from "@/lib/certificate/sources";
import RegisterForm, { type RegisterField } from "./RegisterForm";

type Props = {
  slug: string;
  program: { org_name: string; name: string; cert_type: string; start_date: string; end_date: string | null; location: string | null; approval_mode: "auto" | "manual" };
  fields: RegisterField[];
  nameId: string | null;
  logo: string | null;
  open: boolean;
  emailNotify: boolean;
};

/** Halaman publik pendaftaran peserta (dipakai /p/[slug]). */
export default function RegisterView({ slug, program, fields, nameId, logo, open, emailNotify }: Props) {
  const manual = program.approval_mode === "manual";
  const steps = [
    { icon: PencilLine, t: "Isi data" },
    manual ? { icon: UserCheck, t: "Disetujui panitia" } : { icon: FileCheck2, t: "Sertifikat terbit" },
    { icon: Download, t: "Unduh PDF" },
  ];
  const chip = "inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white ring-1 ring-inset ring-white/15 sm:text-sm";

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-900 pb-24 pt-8 sm:pt-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:22px_22px]" />
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div className="relative mx-auto max-w-lg px-4">
          <div className="flex items-center gap-3">
            {logo ? (
              <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white p-1.5 shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logo} alt={`Logo ${program.org_name}`} className="max-h-full max-w-full object-contain" />
              </span>
            ) : (
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/15 text-xl font-bold text-white ring-1 ring-inset ring-white/20">{program.org_name.trim().charAt(0).toUpperCase() || "?"}</span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-brand-100">{program.org_name}</p>
              {open ? (
                <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-200"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" /></span>Pendaftaran dibuka</p>
              ) : (
                <p className="mt-1 text-xs font-semibold text-brand-200">Pendaftaran ditutup</p>
              )}
            </div>
          </div>
          <h1 className="mt-5 text-balance text-2xl font-bold leading-tight text-white sm:text-3xl">{program.name}</h1>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className={chip}><CalendarDays className="h-3.5 w-3.5" /> {formatDateRange(program.start_date, program.end_date)}</span>
            {program.location && <span className={chip}><MapPin className="h-3.5 w-3.5" /> {program.location}</span>}
            <span className={chip}><Award className="h-3.5 w-3.5" /> Sertifikat {program.cert_type}</span>
          </div>
        </div>
      </header>

      <div className="relative mx-auto -mt-16 max-w-lg px-4 pb-10">
        <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-xl shadow-slate-900/5 sm:p-7">
          {open ? (
            <>
              <ol className="mb-6 grid grid-cols-3 gap-2">
                {steps.map(({ icon: Icon, t }, i) => (
                  <li key={t} className="relative flex flex-col items-center text-center">
                    {i > 0 && <span className="absolute right-1/2 top-4 -z-0 mr-5 h-px w-[calc(100%-2.5rem)] bg-slate-200" aria-hidden />}
                    <span className={`relative grid h-8 w-8 place-items-center rounded-full ${i === 0 ? "bg-brand-600 text-white shadow-md shadow-brand-200" : "bg-slate-100 text-slate-500"}`}><Icon className="h-4 w-4" /></span>
                    <span className={`mt-1.5 text-[11px] font-medium leading-tight sm:text-xs ${i === 0 ? "text-brand-700" : "text-slate-500"}`}>{t}</span>
                  </li>
                ))}
              </ol>
              <h2 className="text-lg font-semibold">Isi data diri</h2>
              <p className="mt-1 text-sm text-slate-500">Data Anda akan dicetak pada sertifikat. Pastikan penulisannya sudah benar.</p>
              <div className="mt-5">
                <RegisterForm slug={slug} fields={fields} nameId={nameId} manual={manual} emailNotify={emailNotify} />
              </div>
            </>
          ) : (
            <div className="py-6 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-slate-500"><Lock className="h-6 w-6" /></span>
              <p className="mt-4 font-semibold">Pendaftaran sudah ditutup</p>
              <p className="mt-1 text-sm text-slate-500">Silakan hubungi penyelenggara kegiatan bila ada pertanyaan.</p>
            </div>
          )}
        </div>

        <ul className="mt-5 grid grid-cols-3 gap-2 text-center text-[11px] leading-tight text-slate-500 sm:text-xs">
          <li className="flex flex-col items-center gap-1.5"><UserCheck className="h-4 w-4 text-slate-400" />Tanpa membuat akun</li>
          <li className="flex flex-col items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-slate-400" />Sertifikat ber-QR, bisa dicek keasliannya</li>
          <li className="flex flex-col items-center gap-1.5"><Lock className="h-4 w-4 text-slate-400" />Data hanya untuk penyelenggara</li>
        </ul>

        <Link href="/" className="mx-auto mt-8 flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs text-slate-400 transition hover:bg-white hover:text-slate-600">
          <LogoMark size={18} uid="reg-foot" /> Dibuat dengan <b className="font-semibold text-slate-600">SertifikatKu</b>
        </Link>
      </div>
    </main>
  );
}
