import Link from "next/link";
import { ArrowLeft, Check, ChevronDown, Crown, Minus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getPricing } from "@/lib/billing";
import { createAdminClient } from "@/lib/supabase/admin";
import PlanCards from "../PlanCards";
import { FREE_PARTICIPANT_LIMIT, FREE_PROGRAM_LIMIT } from "@/lib/db";

export const metadata = { title: "Paket Pro" };


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

export default async function PricingPage() {
  const { isPro, profile } = await requireUser();
  const pricing = await getPricing(createAdminClient());
  return (
    <div>
      <Link href="/dashboard/upgrade" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"><ArrowLeft className="h-4 w-4" /> Berlangganan</Link>
      <div className="mt-3 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-navy">{isPro ? "Perpanjang paket Pro" : "Pilih paket yang sesuai"}</h1>
        <p className="mx-auto mt-2 max-w-2xl text-slate-600">
          {isPro && profile.plan_expires_at
            ? `Pro Anda berlaku hingga ${new Date(profile.plan_expires_at).toLocaleDateString("id-ID", { dateStyle: "long", timeZone: "Asia/Jakarta" })}. Masa aktif baru ditambahkan dari tanggal tersebut.`
            : "Buka seluruh template bertema, desain sendiri, program tanpa batas, dan sertifikat tanpa watermark."}
        </p>
      </div>
      <PlanCards pricing={pricing} />

      <details className="group mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm [&_summary::-webkit-details-marker]:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-semibold text-navy">
          Bandingkan Free dan Pro
          <ChevronDown className="h-5 w-5 text-slate-400 transition group-open:rotate-180" />
        </summary>
      <div className="overflow-x-auto border-t border-slate-200">
        <table className="w-full table-fixed text-xs sm:text-sm">
          <thead>
            <tr className="text-left">
              <th className="w-[38%] bg-slate-50 px-3 py-3.5 font-semibold text-slate-600 sm:w-auto sm:px-5">Fitur</th>
              <th className="w-[27%] bg-slate-50 px-2 py-3.5 text-center font-semibold text-slate-600 sm:w-1/4 sm:px-4">Free</th>
              <th className="w-[35%] bg-gradient-to-b from-brand-700 to-brand-900 px-2 py-3.5 text-center font-semibold text-white sm:w-1/3 sm:px-4"><Crown className="mr-1 inline h-4 w-4 text-amber-400" />Pro</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([f, free, pro]) => (
              <tr key={f} className="border-t border-slate-100">
                <td className="break-words px-3 py-3 font-medium text-slate-800 sm:px-5">{f}</td>
                <td className="break-words px-2 py-3 text-center text-slate-600 sm:px-4"><Cell v={free} /></td>
                <td className="break-words bg-brand-50/50 px-2 py-3 text-center font-medium text-navy sm:px-4"><Cell v={pro} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </details>
    </div>
  );
}
