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
  const { program, profile, isPro, supabase } = await getOwnedProgram(id);

  // Pro berakhir & jumlah program melebihi batas Free: program yang dibuat paling akhir dikunci.
  if (program.owner_id === profile.id && !isPro && (await isProgramLocked(createAdminClient(), program))) {
    return <ProgramLocked name={program.name} />;
  }
  // Pro pemilik berakhir & program masih memakai fitur Pro: sertifikat pendaftar baru tertahan.
  const proEnded = program.owner_id === profile.id && !isPro && program.is_open && usesProFeature(program)
    ? (profile.plan_expires_at ? new Date(profile.plan_expires_at).toLocaleDateString("id-ID", { dateStyle: "long", timeZone: "Asia/Jakarta" }) : "")
    : null;
  // Angka ringkasan untuk banner (tampil di tab Ringkasan). Kuota Free hanya menghitung peran Peserta.
  const { data: rows } = await supabase.from("participants").select("status, role").eq("program_id", id);
  const stats = {
    total: rows?.length ?? 0,
    approved: rows?.filter((r) => r.status === "approved").length ?? 0,
    pending: rows?.filter((r) => r.status === "pending").length ?? 0,
    quota: isPro ? null : rows?.filter((r) => (r.role ?? "Peserta") === "Peserta").length ?? 0,
  };
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
      stats={stats}
    />
  );
  return (
    <div>
      <Suspense fallback={null}>{chrome}</Suspense>
      {children}
    </div>
  );
}
