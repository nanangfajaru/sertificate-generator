import { ArrowRight, Check, Crown, Lock } from "lucide-react";
import Link from "next/link";

type Pricing = Record<"monthly" | "yearly", { list: number; price: number }>;
const rp = (n: number) => `Rp${n.toLocaleString("id-ID")}`;
const PERKS = ["Program & peserta tanpa batas", "42 template (termasuk 22 bertema)", "Desain sendiri hingga 50 desain", "Program referral dengan komisi"];

/** Dua kartu paket; tombol menuju ringkasan pesanan (voucher & pembayaran di langkah berikutnya). */
export default function PlanCards({ pricing, closed = false }: { pricing: Pricing; closed?: boolean }) {
  const saving = Math.max(0, pricing.monthly.price * 12 - pricing.yearly.price);
  const Card = ({ k, title, unit, note, featured, badge }: { k: "monthly" | "yearly"; title: string; unit: string; note: string; featured?: boolean; badge?: string }) => {
    const { price, list } = pricing[k];
    const disc = list > price ? Math.round((1 - price / list) * 100) : 0;
    return (
      <div className={`relative flex flex-col overflow-hidden rounded-2xl p-6 ${featured ? "order-first bg-gradient-to-br from-brand-700 via-brand-900 to-navy text-white shadow-xl shadow-brand-900/20 ring-1 ring-amber-400/30 md:order-none" : "border border-slate-200 bg-white shadow-sm"}`}>
        {featured && <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full border border-white/10" />}
        {featured && <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/70 to-transparent" />}
        <div className="relative flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className={`grid h-9 w-9 place-items-center rounded-xl ${featured ? "bg-amber-400 text-navy" : "bg-brand-50 text-brand-700"}`}><Crown className="h-[18px] w-[18px]" /></span>
            <p className={`font-semibold ${featured ? "text-white" : "text-navy"}`}>{title}</p>
          </div>
          {badge && <span className="rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-bold text-navy">{badge}</span>}
        </div>
        <div className="relative mt-5 flex items-end gap-1.5">
          <span className="text-4xl font-bold tracking-tight">{rp(price)}</span>
          <span className={`pb-1 text-sm ${featured ? "text-brand-200" : "text-slate-500"}`}>/ {unit}</span>
        </div>
        <div className="relative mt-1 flex min-h-[22px] flex-wrap items-center gap-2 text-sm">
          {disc > 0 && <span className={`line-through ${featured ? "text-brand-300" : "text-slate-400"}`}>{rp(list)}</span>}
          {disc > 0 && <span className={`rounded-md px-1.5 py-0.5 text-xs font-semibold ${featured ? "bg-emerald-400/15 text-emerald-200" : "bg-emerald-50 text-emerald-700"}`}>Hemat {disc}%</span>}
        </div>
        <p className={`relative mt-2 text-sm ${featured ? "text-brand-100" : "text-slate-600"}`}>{note}</p>
        <ul className={`relative mt-5 flex-1 space-y-2.5 border-t pt-5 text-sm ${featured ? "border-white/10" : "border-slate-100"}`}>
          {PERKS.map((t) => (
            <li key={t} className="flex items-start gap-2.5">
              <span className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full ${featured ? "bg-amber-400 text-navy" : "bg-brand-100 text-brand-700"}`}><Check className="h-3 w-3" strokeWidth={3} /></span>
              <span className={featured ? "text-white/90" : "text-slate-700"}>{t}</span>
            </li>
          ))}
        </ul>
        {closed ? (
          <span className={`relative mt-6 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${featured ? "bg-white/10 text-white/60" : "bg-slate-100 text-slate-400"}`}>
            <Lock className="h-4 w-4" /> Pembelian ditutup sementara
          </span>
        ) : (
          <Link
            href={`/dashboard/upgrade/bayar?plan=${k}`}
            className={`relative mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${featured ? "bg-amber-400 text-navy shadow-lg shadow-black/20 hover:bg-amber-300" : "bg-gradient-to-b from-brand-600 to-brand-900 text-white shadow-md shadow-brand-900/20 hover:from-brand-500 hover:to-brand-800"}`}
          >
            Pilih {unit === "bulan" ? "Bulanan" : "Tahunan"} <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    );
  };
  return (
    <div className="mt-8 grid gap-5 md:grid-cols-2">
      <Card k="monthly" title="Pro Bulanan" unit="bulan" note="Fleksibel untuk acara sesekali. Perpanjang kapan saja." />
      <Card k="yearly" title="Pro Tahunan" unit="tahun" note={`Setara ${rp(Math.round(pricing.yearly.price / 12))} per bulan, untuk penyelenggara rutin.`} featured badge={saving > 0 ? `Hemat ${rp(saving)}` : "Paling hemat"} />
    </div>
  );
}
