"use client";

import { ArrowRight, BadgePercent, Check, Crown, Loader2, Lock, ShieldCheck, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { checkVoucher, startCheckout, type VoucherCheck } from "./actions";
import { openPayment, preloadSnap } from "@/lib/snap-client";

type PlanKey = "monthly" | "yearly";
type Pricing = Record<PlanKey, { list: number; price: number }>;
const rp = (n: number) => `Rp${n.toLocaleString("id-ID")}`;
const LABEL: Record<PlanKey, [string, string]> = { monthly: ["Pro Bulanan", "1 bulan"], yearly: ["Pro Tahunan", "12 bulan"] };

/** Ringkasan pesanan: ganti paket, pakai voucher, lihat total, lalu bayar lewat Midtrans. */
export default function OrderSummary({ pricing, configured, initialPlan, initialCode = "", proUntil, closedMessage = null, pendingOrders = 0 }: { pricing: Pricing; configured: boolean; initialPlan: PlanKey; initialCode?: string; proUntil: string | null; closedMessage?: string | null; pendingOrders?: number }) {
  const [plan, setPlan] = useState<PlanKey>(initialPlan);
  const [code, setCode] = useState(initialCode);
  const [v, setV] = useState<VoucherCheck | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [vErr, setVErr] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [checking, startCheck] = useTransition();

  const applied = v?.code && !v.error ? v : null;
  const base = pricing[plan].price;
  const total = applied?.prices?.[plan] ?? base;
  const discount = Math.max(0, base - total);

  function apply(c = code) {
    if (!c.trim()) return;
    setVErr(null);
    startCheck(async () => {
      const r = await checkVoucher(c);
      if (r.error) {
        setV(null);
        setVErr(r.error);
      } else setV(r);
    });
  }
  // Kode dari link referral langsung dicoba; skrip popup Midtrans disiapkan di latar.
  useEffect(() => {
    preloadSnap();
    if (initialCode) apply(initialCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function pay() {
    setErr(null);
    setPaying(true);
    const r = await startCheckout(plan, applied?.code ?? "");
    if (r.error || !r.url) {
      setPaying(false);
      return setErr(r.error ?? "Gagal memulai pembayaran");
    }
    // Tombol tetap "memproses" sampai pembeli dibawa ke halaman Berlangganan (mencegah pesanan ganda).
    await openPayment(r.url, r.orderId);
  }

  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_380px]">
      <div className="space-y-5">
        {pendingOrders > 0 && (
          <a href="/dashboard/upgrade" className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 hover:bg-amber-100/60">
            <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
            <span>Anda masih punya <b>{pendingOrders} pesanan menunggu pembayaran</b>. Agar tidak dobel, lanjutkan atau batalkan dulu di halaman <b className="underline">Berlangganan</b>.</span>
          </a>
        )}
        <section className="card">
          <h2 className="font-semibold text-navy">1. Paket</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {(["monthly", "yearly"] as PlanKey[]).map((k) => {
              const on = plan === k;
              return (
                <button key={k} type="button" onClick={() => setPlan(k)} className={`relative rounded-xl border-2 p-4 text-left transition ${on ? "border-brand-700 bg-brand-50/60" : "border-slate-200 bg-white hover:border-brand-300"}`}>
                  <span className={`absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full border-2 ${on ? "border-brand-700 bg-brand-700 text-white" : "border-slate-300"}`}>{on && <Check className="h-3 w-3" strokeWidth={3} />}</span>
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-navy"><Crown className={`h-4 w-4 ${k === "yearly" ? "text-amber-500" : "text-brand-600"}`} /> {LABEL[k][0]}</p>
                  <p className="mt-1.5 text-xl font-bold text-navy">{rp(pricing[k].price)}</p>
                  <p className="text-xs text-slate-500">{k === "yearly" ? `Setara ${rp(Math.round(pricing.yearly.price / 12))}/bulan` : "Per bulan"}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="card">
          <h2 className="flex items-center gap-2 font-semibold text-navy">2. Kode voucher <span className="text-xs font-normal text-slate-400">(opsional)</span></h2>
          <div className="mt-3 flex gap-2">
            <div className="relative flex-1">
              <BadgePercent className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-600" />
              <input className="input pl-9 uppercase" placeholder="Masukkan kode" value={code} maxLength={32} onChange={(e) => { setCode(e.target.value); if (v) setV(null); setVErr(null); }} onKeyDown={(e) => e.key === "Enter" && apply()} />
            </div>
            <button className="btn shrink-0" disabled={!code.trim() || checking} onClick={() => apply()}>{checking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Pakai"}</button>
          </div>
          {vErr && <p className="mt-2 text-sm text-red-600">{vErr}</p>}
          {applied && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-emerald-700">
              <Check className="h-4 w-4" /> Voucher <b>{applied.code}</b> dipakai{applied.percent ? ` — diskon ${applied.percent}%` : ""}.
              <button className="ml-1 text-slate-400 hover:text-slate-700" aria-label="Lepas voucher" onClick={() => { setV(null); setCode(""); }}><X className="h-4 w-4" /></button>
            </p>
          )}
        </section>
      </div>

      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-900 to-navy p-6 text-white shadow-xl shadow-brand-900/20 ring-1 ring-amber-400/25">
          <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full border border-white/10" />
          <h2 className="relative font-semibold">Ringkasan pesanan</h2>
          <dl className="relative mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-brand-100">{LABEL[plan][0]} · {LABEL[plan][1]}</dt><dd>{rp(base)}</dd></div>
            {discount > 0 && <div className="flex justify-between gap-3"><dt className="text-brand-100">Diskon voucher {applied?.code}</dt><dd className="text-emerald-300">−{rp(discount)}</dd></div>}
            {proUntil && <div className="text-xs text-brand-200">Pro Anda berlaku hingga {new Date(proUntil).toLocaleDateString("id-ID", { dateStyle: "long", timeZone: "Asia/Jakarta" })}; masa aktif baru ditambahkan setelahnya.</div>}
          </dl>
          <div className="relative mt-4 flex items-end justify-between border-t border-white/15 pt-4">
            <span className="text-sm text-brand-100">Total bayar</span>
            <span className="text-3xl font-bold tracking-tight text-amber-400">{rp(total)}</span>
          </div>
          {err && <p className="relative mt-3 rounded-lg bg-red-500/15 p-2.5 text-sm text-red-100">{err}</p>}
          <button onClick={pay} disabled={!configured || paying || !!closedMessage} className="relative mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-navy shadow-lg shadow-black/20 transition hover:bg-amber-300 disabled:opacity-60">
            {paying ? <><Loader2 className="h-4 w-4 animate-spin" /> Membuka pembayaran…</> : total <= 0 ? <>Aktifkan Pro <ArrowRight className="h-4 w-4" /></> : <><Lock className="h-4 w-4" /> Bayar sekarang</>}
          </button>
          {closedMessage && <p className="relative mt-2 text-center text-xs text-amber-200">{closedMessage}</p>}
          {!configured && <p className="relative mt-2 text-center text-xs text-brand-200">Pembayaran online belum aktif. Hubungi admin.</p>}
          <div className="relative mt-4 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-brand-100">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" /> Aman via Midtrans ·
            {["QRIS", "VA", "E-wallet"].map((m) => <span key={m} className="rounded bg-white/10 px-1.5 py-0.5">{m}</span>)}
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-slate-500">Pro aktif otomatis setelah pembayaran berhasil dan invoice dikirim ke email Anda.</p>
      </aside>
    </div>
  );
}
