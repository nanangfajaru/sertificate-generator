import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatDateRange } from "@/lib/certificate/sources";

export const metadata = { title: "Program · Admin" };

export default async function AllPrograms() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("programs")
    .select("id, name, org_name, start_date, end_date, approval_mode, is_open, owner:profiles(email), participants(count)")
    .order("created_at", { ascending: false })
    .limit(1000);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold tracking-tight">Semua program</h1>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Program</th><th className="px-3 py-2">Pemilik</th><th className="px-3 py-2">Tanggal</th>
              <th className="px-3 py-2">Alur</th><th className="px-3 py-2">Status</th><th className="px-3 py-2 text-right">Peserta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(data ?? []).map((p) => (
              <tr key={p.id}>
                <td className="px-3 py-2"><Link href={`/admin/programs/${p.id}`} className="font-medium hover:text-brand-700">{p.name}</Link><div className="text-xs text-slate-500">{p.org_name}</div></td>
                <td className="px-3 py-2 text-slate-600">{(p.owner as unknown as { email: string } | null)?.email}</td>
                <td className="whitespace-nowrap px-3 py-2 text-slate-600">{formatDateRange(p.start_date, p.end_date)}</td>
                <td className="px-3 py-2">{p.approval_mode === "auto" ? "Otomatis" : "Approval"}</td>
                <td className="px-3 py-2"><span className={`badge ${p.is_open ? "badge-ok" : ""}`}>{p.is_open ? "Dibuka" : "Ditutup"}</span></td>
                <td className="px-3 py-2 text-right">{(p.participants as unknown as { count: number }[])?.[0]?.count ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
