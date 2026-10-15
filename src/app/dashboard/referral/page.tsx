import { Crown, Lock, Percent, Wallet } from "lucide-react";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";
import { requireUser } from "@/lib/auth";
import { getReferralDefaults } from "@/lib/billing";
import { createAdminClient } from "@/lib/supabase/admin";
import { siteUrl } from "@/lib/util";
import { ensureReferral } from "@/lib/referral";
import PayoutForm from "./PayoutForm";

export const metadata = { title: "Referral" };

const rp = (n: number) => `Rp${n.toLocaleString("id-ID")}`;
const date = (s: string) => new Date(s).toLocaleDateString("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" });

/** Samarkan identitas pembeli: "Budi S." dan "bu***@gmail.com". */
function who(p: { full_name: string | null; email: string | null } | null) {
  const parts = (p?.full_name ?? "").trim().split(/\s+/).filter(Boolean);
  const name = parts.length ? `${parts[0]}${parts[1] ? ` ${parts[1][0]}.` : ""}` : "";
  const [u, dom] = (p?.email ?? "").split("@");
  const mail = u && dom ? `${u.slice(0, 2)}***@${dom}` : "";
  return (
    <div>
      <p className="font-medium">{name || mail || "Pengguna"}</p>
      {name && mail && <p className="text-xs text-slate-500">{mail}</p>}
    </div>
  );
}

export default async function ReferralPage() {
  const { profile, isPro } = await requireUser();
  const admin = createAdminClient();
  const [d, v] = await Promise.all([getReferralDefaults(admin), ensureReferral(admin, profile)]);
  const { data: orders } = v
    ? await admin.from("orders").select("plan, amount, commission_amount, status, created_at, paid_at, profiles(full_name, email)").eq("voucher_id", v.id).in("status", ["paid", "pending"]).order("created_at", { ascending: false }).limit(200)
    : { data: [] };
  const rows = (orders ?? []) as unknown as { plan: string; amount: number; commission_amount: number; status: string; created_at: string; paid_at: string | null; profiles: { full_name: string | null; email: string | null } | null }[];
  const paidRows = rows.filter((o) => o.status === "paid");
  const earned = paidRows.reduce((a, o) => a + o.commission_amount, 0);
  // Non-Pro: kode asli tidak dikirim ke browser (hanya placeholder yang diburamkan).
  const code = isPro ? v?.code ?? "" : "XXXXXXXX";
  const link = v ? `${siteUrl()}/?ref=${isPro ? v.code : "XXXXXXXX"}` : "";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Referral</h1>
        <p className="text-sm text-slate-500">Ajak orang lain memakai SertifikatKu Pro dan dapatkan komisi dari jumlah yang dibayarkan pembeli. Contoh: pembeli membayar Rp374.250 dengan komisi 50% → Anda mendapat Rp187.125.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="card !p-4 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><Percent className="h-5 w-5" /></span><div><p className="text-xl font-bold">{d.discount_percent}%</p><p className="text-xs text-slate-500">Diskon untuk pembeli</p></div></div>
        <div className="card !p-4 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-700"><Wallet className="h-5 w-5" /></span><div><p className="text-xl font-bold">{d.commission_percent}%</p><p className="text-xs text-slate-500">Komisi untuk Anda, dari jumlah yang dibayar pembeli</p></div></div>
      </div>

      {!v ? (
        <p className="card text-sm text-slate-600">Kode referral belum bisa dibuat. Muat ulang halaman ini.</p>
      ) : (
        <>
          <div className="card relative overflow-hidden">
            <div className={isPro ? "" : "pointer-events-none select-none blur-sm"} aria-hidden={!isPro}>
              <p className="text-sm text-slate-500">Kode referral Anda</p>
              <p className="mt-1 font-mono text-3xl font-bold tracking-wide">{code}</p>
              {isPro && !v.active && <p className="mt-2 text-sm text-red-600">Kode ini sedang dinonaktifkan.</p>}
              <p className="mt-2 text-sm text-slate-600">Pembeli yang memakai kode ini mendapat diskon <b>{d.discount_percent}%</b>, dan Anda mendapat komisi <b>{d.commission_percent}%</b> dari jumlah yang mereka bayar (setelah diskon).</p>
              <p className="mt-4 text-xs text-slate-500">Bagikan link ini (kode terisi otomatis saat pembeli upgrade):</p>
              <p className="mt-1 break-all rounded-lg bg-slate-50 p-2 font-mono text-xs">{link}</p>
              {isPro && <div className="mt-2 flex gap-2"><CopyButton text={link} label="Salin link" /><CopyButton text={code} label="Salin kode" /></div>}
            </div>
            {!isPro && (
              <div className="absolute inset-0 grid place-items-center bg-white/40 p-4 text-center">
                <div>
                  <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-amber-100 text-amber-700"><Lock className="h-5 w-5" /></span>
                  <p className="mt-2 font-semibold text-slate-900">Khusus pengguna Pro</p>
                  <p className="mx-auto mt-1 max-w-xs text-sm text-slate-600">Upgrade ke Pro untuk membuka kode dan link referral Anda. Kode berhenti berlaku bila paket Pro berakhir.</p>
                  <Link href="/dashboard/upgrade" className="btn btn-primary btn-sm mt-3"><Crown className="h-4 w-4" /> Upgrade ke Pro</Link>
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="card !p-4"><p className="text-2xl font-bold">{paidRows.length}</p><p className="text-xs text-slate-500">Pembayaran berhasil</p></div>
            <div className="card !p-4"><p className="text-2xl font-bold">{rp(earned)}</p><p className="text-xs text-slate-500">Total komisi</p></div>
          </div>

          <div className="card"><PayoutForm defaultValue={v.payout_info ?? ""} /><p className="mt-2 text-xs text-slate-500">Komisi dicairkan oleh admin ke rekening di atas.</p></div>

          <div>
            <h2 className="mb-2 text-lg font-semibold">Dipakai oleh</h2>
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-3 py-2">Pengguna</th><th className="px-3 py-2">Tanggal</th><th className="px-3 py-2">Paket</th><th className="px-3 py-2 text-right">Dibayar</th><th className="px-3 py-2 text-right">Komisi</th><th className="px-3 py-2">Status</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.length === 0 && <tr><td colSpan={6} className="px-3 py-6 text-center text-slate-500">Belum ada yang memakai kode Anda.</td></tr>}
                  {rows.map((o, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2">{who(o.profiles)}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-slate-600">{date(o.paid_at ?? o.created_at)}</td>
                      <td className="px-3 py-2">{o.plan === "yearly" ? "Pro Tahunan" : "Pro Bulanan"}</td>
                      <td className="px-3 py-2 text-right">{rp(o.amount)}</td>
                      <td className="px-3 py-2 text-right font-medium">{o.status === "paid" ? rp(o.commission_amount) : "—"}</td>
                      <td className="px-3 py-2"><span className={`badge ${o.status === "paid" ? "badge-ok" : "badge-warn"}`}>{o.status === "paid" ? "Lunas" : "Menunggu bayar"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-slate-500">Nama pengguna disamarkan demi privasi.</p>
          </div>
        </>
      )}
    </div>
  );
}
