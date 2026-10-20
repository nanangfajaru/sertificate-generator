import { cookies } from "next/headers";
import Link from "next/link";
import { Check, Clock, Crown, Minus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { applyMidtransStatus, getPricing, fetchTransactionStatus, midtransConfigured } from "@/lib/billing";
import { createAdminClient } from "@/lib/supabase/admin";
import Checkout from "./Checkout";
import { FREE_PARTICIPANT_LIMIT, FREE_PROGRAM_LIMIT } from "@/lib/db";

export const metadata = { title: "Berlangganan" };


type Row = [feature: string, free: string | boolean, pro: string | boolean];
const ROWS: Row[] = [
  ["Jumlah program / kegiatan", `${FREE_PROGRAM_LIMIT} program`, "Tanpa batas"],
  ["Peserta per program", `${FREE_PARTICIPANT_LIMIT} peserta`, "Tanpa batas"],
  ["Template sertifikat", "20 template dasar", "20 dasar + 22 bertema (bunga, rumah sakit, olahraga, perusahaan, dll)"],
  ["Desain sendiri (unggah PDF/PNG/JPG)", "Boleh membuat & mengedit hingga 5, tidak bisa dipakai", "Hingga 50 desain, dipakai di semua program"],
  ["Program referral (kode & link pribadi, dapat komisi)", false, true],
  ["Hapus program", false, true],
  ["Formulir pendaftaran & pemetaan kolom", true, true],
  ["Persetujuan otomatis / manual", true, true],
  ["QR verifikasi & unduh PDF", true, true],
  ["Email otomatis ke peserta", true, true],
  ["Upload peserta massal (CSV / tempel spreadsheet)", true, true],
  ["Unduh data kehadiran (CSV)", true, true],
];

function Cell({ v }: { v: string | boolean }) {
  if (v === true) return <Check className="mx-auto h-5 w-5 text-emerald-600" aria-label="Ya" />;
  if (v === false) return <Minus className="mx-auto h-5 w-5 text-slate-300" aria-label="Tidak" />;
  return <span>{v}</span>;
}

export default async function UpgradePage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  const { isPro, profile } = await requireUser();
  const admin = createAdminClient();

  // Kembali dari Midtrans: sinkronkan status pesanan (jika webhook belum sempat masuk).
  let orderStatus: string | null = null;
  let proNow = isPro;
  if (order && /^[A-Z0-9-]{6,40}$/.test(order)) {
    const { data: o } = await admin.from("orders").select("status, user_id").eq("order_id", order).maybeSingle();
    if (o && o.user_id === profile.id) {
      orderStatus = o.status;
      if (o.status === "pending" && midtransConfigured()) {
        const st = await fetchTransactionStatus(order);
        if (st) orderStatus = (await applyMidtransStatus(admin, st)) ?? o.status;
      }
      if (orderStatus === "paid") proNow = true;
    }
  }
  const [pricing, { count: pendingCount }] = await Promise.all([
    getPricing(admin),
    admin.from("orders").select("id", { count: "exact", head: true }).eq("user_id", profile.id).eq("status", "pending"),
  ]);

  return (
    <div>
      <div className="mt-6 text-center">
        <h1 className="text-3xl font-bold">Pilih paket yang sesuai</h1>
        <p className="mt-2 text-slate-600">Buka seluruh template bertema, desain sendiri, program tanpa batas, dan sertifikat tanpa watermark.</p>
      </div>

      {orderStatus === "paid" && <p className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><b>Pembayaran berhasil.</b> Paket Pro Anda sudah aktif. Terima kasih!</p>}
      {orderStatus === "pending" && <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Pembayaran Anda sedang menunggu konfirmasi. Muat ulang halaman ini setelah beberapa saat, atau buka <Link href="/dashboard/upgrade/riwayat" className="font-semibold underline">Riwayat transaksi</Link> untuk melanjutkan, mengganti metode, atau membatalkan.</p>}
      {orderStatus !== "pending" && (pendingCount ?? 0) > 0 && (
        <Link href="/dashboard/upgrade/riwayat" className="mt-6 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 hover:bg-amber-100/60">
          <Clock className="h-4 w-4 shrink-0 text-amber-600" /> <span>Anda punya <b>{pendingCount} pembayaran tertunda</b>. Lanjutkan, ganti metode bayar, atau batalkan di Riwayat transaksi →</span>
        </Link>
      )}
      {(orderStatus === "failed" || orderStatus === "expired") && <p className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">Pembayaran tidak berhasil atau sudah kedaluwarsa. Silakan coba lagi.</p>}

      {proNow ? (
        <div className="relative mt-8 flex flex-wrap items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-900 to-navy p-5 text-white shadow-md ring-1 ring-amber-400/25">
          <div className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full border border-white/10" />
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-400 text-navy"><Crown className="h-5 w-5" /></span>
          <div className="relative min-w-0 flex-1">
            <p className="font-semibold">Paket Pro aktif</p>
            <p className="mt-0.5 text-sm text-brand-100">{profile.plan_expires_at ? `Berlaku hingga ${new Date(profile.plan_expires_at).toLocaleDateString("id-ID", { dateStyle: "long", timeZone: "Asia/Jakarta" })}. Perpanjang kapan saja, masa aktif ditambahkan dari tanggal berakhir.` : "Tanpa batas waktu."}</p>
          </div>
        </div>
      ) : null}
      <Checkout initialCode={(await cookies()).get("sk_ref")?.value ?? ""} pricing={pricing} configured={midtransConfigured()} />

      <div className="mt-10 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full table-fixed text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left">
              <th className="w-[38%] px-3 py-3 font-semibold sm:w-auto sm:px-4">Fitur</th>
              <th className="w-[27%] px-2 py-3 text-center font-semibold sm:w-1/4 sm:px-4">Free</th>
              <th className="w-[35%] bg-brand-50 px-2 py-3 text-center font-semibold text-brand-700 sm:w-1/3 sm:px-4"><Crown className="mr-1 inline h-4 w-4" />Pro</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([f, free, pro]) => (
              <tr key={f} className="border-b border-slate-100 last:border-0">
                <td className="break-words px-3 py-3 font-medium text-slate-800 sm:px-4">{f}</td>
                <td className="break-words px-2 py-3 text-center text-slate-600 sm:px-4"><Cell v={free} /></td>
                <td className="break-words bg-brand-50/40 px-2 py-3 text-center text-slate-800 sm:px-4"><Cell v={pro} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
