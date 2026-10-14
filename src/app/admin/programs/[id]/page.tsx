import Link from "next/link";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { formatDateRange } from "@/lib/certificate/sources";
import type { Participant, Program, ProgramField } from "@/lib/db";
import { publicLink, siteUrl } from "@/lib/util";

const STATUS = { pending: ["Menunggu", "badge-warn"], approved: ["Disetujui", "badge-ok"], rejected: ["Ditolak", "badge-bad"], revoked: ["Dicabut", "badge-revoked"] } as const;

export default async function AdminProgram({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("programs").select("*, owner:profiles(email, full_name)").eq("id", id).maybeSingle();
  if (!data) notFound();
  const program = data as Program & { owner: { email: string; full_name: string | null } | null };
  const { data: f } = await supabase.from("program_fields").select("*").eq("program_id", id).order("sort");
  const fields = (f ?? []) as ProgramField[];
  const { data: p, count } = await supabase.from("participants").select("*", { count: "exact" }).eq("program_id", id).order("created_at", { ascending: false }).limit(500);
  const rows = (p ?? []) as Participant[];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/programs" className="text-sm text-slate-500 hover:text-slate-800">← Semua program</Link>
        <h1 className="mt-2 text-2xl font-bold">{program.name}</h1>
        <p className="text-sm text-slate-500">{program.org_name} · {formatDateRange(program.start_date, program.end_date)}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card text-sm">
          <h2 className="mb-2 font-semibold">Informasi</h2>
          <dl className="space-y-1 text-slate-600">
            <div>Pemilik: <b className="text-slate-900">{program.owner?.email}</b></div>
            <div>Jenis: {program.cert_type}</div>
            <div>Alur: {program.approval_mode === "auto" ? "Otomatis" : "Perlu approval"}</div>
            <div>Template: {program.cert_mode === "custom" ? "Desain sendiri" : program.template_id}</div>
            <div>Pendaftaran: {program.is_open ? "Dibuka" : "Ditutup"}</div>
          </dl>
        </div>
        <div className="card text-sm md:col-span-2">
          <h2 className="mb-2 font-semibold">Tautan</h2>
          <p className="break-all font-mono text-xs">{publicLink(program)}</p>
          <div className="mt-3 flex gap-2">
            <a className="btn btn-sm" target="_blank" href={`/p/${program.alias || program.slug}`}>Buka form publik</a>
            <a className="btn btn-sm" href={`/api/programs/${id}/export`}><Download className="h-4 w-4" /> Kehadiran (CSV)</a>
            <a className="btn btn-sm" target="_blank" href={`/api/programs/${id}/sample`}>Contoh PDF</a>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-2 font-semibold">Peserta ({count ?? rows.length}{(count ?? 0) > rows.length ? `, menampilkan ${rows.length} terbaru` : ""})</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Waktu</th>
                {fields.map((x) => <th key={x.id} className="px-3 py-2">{x.label}</th>)}
                <th className="px-3 py-2">Status</th><th className="px-3 py-2">No. sertifikat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="whitespace-nowrap px-3 py-2 text-slate-500">{new Date(r.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</td>
                  {fields.map((x) => <td key={x.id} className="max-w-56 truncate px-3 py-2">{r.data[x.id] ?? ""}</td>)}
                  <td className="px-3 py-2"><span className={`badge ${STATUS[r.status][1]}`}>{STATUS[r.status][0]}</span></td>
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">{r.status === "approved" ? <a className="hover:text-brand-700" target="_blank" href={`/c/${r.code}`}>{r.cert_number}</a> : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
