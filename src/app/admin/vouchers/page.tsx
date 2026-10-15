import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import CopyButton from "@/components/CopyButton";
import { siteUrl } from "@/lib/util";
import { getPricing, getReferralDefaults } from "@/lib/billing";
import PricingForm from "./PricingForm";
import ReferralForUserForm from "./ReferralForUserForm";
import DefaultsForm from "./DefaultsForm";
import ToggleButton from "./ToggleButton";
import VoucherForm from "./VoucherForm";

export const metadata = { title: "Voucher · Admin" };

const rp = (n: number) => `Rp${n.toLocaleString("id-ID")}`;
const date = (s: string) => new Date(s).toLocaleDateString("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" });

type Voucher = { id: string; code: string; label: string | null; discount_percent: number; commission_percent: number; partner_token: string | null; owner_id: string | null; payout_info: string | null; max_uses: number | null; expires_at: string | null; active: boolean; created_at: string };
type Order = { id: string; order_id: string; plan: string; amount: number; discount_amount: number; commission_amount: number; voucher_id: string | null; voucher_code: string | null; status: string; paid_at: string | null; created_at: string; profiles: { email: string | null } | null };

export default async function VouchersPage() {
  await requireAdmin();
  const admin = createAdminClient();
  const [pricing, defaults, { data: vs }, { data: os }] = await Promise.all([
    getPricing(admin),
    getReferralDefaults(admin),
    admin.from("vouchers").select("*").order("created_at", { ascending: false }),
    admin.from("orders").select("id, order_id, plan, amount, discount_amount, commission_amount, voucher_id, voucher_code, status, paid_at, created_at, profiles(email)").order("created_at", { ascending: false }).limit(1000),
  ]);
  const vouchers = (vs ?? []) as Voucher[];
  const orders = (os ?? []) as unknown as Order[];
  const paid = orders.filter((o) => o.status === "paid");
  const stat = new Map<string, { uses: number; revenue: number; commission: number }>();
  for (const o of paid) {
    if (!o.voucher_id) continue;
    const s = stat.get(o.voucher_id) ?? { uses: 0, revenue: 0, commission: 0 };
    s.uses++; s.revenue += o.amount; s.commission += o.commission_amount;
    stat.set(o.voucher_id, s);
  }
  const totalRevenue = paid.reduce((a, o) => a + o.amount, 0);
  const totalCommission = [...stat.values()].reduce((a, s) => a + s.commission, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Voucher & Referral</h1>
        <p className="text-sm text-slate-500">Setiap voucher bisa dibagikan ke pihak lain sebagai kode referral: pembeli mendapat diskon, pemilik kode mendapat komisi dari tiap pembayaran yang berhasil.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[["Pendapatan (lunas)", rp(totalRevenue)], ["Transaksi lunas", String(paid.length)], ["Total komisi terutang", rp(totalCommission)]].map(([l, v]) => (
          <div key={l} className="card !p-4"><p className="text-2xl font-bold">{v}</p><p className="text-xs text-slate-500">{l}</p></div>
        ))}
      </div>

      <PricingForm pricing={pricing} />

      <DefaultsForm discount={defaults.discount_percent} commission={defaults.commission_percent} />

      <ReferralForUserForm />

      <VoucherForm />

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Kode</th><th className="px-3 py-2">Pemilik</th>
              <th className="px-3 py-2 text-right">Diskon</th><th className="px-3 py-2 text-right">Komisi</th>
              <th className="px-3 py-2 text-right">Dipakai</th><th className="px-3 py-2 text-right">Pendapatan</th>
              <th className="px-3 py-2 text-right">Komisi terutang</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Link</th><th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {vouchers.length === 0 && <tr><td colSpan={10} className="px-3 py-6 text-center text-slate-500">Belum ada voucher.</td></tr>}
            {vouchers.map((v) => {
              const s = stat.get(v.id) ?? { uses: 0, revenue: 0, commission: 0 };
              const expired = v.expires_at && new Date(v.expires_at) < new Date();
              const full = v.max_uses != null && s.uses >= v.max_uses;
              return (
                <tr key={v.id}>
                  <td className="px-3 py-2 font-mono font-semibold">{v.code}</td>
                  <td className="px-3 py-2">{v.label || "—"}{v.owner_id && <span className="badge ml-1.5">Pengguna</span>}{v.payout_info && <div className="mt-0.5 max-w-[14rem] whitespace-pre-wrap text-[11px] text-slate-500">{v.payout_info}</div>}</td>
                  <td className="px-3 py-2 text-right">{v.owner_id ? defaults.discount_percent : v.discount_percent}%</td>
                  <td className="px-3 py-2 text-right">{v.owner_id ? defaults.commission_percent : v.commission_percent}%</td>
                  <td className="px-3 py-2 text-right">{s.uses}{v.max_uses != null ? ` / ${v.max_uses}` : ""}</td>
                  <td className="px-3 py-2 text-right">{rp(s.revenue)}</td>
                  <td className="px-3 py-2 text-right font-medium">{rp(s.commission)}</td>
                  <td className="px-3 py-2">
                    <span className={`badge ${!v.active || expired || full ? "badge-bad" : "badge-ok"}`}>{!v.active ? "Nonaktif" : expired ? "Kedaluwarsa" : full ? "Kuota habis" : "Aktif"}</span>
                    {v.expires_at && <div className="mt-0.5 text-[11px] text-slate-500">s.d. {date(v.expires_at)}</div>}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1.5">
                      <CopyButton text={`${siteUrl()}/?ref=${v.code}`} label="Referral" />
                      {v.partner_token && <CopyButton text={`${siteUrl()}/mitra/${v.partner_token}`} label="Mitra" />}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right"><ToggleButton id={v.id} active={v.active} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div>
        <h2 className="mb-2 text-lg font-semibold">Transaksi terbaru</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr><th className="px-3 py-2">Order</th><th className="px-3 py-2">Pengguna</th><th className="px-3 py-2">Paket</th><th className="px-3 py-2 text-right">Dibayar</th><th className="px-3 py-2">Voucher</th><th className="px-3 py-2 text-right">Komisi</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Tanggal</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length === 0 && <tr><td colSpan={8} className="px-3 py-6 text-center text-slate-500">Belum ada transaksi.</td></tr>}
              {orders.slice(0, 50).map((o) => (
                <tr key={o.id}>
                  <td className="px-3 py-2 font-mono text-xs">{o.order_id}</td>
                  <td className="px-3 py-2">{o.profiles?.email ?? "—"}</td>
                  <td className="px-3 py-2">{o.plan === "yearly" ? "Tahunan" : "Bulanan"}</td>
                  <td className="px-3 py-2 text-right">{rp(o.amount)}</td>
                  <td className="px-3 py-2 font-mono text-xs">{o.voucher_code ?? "—"}</td>
                  <td className="px-3 py-2 text-right">{o.status === "paid" && o.commission_amount ? rp(o.commission_amount) : "—"}</td>
                  <td className="px-3 py-2"><span className={`badge ${o.status === "paid" ? "badge-ok" : o.status === "pending" ? "badge-warn" : "badge-bad"}`}>{o.status}</span></td>
                  <td className="whitespace-nowrap px-3 py-2 text-slate-600">{date(o.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
