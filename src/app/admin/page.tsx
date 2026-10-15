import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatDateRange } from "@/lib/certificate/sources";

export default async function AdminHome() {
  const { supabase } = await requireAdmin();
  const count = async (table: string, filter?: (q: any) => any) => {
    let q = supabase.from(table).select("id", { count: "exact", head: true });
    if (filter) q = filter(q);
    return (await q).count ?? 0;
  };
  const [users, pro, programs, participants, approved, pending] = await Promise.all([
    count("profiles"),
    count("profiles", (q) => q.eq("plan", "pro")),
    count("programs"),
    count("participants"),
    count("participants", (q) => q.eq("status", "approved")),
    count("participants", (q) => q.eq("status", "pending")),
  ]);
  const { data: recent } = await supabase
    .from("programs")
    .select("id, name, org_name, start_date, end_date, created_at, owner:profiles(email), participants(count)")
    .order("created_at", { ascending: false })
    .limit(8);

  const stats: [string, number][] = [
    ["Pengguna", users], ["Pengguna Pro", pro], ["Program", programs],
    ["Peserta", participants], ["Sertifikat terbit", approved], ["Menunggu persetujuan", pending],
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">Ringkasan</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {stats.map(([l, v]) => (
          <div key={l} className="card !p-4">
            <p className="text-2xl font-bold">{v.toLocaleString("id-ID")}</p>
            <p className="text-xs text-slate-500">{l}</p>
          </div>
        ))}
      </div>
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Program terbaru</h2>
          <Link href="/admin/programs" className="text-sm text-brand-700 hover:underline">Lihat semua</Link>
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr><th className="px-3 py-2">Program</th><th className="px-3 py-2">Pemilik</th><th className="px-3 py-2">Tanggal</th><th className="px-3 py-2 text-right">Peserta</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(recent ?? []).map((p) => (
                <tr key={p.id}>
                  <td className="px-3 py-2"><Link href={`/admin/programs/${p.id}`} className="font-medium hover:text-brand-700">{p.name}</Link><div className="text-xs text-slate-500">{p.org_name}</div></td>
                  <td className="px-3 py-2 text-slate-600">{(p.owner as unknown as { email: string } | null)?.email}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-slate-600">{formatDateRange(p.start_date, p.end_date)}</td>
                  <td className="px-3 py-2 text-right">{(p.participants as unknown as { count: number }[])?.[0]?.count ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
