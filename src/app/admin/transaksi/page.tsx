import { Download } from "lucide-react";
import ListToolbar from "@/components/admin/ListToolbar";
import Pager, { likeTerm, pageOf } from "@/components/admin/Pager";
import { requireAdmin } from "@/lib/auth";
import { CHECKOUT_CLOSED_DEFAULT, getCheckoutSetting } from "@/lib/billing";
import { createAdminClient } from "@/lib/supabase/admin";
import CheckoutSwitch from "./CheckoutSwitch";
import DeleteOrder from "./DeleteOrder";

export const metadata = { title: "Transaksi · Admin" };

const SIZE = 25;
type SP = { q?: string; status?: string; plan?: string; page?: string };
type Order = { order_id: string; plan: string; amount: number; base_amount: number | null; discount_amount: number | null; voucher_code: string | null; status: string; payment_method: string | null; paid_at: string | null; created_at: string; profiles: { email: string | null; full_name: string | null } | null };

const STATUS: Record<string, [string, string]> = { paid: ["Lunas", "badge-ok"], pending: ["Menunggu bayar", "badge-warn"], failed: ["Gagal", "badge-bad"], expired: ["Kedaluwarsa", ""], cancelled: ["Dibatalkan", ""] };
const rp = (n: number) => `Rp${Math.round(n).toLocaleString("id-ID")}`;
const tgl = (s: string) => new Date(s).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" });
const planLabel = (p: string) => (p === "yearly" ? "Tahunan" : p === "monthly" ? "Bulanan" : p);

export default async function TransactionsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  await requireAdmin();
  const admin = createAdminClient();
  const page = pageOf(sp.page);
  const term = likeTerm(sp.q);

  // Cari juga berdasarkan email/nama pembeli.
  const { data: buyers } = term ? await admin.from("profiles").select("id").or(`email.ilike.%${term}%,full_name.ilike.%${term}%`).limit(100) : { data: [] };
  let q = admin
    .from("orders")
    .select("order_id, plan, amount, base_amount, discount_amount, voucher_code, status, payment_method, paid_at, created_at, profiles(email, full_name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * SIZE, page * SIZE - 1);
  if (term) {
    const ids = (buyers ?? []).map((b) => b.id);
    q = q.or([`order_id.ilike.%${term}%`, `voucher_code.ilike.%${term}%`, ...(ids.length ? [`user_id.in.(${ids.join(",")})`] : [])].join(","));
  }
  if (sp.status && STATUS[sp.status]) q = q.eq("status", sp.status);
  if (sp.plan === "monthly" || sp.plan === "yearly") q = q.eq("plan", sp.plan);

  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const [{ data, count }, { data: paidRows }, { count: pendingCount }, checkout] = await Promise.all([
    q,
    admin.from("orders").select("amount, paid_at").eq("status", "paid").limit(10000),
    admin.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
    getCheckoutSetting(admin),
  ]);
  const rows = (data ?? []) as unknown as Order[];
  const paid = paidRows ?? [];
  const revenue = paid.reduce((a, o) => a + Number(o.amount), 0);
  const monthRevenue = paid.filter((o) => o.paid_at && new Date(o.paid_at) >= monthStart).reduce((a, o) => a + Number(o.amount), 0);

  const stats: [string, string][] = [
    ["Pendapatan total", rp(revenue)],
    ["Pendapatan bulan ini", rp(monthRevenue)],
    ["Transaksi lunas", paid.length.toLocaleString("id-ID")],
    ["Menunggu bayar", (pendingCount ?? 0).toLocaleString("id-ID")],
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Transaksi</h1>
        <p className="text-sm text-slate-500">Semua pembelian paket Pro dari seluruh pengguna. Transaksi uji coba bisa dihapus agar pendapatan & komisi bersih.</p>
      </div>

      <CheckoutSwitch enabled={checkout.enabled} message={checkout.message} fallback={CHECKOUT_CLOSED_DEFAULT} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(([l, v]) => (
          <div key={l} className="card !p-4">
            <p className="text-xl font-bold text-navy">{v}</p>
            <p className="text-xs text-slate-500">{l}</p>
          </div>
        ))}
      </div>

      <ListToolbar
        placeholder="Cari no. pesanan, voucher, email, atau nama pembeli…"
        filters={[
          { param: "status", label: "Status", options: Object.entries(STATUS).map(([k, [l]]) => [k, l]) },
          { param: "plan", label: "Paket", options: [["monthly", "Bulanan"], ["yearly", "Tahunan"]] },
        ]}
      />

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">Belum ada transaksi.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="px-4 py-2.5">Tanggal</th><th className="px-4 py-2.5">Pembeli</th><th className="px-4 py-2.5">Paket</th><th className="px-4 py-2.5 text-right">Dibayar</th><th className="px-4 py-2.5">Metode</th><th className="px-4 py-2.5">Status</th><th className="px-4 py-2.5">No. pesanan</th><th className="px-4 py-2.5" /></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((o) => {
                const [label, tone] = STATUS[o.status] ?? [o.status, ""];
                return (
                  <tr key={o.order_id} className="hover:bg-slate-50/60">
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{tgl(o.paid_at ?? o.created_at)}</td>
                    <td className="px-4 py-3"><p className="font-medium text-slate-900">{o.profiles?.full_name ?? "—"}</p><p className="text-xs text-slate-500">{o.profiles?.email}</p></td>
                    <td className="whitespace-nowrap px-4 py-3">{planLabel(o.plan)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <span className="font-semibold">{rp(o.amount)}</span>
                      {o.voucher_code && <span className="block text-[11px] text-slate-500">Voucher {o.voucher_code}{o.discount_amount ? ` (−${rp(o.discount_amount)})` : ""}</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{o.payment_method ?? "—"}</td>
                    <td className="px-4 py-3"><span className={`badge whitespace-nowrap ${tone}`}>{label}</span></td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-500">{o.order_id}</td>
                    <td className="px-4 py-3"><div className="flex justify-end gap-1.5">{o.status === "paid" && <a href={`/api/orders/${encodeURIComponent(o.order_id)}/invoice`} className="btn btn-sm" title="Unduh invoice"><Download className="h-4 w-4" /> Invoice</a>}<DeleteOrder orderId={o.order_id} paid={o.status === "paid"} /></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <Pager path="/admin/transaksi" params={sp} page={page} total={count ?? 0} size={SIZE} noun="transaksi" />
    </div>
  );
}
