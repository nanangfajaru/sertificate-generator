import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import PlanControl from "./PlanControl";
import ListToolbar from "@/components/admin/ListToolbar";
import Pager, { likeTerm, pageOf } from "@/components/admin/Pager";

const SIZE = 25;

export const metadata = { title: "Pengguna · Admin" };

type SP = { q?: string; plan?: string; page?: string };

export default async function UsersPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  await requireAdmin();
  // Service role setelah lolos cek admin: tidak menjalankan kebijakan RLS per baris (lebih cepat untuk data semua pengguna).
  const supabase = createAdminClient();
  const page = pageOf(sp.page);
  const term = likeTerm(sp.q);
  let query = supabase
    .from("profiles")
    .select("id, email, full_name, plan, plan_expires_at, is_admin, created_at, signup_source, programs(count)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * SIZE, page * SIZE - 1);
  if (term) query = query.or(`email.ilike.%${term}%,full_name.ilike.%${term}%`);
  if (sp.plan === "pro") query = query.eq("plan", "pro");
  if (sp.plan === "free") query = query.neq("plan", "pro");
  if (sp.plan === "admin") query = query.eq("is_admin", true);
  const { data, count } = await query;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold tracking-tight">Pengguna</h1>
      <div className="mb-3"><ListToolbar placeholder="Cari nama atau email…" filters={[{ param: "plan", label: "Paket", options: [["pro", "Pro"], ["free", "Free"], ["admin", "Admin"]] }]} /></div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Pengguna</th><th className="px-3 py-2">Bergabung</th><th className="px-3 py-2">Sumber</th>
              <th className="px-3 py-2 text-right">Program</th><th className="px-3 py-2">Paket</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(data ?? []).length === 0 && <tr><td colSpan={5} className="px-3 py-8 text-center text-slate-500">Tidak ada pengguna.</td></tr>}
            {(data ?? []).map((u) => (
              <tr key={u.id}>
                <td className="px-3 py-2">
                  <div className="font-medium">{u.full_name || "—"} {u.is_admin && <span className="badge badge-pro ml-1">Admin</span>}</div>
                  <div className="text-xs text-slate-500">{u.email}</div>
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-slate-600">{new Date(u.created_at).toLocaleDateString("id-ID", { dateStyle: "medium" })}</td>
                <td className="px-3 py-2 text-slate-600">{u.signup_source ?? "—"}</td>
                <td className="px-3 py-2 text-right">{(u.programs as unknown as { count: number }[])?.[0]?.count ?? 0}</td>
                <td className="px-3 py-2"><PlanControl userId={u.id} plan={u.plan} expires={u.plan_expires_at?.slice(0, 10) ?? ""} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3"><Pager path="/admin/users" params={sp} page={page} total={count ?? 0} size={SIZE} noun="pengguna" /></div>
    </div>
  );
}
