import { Suspense } from "react";
import { formatDateRange } from "@/lib/certificate/sources";
import { getOwnedProgram } from "@/lib/program-server";
import ProgramChrome from "./ProgramChrome";

export default async function ProgramLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { program, profile } = await getOwnedProgram(id);
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
    />
  );
  return (
    <div>
      <Suspense fallback={null}>{chrome}</Suspense>
      {children}
    </div>
  );
}
