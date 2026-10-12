import Link from "next/link";
import { getOwnedProgram } from "@/lib/program-server";
import ProgramTabs from "./ProgramTabs";

export default async function ProgramLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { program } = await getOwnedProgram(id);
  return (
    <div>
      <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-800">← Semua program</Link>
      <h1 className="mt-2 text-2xl font-bold">{program.name}</h1>
      <p className="text-sm text-slate-500">{program.org_name}</p>
      <ProgramTabs id={id} />
      <div className="mt-6">{children}</div>
    </div>
  );
}
