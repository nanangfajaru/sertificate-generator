import { Download } from "lucide-react";
import CopyButton from "@/components/CopyButton";
import { getOwnedProgram } from "@/lib/program-server";
import { siteUrl } from "@/lib/util";
import { deleteProgram, updateProgram } from "../../actions";
import ProgramForm from "../../ProgramForm";
import DeleteButton from "./DeleteButton";

export const metadata = { title: "Ringkasan program" };

export default async function ProgramOverview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { program, supabase } = await getOwnedProgram(id);
  const link = `${siteUrl()}/p/${program.slug}`;
  const { data: rows } = await supabase.from("participants").select("status").eq("program_id", id);
  const stat = { total: rows?.length ?? 0, pending: 0, approved: 0 };
  rows?.forEach((r) => {
    if (r.status === "pending") stat.pending++;
    if (r.status === "approved") stat.approved++;
  });

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <ProgramForm action={updateProgram.bind(null, id)} program={program} submitLabel="Simpan perubahan" />
      </div>
      <div className="space-y-6">
        <div className="card">
          <h2 className="font-semibold">Link pendaftaran</h2>
          <p className="mt-2 break-all rounded-lg bg-slate-50 p-2 font-mono text-xs">{link}</p>
          <div className="mt-3 flex gap-2">
            <CopyButton text={link} />
            <a href={link} target="_blank" className="btn btn-sm">Buka</a>
          </div>
          {!program.is_open && <p className="mt-3 text-xs text-amber-700">Pendaftaran sedang ditutup.</p>}
        </div>
        <div className="card">
          <h2 className="font-semibold">Peserta</h2>
          <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
            {[["Total", stat.total], ["Menunggu", stat.pending], ["Disetujui", stat.approved]].map(([l, v]) => (
              <div key={l as string} className="rounded-lg bg-slate-50 p-2">
                <dd className="text-xl font-bold">{v}</dd>
                <dt className="text-xs text-slate-500">{l}</dt>
              </div>
            ))}
          </dl>
          <a href={`/api/programs/${id}/export`} className="btn btn-sm mt-3 w-full"><Download className="h-4 w-4" /> Unduh kehadiran (CSV)</a>
        </div>
        <div className="card">
          <h2 className="font-semibold text-red-700">Zona berbahaya</h2>
          <p className="mt-1 text-xs text-slate-500">Menghapus program juga menghapus seluruh peserta dan tidak dapat dibatalkan.</p>
          <DeleteButton action={deleteProgram.bind(null, id)} />
        </div>
      </div>
    </div>
  );
}
