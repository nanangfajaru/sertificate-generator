import { Gift, Percent, Wallet } from "lucide-react";
import CopyButton from "@/components/CopyButton";
import { requireUser } from "@/lib/auth";
import { getReferralDefaults } from "@/lib/billing";
import { createAdminClient } from "@/lib/supabase/admin";
import { siteUrl } from "@/lib/util";
import { CreateForm, PayoutForm } from "./ReferralForms";

export const metadata = { title: "Referral" };

const rp = (n: number) => `Rp${n.toLocaleString("id-ID")}`;
const date = (s: string) => new Date(s).toLocaleDateString("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" });

export default async function ReferralPage() {
  const { profile } = await requireUser();
  const admin = createAdminClient();
  const [d, { data: v }] = await Promise.all([
    getReferralDefaults(admin),
    admin.from("vouchers").select("id, code, active, payout_info").eq("owner_id", profile.id).maybeSingle(),
  ]);
  const { data: orders } = v
    ? await admin.from("orders").select("plan, amount, commission_amount, paid_at").eq("voucher_id", v.id).eq("status", "paid").order("paid_at", { ascending: false }).limit(200)
    : { data: [] };
  const rows = orders ?? [];
  const earned = rows.reduce((a, o) => a + o.commission_amount, 0);
  const suggestion = (profile.full_name ?? profile.email ?? "").split(/[\s@]/)[0].replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 10);
  const link = v ? `${siteUrl()}/?ref=${v.code}` : "";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Referral</h1>
        <p className="text-sm text-slate-500">Ajak orang lain memakai SertifikatKu Pro dan dapatkan komisi dari setiap pembayaran mereka.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="card !p-4 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><Percent className="h-5 w-5" /></span><div><p className="text-xl font-bold">{d.discount_percent}%</p><p className="text-xs text-slate-500">Diskon untuk pembeli</p></div></div>
        <div className="card !p-4 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-700"><Wallet className="h-5 w-5" /></span><div><p className="text-xl font-bold">{d.commission_percent}%</p><p className="text-xs text-slate-500">Komisi untuk Anda</p></div></div>
      </div>

      {!v ? (
        <div className="card">
          <div className="mb-3 flex items-center gap-2 font-semibold"><Gift className="h-5 w-5 text-brand-600" /> Buat kode referral</div>
          <CreateForm suggestion={suggestion} />
        </div>
      ) : (
        <>
          <div className="card">
            <p className="text-sm text-slate-500">Kode referral Anda</p>
            <p className="mt-1 font-mono text-3xl font-bold tracking-wide">{v.code}</p>
            {!v.active && <p className="mt-2 text-sm text-red-600">Kode ini sedang dinonaktifkan.</p>}
            <p className="mt-2 text-sm text-slate-600">Pembeli yang memakai kode ini mendapat diskon <b>{d.discount_percent}%</b>, dan Anda mendapat komisi <b>{d.commission_percent}%</b> dari nilai yang mereka bayar.</p>
            <p className="mt-4 text-xs text-slate-500">Bagikan link ini (kode terisi otomatis saat pembeli upgrade):</p>
            <p className="mt-1 break-all rounded-lg bg-slate-50 p-2 font-mono text-xs">{link}</p>
            <div className="mt-2 flex gap-2"><CopyButton text={link} label="Salin link" /><CopyButton text={v.code} label="Salin kode" /></div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="card !p-4"><p className="text-2xl font-bold">{rows.length}</p><p className="text-xs text-slate-500">Pembayaran berhasil</p></div>
            <div className="card !p-4"><p className="text-2xl font-bold">{rp(earned)}</p><p className="text-xs text-slate-500">Total komisi</p></div>
          </div>

          <div className="card"><PayoutForm defaultValue={v.payout_info ?? ""} /><p className="mt-2 text-xs text-slate-500">Komisi dicairkan oleh admin ke rekening di atas.</p></div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-3 py-2">Tanggal</th><th className="px-3 py-2">Paket</th><th className="px-3 py-2 text-right">Komisi</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {rows.length === 0 && <tr><td colSpan={3} className="px-3 py-6 text-center text-slate-500">Belum ada pemakaian.</td></tr>}
                {rows.map((o, i) => (
                  <tr key={i}><td className="px-3 py-2">{o.paid_at ? date(o.paid_at) : "—"}</td><td className="px-3 py-2">{o.plan === "yearly" ? "Pro Tahunan" : "Pro Bulanan"}</td><td className="px-3 py-2 text-right font-medium">{rp(o.commission_amount)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
