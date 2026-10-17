import { Suspense } from "react";
import { formatDateRange } from "@/lib/certificate/sources";
import { getOwnedProgram } from "@/lib/program-server";
import ProgramChrome from "./ProgramChrome";
import ProgramLocked from "./ProgramLocked";
import { isProgramLocked } from "@/lib/program-lock";
import { createAdminClient } from "@/lib/supabase/admin";
import { usesProFeature } from "@/lib/pro-gate";

export default async function ProgramLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { program, profile, isPro } = await getOwnedProgram(id);

  // Pro berakhir & jumlah program melebihi batas Free: program yang dibuat paling akhir dikunci.
  if (program.owner_id === profile.id && !isPro && (await isProgramLocked(createAdminClient(), program))) {
    return <ProgramLocked name={program.name} />;
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
