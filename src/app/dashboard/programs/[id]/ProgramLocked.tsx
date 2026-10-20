import Link from "next/link";
import { Crown, Lock } from "lucide-react";
import { FREE_PROGRAM_LIMIT } from "@/lib/db";

/** Layar pengganti halaman program yang terkunci (Pro berakhir & melebihi batas program Free). */
export default function ProgramLocked({ name }: { name: string }) {
  return (
    <div className="mx-auto w-full max-w-lg px-1 py-8 sm:py-12">
      <div className="card text-center !p-5 sm:!p-8">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-amber-700 sm:h-14 sm:w-14"><Lock className="h-6 w-6 sm:h-7 sm:w-7" /></span>
        <h1 className="mt-4 text-lg font-bold sm:text-xl">Program terkunci</h1>
        <p className="mt-1 break-words text-sm font-medium text-slate-700">{name}</p>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Paket Pro Anda sudah berakhir dan jumlah program melebihi batas paket Free ({FREE_PROGRAM_LIMIT} program).
        </p>
        <ul className="mt-3 space-y-1.5 rounded-lg bg-slate-50 p-3 text-left text-xs leading-relaxed text-slate-600 sm:text-sm">
          <li>• {FREE_PROGRAM_LIMIT} program terlama tetap aktif.</li>
          <li>• Program yang dibuat setelahnya dikunci dan pendaftarannya ditutup.</li>
          <li>• Sertifikat yang sudah terbit tetap bisa dibuka peserta.</li>
        </ul>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
          <Link href="/dashboard" className="btn justify-center">Kembali ke daftar program</Link>
          <Link href="/dashboard/upgrade/paket" className="btn btn-primary justify-center"><Crown className="h-4 w-4" /> Perpanjang Pro</Link>
        </div>
      </div>
    </div>
  );
}
