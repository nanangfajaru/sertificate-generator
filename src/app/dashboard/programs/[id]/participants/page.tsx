import { Download } from "lucide-react";
import { getOwnedProgram } from "@/lib/program-server";
import ParticipantsTable from "./ParticipantsTable";

export const metadata = { title: "Peserta" };

export default async function ParticipantsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { program, fields, supabase } = await getOwnedProgram(id);
  const { data } = await supabase.from("participants").select("*").eq("program_id", id).order("created_at", { ascending: false }).limit(2000);
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-600">
          Mode: <b>{program.approval_mode === "auto" ? "Sertifikat terbit otomatis" : "Perlu approval"}</b>
        </p>
        <a href={`/api/programs/${id}/export`} className="btn btn-sm"><Download className="h-4 w-4" /> Unduh kehadiran (CSV)</a>
      </div>
      <ParticipantsTable programId={id} fields={fields.map((f) => ({ id: f.id, label: f.label }))} rows={data ?? []} />
    </div>
  );
}
