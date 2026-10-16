import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowLeft, Check, Crown, Minus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { applyMidtransStatus, getPricing, fetchTransactionStatus, midtransConfigured } from "@/lib/billing";
import { createAdminClient } from "@/lib/supabase/admin";
import Checkout from "./Checkout";
import { FREE_PARTICIPANT_LIMIT, FREE_PROGRAM_LIMIT } from "@/lib/db";

export const metadata = { title: "Paket Free & Pro" };


type Row = [feature: string, free: string | boolean, pro: string | boolean];
const ROWS: Row[] = [
  ["Jumlah program / kegiatan", `${FREE_PROGRAM_LIMIT} program`, "Tanpa batas"],
  ["Peserta per program", `${FREE_PARTICIPANT_LIMIT} peserta`, "Tanpa batas"],
  ["Template sertifikat", "20 template dasar", "20 dasar + 22 bertema (bunga, rumah sakit, olahraga, perusahaan, dll)"],
  ["Desain sendiri (unggah PDF/PNG/JPG)", "Boleh membuat & menyimpan 3, tidak bisa dipakai", "Hingga 10 desain, dipakai di semua program"],
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
  const pricing = await getPricing(admin);

  return (
    <div>
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"><ArrowLeft className="h-4 w-4" /> Kembali</Link>
      <div className="mt-3 text-center">
        <h1 className="text-3xl font-bold">Pilih paket yang sesuai</h1>
        <p className="mt-2 text-slate-600">Buka seluruh template bertema, desain sendiri, program tanpa batas, dan sertifikat tanpa watermark.</p>
      </div>

      {orderStatus === "paid" && <p className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><b>Pembayaran berhasil.</b> Paket Pro Anda sudah aktif. Terima kasih!</p>}
      {orderStatus === "pending" && <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Pembayaran Anda sedang menunggu konfirmasi. Muat ulang halaman ini setelah beberapa saat.</p>}
      {(orderStatus === "failed" || orderStatus === "expired") && <p className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">Pembayaran tidak berhasil atau sudah kedaluwarsa. Silakan coba lagi.</p>}

      {proNow ? (
        <div className="mt-8 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <Crown className="h-5 w-5 text-amber-600" /> Paket Pro Anda sedang aktif{profile.plan_expires_at ? ` hingga ${new Date(profile.plan_expires_at).toLocaleDateString("id-ID", { dateStyle: "long" })}` : ""}. Anda bisa memperpanjang kapan saja.
        </div>
      ) : null}
      <Checkout initialCode={(await cookies()).get("sk_ref")?.value ?? ""} pricing={pricing} configured={midtransConfigured()} />

      <div className="mt-10 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[34rem] text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left">
              <th className="px-4 py-3 font-semibold">Fitur</th>
              <th className="w-1/4 px-4 py-3 text-center font-semibold">Free</th>
              <th className="w-1/3 bg-brand-50 px-4 py-3 text-center font-semibold text-brand-700"><Crown className="mr-1 inline h-4 w-4" />Pro</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([f, free, pro]) => (
              <tr key={f} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 font-medium text-slate-800">{f}</td>
                <td className="px-4 py-3 text-center text-slate-600"><Cell v={free} /></td>
                <td className="bg-brand-50/40 px-4 py-3 text-center text-slate-800"><Cell v={pro} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
