import { requireAdmin } from "@/lib/auth";
import PlanControl from "./PlanControl";

export const metadata = { title: "Pengguna · Admin" };

export default async function UsersPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("profiles")
    .select("id, email, full_name, plan, plan_expires_at, is_admin, created_at, programs(count)")
    .order("created_at", { ascending: false })
    .limit(500);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Pengguna</h1>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Pengguna</th><th className="px-3 py-2">Bergabung</th>
              <th className="px-3 py-2 text-right">Program</th><th className="px-3 py-2">Paket</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(data ?? []).map((u) => (
              <tr key={u.id}>
                <td className="px-3 py-2">
                  <div className="font-medium">{u.full_name || "—"} {u.is_admin && <span className="badge badge-pro ml-1">Admin</span>}</div>
                  <div className="text-xs text-slate-500">{u.email}</div>
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-slate-600">{new Date(u.created_at).toLocaleDateString("id-ID", { dateStyle: "medium" })}</td>
                <td className="px-3 py-2 text-right">{(u.programs as unknown as { count: number }[])?.[0]?.count ?? 0}</td>
                <td className="px-3 py-2"><PlanControl userId={u.id} plan={u.plan} expires={u.plan_expires_at?.slice(0, 10) ?? ""} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
