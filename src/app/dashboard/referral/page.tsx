import { BadgeCheck, Coins, Crown, Lock, Percent, Wallet } from "lucide-react";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";
import { requireUser } from "@/lib/auth";
import { PLANS, getPricing, getReferralDefaults, priceWith, type PlanKey } from "@/lib/billing";
import { createAdminClient } from "@/lib/supabase/admin";
import { siteUrl } from "@/lib/util";
import { getReferral } from "@/lib/referral";
import CreateButton from "./CreateButton";
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
  const canCreate = isPro || profile.is_admin;
  const admin = createAdminClient();
  const [d, v, pricing] = await Promise.all([getReferralDefaults(admin), getReferral(admin, profile.id), getPricing(admin)]);
  const examples = (["monthly", "yearly"] as PlanKey[]).map((k) => ({ label: PLANS[k].label, ...priceWith(k, pricing, d) }));
  const { data: orders } = v
    ? await admin.from("orders").select("plan, amount, commission_amount, status, created_at, paid_at, profiles(full_name, email)").eq("voucher_id", v.id).in("status", ["paid", "pending"]).order("created_at", { ascending: false }).limit(200)
    : { data: [] };
  const rows = (orders ?? []) as unknown as { plan: string; amount: number; commission_amount: number; status: string; created_at: string; paid_at: string | null; profiles: { full_name: string | null; email: string | null } | null }[];
  const paidRows = rows.filter((o) => o.status === "paid");
  const earned = paidRows.reduce((a, o) => a + o.commission_amount, 0);
  // Non-Pro: kode asli tidak dikirim ke browser (hanya placeholder yang diburamkan).
  const code = isPro && v ? v.code : "XXXXXXXX";
  const link = `${siteUrl()}/?ref=${code}`;

  const stat = (icon: React.ReactNode, tone: string, value: string, label: string) => (
    <div className="card !p-3 flex items-center gap-2.5 sm:!p-4 sm:gap-3 lg:flex-col lg:items-start xl:flex-row xl:items-center">
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl sm:h-10 sm:w-10 ${tone}`}>{icon}</span>
      <div className="min-w-0"><p className="truncate text-lg font-bold sm:text-xl">{value}</p><p className="text-xs leading-snug text-slate-500">{label}</p></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">Referral</h1>
        <p className="text-sm text-slate-500">Ajak orang lain memakai SertifikatKu Pro dan dapatkan komisi dari jumlah yang dibayarkan pembeli.</p>
      </div>

      {(
        <div className="grid items-start gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {canCreate && !v ? (
              <div className="card">
                <p className="font-semibold">Aktifkan referral Anda</p>
                <p className="mt-1 mb-4 text-sm text-slate-600">Buat kode referral pribadi. Pembeli yang memakainya mendapat diskon <b>{d.discount_percent}%</b>, dan Anda mendapat komisi <b>{d.commission_percent}%</b> dari jumlah yang mereka bayar.</p>
                <CreateButton />
              </div>
            ) : (
            <div className="card relative overflow-hidden">
              <div className={isPro ? "" : "pointer-events-none select-none blur-sm"} aria-hidden={!isPro}>
                <p className="text-sm text-slate-500">Kode referral Anda</p>
                <p className="mt-1 break-all font-mono text-2xl font-bold tracking-wide sm:text-3xl">{code}</p>
                {isPro && v && !v.active && <p className="mt-2 text-sm text-red-600">Kode ini sedang dinonaktifkan.</p>}
                <p className="mt-2 text-sm text-slate-600">Pembeli yang memakai kode ini mendapat diskon <b>{d.discount_percent}%</b>, dan Anda mendapat komisi <b>{d.commission_percent}%</b> dari jumlah yang mereka bayar (setelah diskon).</p>
                <p className="mt-4 text-xs text-slate-500">Bagikan link ini (kode terisi otomatis saat pembeli upgrade):</p>
                <p className="mt-1 break-all rounded-lg bg-slate-50 p-2 font-mono text-xs">{link}</p>
                {isPro && <div className="mt-2 flex flex-wrap gap-2"><CopyButton text={link} label="Salin link" /><CopyButton text={code} label="Salin kode" /></div>}
              </div>
              {!isPro && (
                <div className="absolute inset-0 grid place-items-center bg-white/40 p-4 text-center">
                  <div>
                    <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-amber-100 text-amber-700"><Lock className="h-5 w-5" /></span>
                    <p className="mt-2 font-semibold text-slate-900">Khusus pengguna Pro</p>
                    <p className="mx-auto mt-1 max-w-sm text-sm text-slate-600">Upgrade ke Pro untuk membuka kode dan link referral Anda. Kode berhenti berlaku bila paket Pro berakhir.</p>
                    <Link href="/dashboard/upgrade" className="btn btn-primary btn-sm mt-3"><Crown className="h-4 w-4" /> Upgrade ke Pro</Link>
                  </div>
                </div>
              )}
            </div>
            )}

            <div>
              <h2 className="mb-2 text-lg font-semibold">Dipakai oleh</h2>
              <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white sm:hidden">
                {rows.length === 0 && <li className="px-3 py-8 text-center text-sm text-slate-500">Belum ada yang memakai kode Anda.</li>}
                {rows.map((o, i) => (
                  <li key={i} className="flex items-start justify-between gap-3 p-3 text-sm">
                    <div className="min-w-0">
                      {who(o.profiles)}
                      <p className="mt-1 text-xs text-slate-500">{o.plan === "yearly" ? "Pro Tahunan" : "Pro Bulanan"} · {date(o.paid_at ?? o.created_at)}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-semibold text-emerald-700">{o.status === "paid" ? rp(o.commission_amount) : "—"}</p>
                      <p className="text-xs text-slate-500">dari {rp(o.amount)}</p>
                      <span className={`badge mt-1 ${o.status === "paid" ? "badge-ok" : "badge-warn"}`}>{o.status === "paid" ? "Lunas" : "Menunggu bayar"}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white sm:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-3 py-2">Pengguna</th><th className="px-3 py-2">Tanggal</th><th className="px-3 py-2">Paket</th><th className="px-3 py-2 text-right">Dibayar</th><th className="px-3 py-2 text-right">Komisi</th><th className="px-3 py-2">Status</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.length === 0 && <tr><td colSpan={6} className="px-3 py-8 text-center text-slate-500">Belum ada yang memakai kode Anda.</td></tr>}
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
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {stat(<Percent className="h-5 w-5" />, "bg-emerald-50 text-emerald-700", `${d.discount_percent}%`, "Diskon untuk pembeli")}
              {stat(<Wallet className="h-5 w-5" />, "bg-amber-50 text-amber-700", `${d.commission_percent}%`, "Komisi untuk Anda")}
              {stat(<BadgeCheck className="h-5 w-5" />, "bg-brand-50 text-brand-700", String(paidRows.length), "Pembayaran berhasil")}
              {stat(<Coins className="h-5 w-5" />, "bg-sky-50 text-sky-700", rp(earned), "Total komisi")}
            </div>

            <div className="card">
              <h2 className="font-semibold">Simulasi komisi</h2>
              <p className="mt-0.5 text-xs text-slate-500">Dihitung dari jumlah yang dibayar pembeli (setelah diskon).</p>
              <ul className="mt-3 space-y-3 text-sm text-slate-600">
                {examples.map((e) => (
                  <li key={e.label} className="rounded-lg bg-slate-50 p-3">
                    <p className="font-medium text-slate-800">{e.label}</p>
                    <p className="mt-1">{rp(e.base)} − diskon {d.discount_percent}% ({rp(e.discount)}) → pembeli bayar <b>{rp(e.amount)}</b></p>
                    <p>Komisi {d.commission_percent}% = <b className="text-emerald-700">{rp(e.commission)}</b></p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card">{v ? <><PayoutForm defaultValue={v.payout_info ?? ""} /><p className="mt-2 text-xs text-slate-500">Komisi dicairkan oleh admin ke rekening di atas.</p></> : <p className="text-sm text-slate-500">Rekening pencairan komisi bisa diisi setelah kode referral dibuat.</p>}</div>
          </div>
        </div>
      )}
    </div>
  );
}
