import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDateRange } from "@/lib/certificate/sources";
import ListToolbar from "@/components/admin/ListToolbar";
import Pager, { likeTerm, pageOf } from "@/components/admin/Pager";

const SIZE = 20;

export const metadata = { title: "Program · Admin" };

type SP = { q?: string; status?: string; page?: string };

export default async function AllPrograms({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  await requireAdmin();
  // Service role setelah lolos cek admin: tidak menjalankan kebijakan RLS per baris (lebih cepat untuk data semua pengguna).
  const supabase = createAdminClient();
  const page = pageOf(sp.page);
  const term = likeTerm(sp.q);
  let query = supabase
    .from("programs")
    .select("id, name, org_name, start_date, end_date, approval_mode, is_open, owner:profiles(email), participants(count)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * SIZE, page * SIZE - 1);
  if (term) query = query.or(`name.ilike.%${term}%,org_name.ilike.%${term}%`);
  if (sp.status === "open") query = query.eq("is_open", true);
  if (sp.status === "closed") query = query.eq("is_open", false);
  const { data, count } = await query;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold tracking-tight">Semua program</h1>
      <div className="mb-3"><ListToolbar placeholder="Cari nama program atau penyelenggara…" filters={[{ param: "status", label: "Status", options: [["open", "Dibuka"], ["closed", "Ditutup"]] }]} /></div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Program</th><th className="px-3 py-2">Pemilik</th><th className="px-3 py-2">Tanggal</th>
              <th className="px-3 py-2">Alur</th><th className="px-3 py-2">Status</th><th className="px-3 py-2 text-right">Peserta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(data ?? []).length === 0 && <tr><td colSpan={6} className="px-3 py-8 text-center text-slate-500">Tidak ada program.</td></tr>}
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
      <div className="mt-3"><Pager path="/admin/programs" params={sp} page={page} total={count ?? 0} size={SIZE} noun="program" /></div>
    </div>
  );
}
