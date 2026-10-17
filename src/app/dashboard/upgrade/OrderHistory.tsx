import { Receipt } from "lucide-react";

export type HistoryRow = { order_id: string; plan: string; base_amount: number | null; discount_amount: number | null; amount: number; voucher_code: string | null; status: string; payment_url: string | null; paid_at: string | null; created_at: string };

const STATUS_LABEL: Record<string, [string, string]> = {
  paid: ["Lunas", "badge-ok"],
  pending: ["Menunggu bayar", "badge-warn"],
  failed: ["Gagal", "badge-bad"],
  expired: ["Kedaluwarsa", ""],
};
const idr = (n: number) => `Rp${n.toLocaleString("id-ID")}`;
const tgl = (s: string) => new Date(s).toLocaleDateString("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" });
const planLabel = (p: string) => (p === "yearly" ? "Pro Tahunan" : p === "monthly" ? "Pro Bulanan" : p);

/** Riwayat pembelian paket Pro milik pengguna (kartu di HP, tabel di layar lebar). */
export default function OrderHistory({ rows }: { rows: HistoryRow[] }) {
  const status = (s: string) => STATUS_LABEL[s] ?? [s, ""];
  const paidAmount = (r: HistoryRow) => (
    <>
      <span className="font-semibold text-slate-900">{idr(r.amount)}</span>
      {!!r.discount_amount && r.base_amount ? <span className="ml-1.5 text-xs text-slate-400 line-through">{idr(r.base_amount)}</span> : null}
      {r.voucher_code && <span className="mt-0.5 block text-[11px] text-slate-500">Voucher {r.voucher_code}</span>}
    </>
  );
  const action = (r: HistoryRow) =>
    r.status === "pending" && r.payment_url ? <a href={r.payment_url} className="btn btn-primary btn-sm">Lanjutkan bayar</a> : null;
  return (
    <section className="mt-10">
      <h2 className="flex items-center gap-2 text-lg font-semibold"><Receipt className="h-5 w-5 text-brand-600" /> Riwayat pembelian</h2>
      {rows.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">Belum ada pembelian paket Pro.</p>
      ) : (
        <>
          <ul className="mt-3 space-y-2 sm:hidden">
            {rows.map((r) => (
              <li key={r.order_id} className="card !p-3.5 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold">{planLabel(r.plan)}</p>
                    <p className="text-xs text-slate-500">{tgl(r.paid_at ?? r.created_at)}</p>
                  </div>
                  <span className={`badge shrink-0 ${status(r.status)[1]}`}>{status(r.status)[0]}</span>
                </div>
                <div className="mt-2 flex items-end justify-between gap-2">
                  <div>{paidAmount(r)}</div>
                  {action(r)}
                </div>
                <p className="mt-2 truncate font-mono text-[11px] text-slate-400">{r.order_id}</p>
              </li>
            ))}
          </ul>
          <div className="mt-3 hidden overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm sm:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr><th className="px-4 py-2.5">Tanggal</th><th className="px-4 py-2.5">Paket</th><th className="px-4 py-2.5">Dibayar</th><th className="px-4 py-2.5">Status</th><th className="px-4 py-2.5">No. pesanan</th><th className="px-4 py-2.5" /></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <tr key={r.order_id}>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{tgl(r.paid_at ?? r.created_at)}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium">{planLabel(r.plan)}</td>
                    <td className="px-4 py-3">{paidAmount(r)}</td>
                    <td className="px-4 py-3"><span className={`badge ${status(r.status)[1]}`}>{status(r.status)[0]}</span></td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{r.order_id}</td>
                    <td className="px-4 py-3 text-right">{action(r)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
