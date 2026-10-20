"use client";

import { ArrowRight, BadgePercent, Check, Crown, Loader2, ShieldCheck, X } from "lucide-react";
import { useState, useTransition } from "react";
import { checkVoucher, startCheckout, type VoucherCheck } from "./actions";

type Plans = { monthly: number; yearly: number };
type Pricing = Record<"monthly" | "yearly", { list: number; price: number }>;
const rp = (n: number) => `Rp${n.toLocaleString("id-ID")}`;

export default function Checkout({ pricing, configured, initialCode = "" }: { pricing: Pricing; configured: boolean; initialCode?: string }) {
  const prices: Plans = { monthly: pricing.monthly.price, yearly: pricing.yearly.price };
  const saving = Math.max(0, pricing.monthly.price * 12 - pricing.yearly.price);
  const [code, setCode] = useState(initialCode);
  const [v, setV] = useState<VoucherCheck | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [checking, startCheck] = useTransition();

  const applied = v?.code && !v.error ? v : null;
  const price = (k: keyof Plans) => applied?.prices?.[k] ?? prices[k];

  function apply() {
    setErr(null);
    startCheck(async () => {
      const r = await checkVoucher(code);
      if (r.error) {
        setV(null);
        setErr(r.error);
      } else setV(r);
    });
  }

  async function pay(plan: "monthly" | "yearly") {
    setErr(null);
    setBusy(plan);
    const r = await startCheckout(plan, applied?.code ?? "");
    if (r.error || !r.url) {
      setBusy(null);
      return setErr(r.error ?? "Gagal memulai pembayaran");
    }
    window.location.href = r.url;
  }

  const PERKS = ["Program & peserta tanpa batas", "42 template (termasuk 22 bertema)", "Desain sendiri hingga 50 desain", "Program referral dengan komisi"];

  const Card = ({ k, title, unit, note, featured, badge }: { k: "monthly" | "yearly"; title: string; unit: string; note: string; featured?: boolean; badge?: string }) => {
    const disc = pricing[k].list > price(k) ? Math.round((1 - price(k) / pricing[k].list) * 100) : 0;
    return (
      <div className={`relative flex flex-col overflow-hidden rounded-2xl p-6 ${featured ? "order-first md:order-none bg-gradient-to-br from-brand-700 via-brand-900 to-navy text-white shadow-xl shadow-brand-900/20 ring-1 ring-amber-400/30" : "border border-slate-200 bg-white shadow-sm"}`}>
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
          <span className="text-4xl font-bold tracking-tight">{rp(price(k))}</span>
          <span className={`pb-1 text-sm ${featured ? "text-brand-200" : "text-slate-500"}`}>/ {unit}</span>
        </div>
        <div className="relative mt-1 flex min-h-[22px] flex-wrap items-center gap-2 text-sm">
          {disc > 0 && <span className={`line-through ${featured ? "text-brand-300" : "text-slate-400"}`}>{rp(pricing[k].list)}</span>}
          {disc > 0 && <span className={`rounded-md px-1.5 py-0.5 text-xs font-semibold ${featured ? "bg-emerald-400/15 text-emerald-200" : "bg-emerald-50 text-emerald-700"}`}>Hemat {disc}%</span>}
        </div>
        <p className={`relative mt-2 text-sm ${featured ? "text-brand-100" : "text-slate-600"}`}>{note}</p>
        <ul className={`relative mt-5 flex-1 space-y-2.5 border-t pt-5 text-sm ${featured ? "border-white/10" : "border-slate-100"}`}>
          {PERKS.map((t) => (
            <li key={t} className="flex items-start gap-2.5">
              <span className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full ${featured ? "bg-amber-400 text-navy" : "bg-emerald-50 text-emerald-600"}`}><Check className="h-3 w-3" strokeWidth={3} /></span>
              <span className={featured ? "text-white/90" : "text-slate-700"}>{t}</span>
            </li>
          ))}
        </ul>
        <button
          className={`relative mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition disabled:opacity-60 ${featured ? "bg-amber-400 text-navy shadow-lg shadow-black/20 hover:bg-amber-300" : "border border-brand-900 bg-white text-navy hover:bg-brand-50"}`}
          disabled={!configured || busy !== null}
          onClick={() => pay(k)}
        >
          {busy === k ? <><Loader2 className="h-4 w-4 animate-spin" /> Mengalihkan ke pembayaran…</> : <>Pilih {unit === "bulan" ? "Bulanan" : "Tahunan"} <ArrowRight className="h-4 w-4" /></>}
        </button>
      </div>
    );
  };

  return (
    <div className="mt-8">
      {err && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{err}</p>}
      <div className="grid gap-5 md:grid-cols-2">
        <Card k="monthly" title="Pro Bulanan" unit="bulan" note="Fleksibel untuk acara sesekali. Perpanjang kapan saja." />
        <Card k="yearly" title="Pro Tahunan" unit="tahun" note={`Setara ${rp(Math.round(price("yearly") / 12))} per bulan, untuk penyelenggara rutin.`} featured badge={saving > 0 ? `Hemat ${rp(saving)}` : "Paling hemat"} />
      </div>

      <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white/70 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label htmlFor="voucher" className="flex shrink-0 items-center gap-2 text-sm font-medium text-slate-700"><BadgePercent className="h-4 w-4 text-amber-600" /> Punya kode voucher?</label>
          <div className="flex flex-1 gap-2">
            <input id="voucher" className="input uppercase" placeholder="Masukkan kode" value={code} maxLength={32} onChange={(e) => { setCode(e.target.value); if (v) setV(null); }} onKeyDown={(e) => e.key === "Enter" && code.trim() && apply()} />
            <button className="btn shrink-0" disabled={!code.trim() || checking} onClick={apply}>{checking ? "Memeriksa…" : "Pakai"}</button>
          </div>
        </div>
        {applied && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-emerald-700">
            <Check className="h-4 w-4" /> Voucher <b>{applied.code}</b> dipakai{applied.percent ? ` — diskon ${applied.percent}%` : ""}. Harga di atas sudah disesuaikan.
            <button className="ml-1 text-slate-400 hover:text-slate-700" aria-label="Lepas voucher" onClick={() => { setV(null); setCode(""); }}><X className="h-4 w-4" /></button>
          </p>
        )}
      </div>

      {!configured && <p className="mt-3 text-center text-xs text-slate-500">Pembayaran online belum aktif. Hubungi admin untuk mengaktifkan paket Pro.</p>}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5 font-medium text-slate-600"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Pembayaran aman via Midtrans</span>
        {["QRIS", "Virtual Account", "E-wallet", "Kartu"].map((m) => <span key={m} className="rounded-md border border-slate-200 bg-white px-2 py-0.5 font-medium text-slate-600">{m}</span>)}
        <span>· Pro aktif otomatis setelah bayar</span>
      </div>
    </div>
  );
}
