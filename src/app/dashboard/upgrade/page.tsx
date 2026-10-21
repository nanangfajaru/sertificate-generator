import Link from "next/link";
import { Crown, Receipt, Sparkles } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { applyMidtransStatus, fetchTransactionStatus, midtransConfigured } from "@/lib/billing";
import { createAdminClient } from "@/lib/supabase/admin";
import OrderHistory, { type HistoryRow } from "./OrderHistory";
import PendingWatcher from "./PendingWatcher";

export const metadata = { title: "Berlangganan" };

const tgl = (s: string) => new Date(s).toLocaleDateString("id-ID", { dateStyle: "long", timeZone: "Asia/Jakarta" });

/** Berlangganan: status paket + riwayat pembelian. Pilihan paket ada di /dashboard/upgrade/paket. */
export default async function SubscriptionPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  const { isPro, profile } = await requireUser();
  const admin = createAdminClient();

  // Kembali dari Midtrans: sinkronkan status pesanan (jika webhook belum sempat masuk).
  let orderStatus: string | null = null;
  if (order && /^[A-Z0-9-]{6,40}$/.test(order)) {
    const { data: o } = await admin.from("orders").select("status, user_id").eq("order_id", order).maybeSingle();
    if (o && o.user_id === profile.id) {
      orderStatus = o.status;
      if (o.status === "pending" && midtransConfigured()) {
        const st = await fetchTransactionStatus(order);
        if (st) orderStatus = (await applyMidtransStatus(admin, st)) ?? o.status;
      }
    }
  }
  // Dibaca setelah sinkronisasi agar status & masa aktif Pro sudah terbaru.
  const [{ data: p }, { data: rows }] = await Promise.all([
    admin.from("profiles").select("plan, plan_expires_at").eq("id", profile.id).maybeSingle(),
    admin.from("orders").select("order_id, plan, base_amount, discount_amount, amount, voucher_code, status, payment_url, payment_method, payment_info, paid_at, created_at, period_start, period_end").eq("user_id", profile.id).order("created_at", { ascending: false }).limit(50),
  ]);
  const until = p?.plan_expires_at ?? null;
  const proNow = orderStatus === "paid" || (p?.plan === "pro" && (!until || new Date(until) > new Date())) || isPro;
  const history = (rows ?? []) as HistoryRow[];

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold tracking-tight">Berlangganan</h1>
      <p className="mt-1 text-sm text-slate-500">Status paket Anda dan riwayat pembelian.</p>

      {orderStatus === "paid" && <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><b>Pembayaran berhasil.</b> Paket Pro Anda sudah aktif. Terima kasih! Invoice juga dikirim ke email Anda.</p>}
      {orderStatus === "pending" && <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><b>Pesanan tersimpan dan menunggu pembayaran.</b> Selesaikan lewat tombol <b>Lanjutkan bayar</b> di riwayat di bawah (atau Ganti metode / Batalkan). Jika sudah membayar, status diperbarui otomatis dalam beberapa saat.</p>}
      {(orderStatus === "failed" || orderStatus === "expired") && <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">Pembayaran tidak berhasil atau sudah kedaluwarsa. Silakan coba lagi.</p>}

      {/* HP: ikon + teks di atas, tombol selebar kartu di bawah; layar lebar: satu baris. */}
      {proNow ? (
        <div className="relative mt-5 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-900 to-navy p-5 text-white shadow-md ring-1 ring-amber-400/25">
          <div className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full border border-white/10" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-3.5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-400 text-navy"><Crown className="h-5 w-5" /></span>
              <div className="min-w-0">
                <p className="font-semibold">Paket Pro aktif</p>
                <p className="mt-0.5 text-sm text-brand-100">{until ? `Berlaku hingga ${tgl(until)}` : "Tanpa batas waktu"}</p>
              </div>
            </div>
            {until && <Link href="/dashboard/upgrade/paket" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-navy shadow-md shadow-black/20 hover:bg-amber-300 sm:w-auto"><Sparkles className="h-4 w-4" /> Perpanjang Pro</Link>}
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-3.5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700"><Crown className="h-5 w-5" /></span>
              <div className="min-w-0">
                <p className="font-semibold text-navy">Paket Free</p>
                <p className="mt-0.5 text-sm text-slate-500">{until ? `Paket Pro Anda berakhir pada ${tgl(until)}.` : "Upgrade untuk program & peserta tanpa batas, template bertema, dan desain sendiri."}</p>
              </div>
            </div>
            <Link href="/dashboard/upgrade/paket" className="btn btn-primary w-full justify-center py-2.5 sm:w-auto"><Sparkles className="h-4 w-4" /> {until ? "Perpanjang Pro" : "Upgrade ke Pro"}</Link>
          </div>
        </div>
      )}

      <h2 className="mb-3 mt-8 flex items-center gap-2 text-lg font-semibold"><Receipt className="h-5 w-5 text-brand-600" /> Riwayat pembelian</h2>
      <OrderHistory rows={history} />
      {history.some((r) => r.status === "pending") && (
        <PendingWatcher initialKey={history.slice(0, 20).map((r) => `${r.order_id}:${r.status}:${r.payment_method ?? ""}`).join("|")} />
      )}
    </div>
  );
}
