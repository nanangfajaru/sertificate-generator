import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CopyButton from "@/components/CopyButton";
import Logo from "@/components/Logo";
import { createAdminClient } from "@/lib/supabase/admin";
import { siteUrl } from "@/lib/util";

export const metadata: Metadata = { title: "Dashboard Mitra", robots: { index: false, follow: false } };

const rp = (n: number) => `Rp${n.toLocaleString("id-ID")}`;
const date = (s: string) => new Date(s).toLocaleDateString("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" });

export default async function PartnerPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[a-f0-9]{16,64}$/.test(token)) notFound();
  const admin = createAdminClient();
  const { data: v } = await admin.from("vouchers").select("id, code, label, discount_percent, commission_percent, active").eq("partner_token", token).maybeSingle();
  if (!v) notFound();
  const { data: orders } = await admin.from("orders").select("plan, amount, commission_amount, paid_at").eq("voucher_id", v.id).eq("status", "paid").order("paid_at", { ascending: false }).limit(200);
  const rows = orders ?? [];
  const total = rows.reduce((a, o) => a + o.commission_amount, 0);
  const link = `${siteUrl()}/?ref=${v.code}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex h-14 max-w-3xl items-center px-5"><Logo size={30} /></div></header>
      <main className="mx-auto max-w-3xl space-y-6 px-5 py-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard mitra{v.label ? ` · ${v.label}` : ""}</h1>
          <p className="text-sm text-slate-500">Pantau pemakaian kode referral Anda.</p>
        </div>

        <div className="card">
          <p className="text-sm text-slate-500">Kode referral Anda</p>
          <p className="mt-1 font-mono text-3xl font-bold tracking-wide">{v.code}</p>
          <p className="mt-2 text-sm text-slate-600">Pembeli mendapat diskon <b>{v.discount_percent}%</b>. Anda mendapat komisi <b>{v.commission_percent}%</b> dari setiap pembayaran yang berhasil.</p>
          {!v.active && <p className="mt-2 text-sm text-red-600">Kode ini sedang nonaktif.</p>}
          <p className="mt-4 text-xs text-slate-500">Bagikan link ini (kode terisi otomatis saat pembeli upgrade):</p>
          <p className="mt-1 break-all rounded-lg bg-slate-50 p-2 font-mono text-xs">{link}</p>
          <div className="mt-2"><CopyButton text={link} label="Salin link" /></div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="card !p-4"><p className="text-2xl font-bold">{rows.length}</p><p className="text-xs text-slate-500">Pembayaran berhasil</p></div>
          <div className="card !p-4"><p className="text-2xl font-bold">{rp(total)}</p><p className="text-xs text-slate-500">Total komisi</p></div>
        </div>

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
        <p className="text-xs text-slate-400">Komisi dibayarkan oleh admin sesuai kesepakatan. Data pembeli tidak ditampilkan demi privasi.</p>
      </main>
    </div>
  );
}
