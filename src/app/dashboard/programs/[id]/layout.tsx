import { Suspense } from "react";
import { formatDateRange } from "@/lib/certificate/sources";
import { getOwnedProgram } from "@/lib/program-server";
import ProgramChrome from "./ProgramChrome";
import Link from "next/link";
import { Crown, Lock } from "lucide-react";
import { FREE_PROGRAM_LIMIT } from "@/lib/db";
import { isProgramLocked } from "@/lib/program-lock";
import { createAdminClient } from "@/lib/supabase/admin";
import { usesProFeature } from "@/lib/pro-gate";

export default async function ProgramLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { program, profile, isPro } = await getOwnedProgram(id);

  // Pro berakhir & jumlah program melebihi batas Free: program yang dibuat paling akhir dikunci.
  if (program.owner_id === profile.id && !isPro && (await isProgramLocked(createAdminClient(), program))) {
    return (
      <div className="mx-auto max-w-lg py-10 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-100 text-amber-700"><Lock className="h-7 w-7" /></span>
        <h1 className="mt-4 text-xl font-bold">Program terkunci</h1>
        <p className="mt-1 text-sm font-medium text-slate-700">{program.name}</p>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Paket Pro Anda sudah berakhir dan jumlah program melebihi batas paket Free ({FREE_PROGRAM_LIMIT} program). {FREE_PROGRAM_LIMIT} program terlama tetap aktif;
          program yang dibuat setelahnya dikunci dan pendaftarannya ditutup. Sertifikat yang sudah terbit tetap bisa dibuka peserta.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Link href="/dashboard" className="btn">Kembali ke daftar program</Link>
          <Link href="/dashboard/upgrade" className="btn btn-primary"><Crown className="h-4 w-4" /> Perpanjang Pro</Link>
        </div>
      </div>
    );
  }
  // Pro pemilik berakhir & program masih memakai fitur Pro: sertifikat pendaftar baru tertahan.
  const proEnded = program.owner_id === profile.id && !isPro && program.is_open && usesProFeature(program)
    ? (profile.plan_expires_at ? new Date(profile.plan_expires_at).toLocaleDateString("id-ID", { dateStyle: "long", timeZone: "Asia/Jakarta" }) : "")
    : null;
  const chrome = (
    <ProgramChrome
      id={id}
      name={program.name}
      org={program.org_name}
      dateText={formatDateRange(program.start_date, program.end_date)}
      location={program.location}
      isOpen={program.is_open}
      auto={program.approval_mode === "auto"}
      viewOnly={program.owner_id !== profile.id}
      proEnded={proEnded}
    />
  );
  return (
    <div>
      <Suspense fallback={null}>{chrome}</Suspense>
      {children}
    </div>
  );
}
