import Link from "next/link";
import { ArrowLeft, Check, Crown, Minus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { FREE_PARTICIPANT_LIMIT, FREE_PROGRAM_LIMIT } from "@/lib/db";

export const metadata = { title: "Paket Free & Pro" };

const MONTHLY = 49000;
const YEARLY = 499000;
const rp = (n: number) => `Rp${n.toLocaleString("id-ID")}`;

type Row = [feature: string, free: string | boolean, pro: string | boolean];
const ROWS: Row[] = [
  ["Jumlah program / kegiatan", `${FREE_PROGRAM_LIMIT} program`, "Tanpa batas"],
  ["Peserta per program", `${FREE_PARTICIPANT_LIMIT} peserta`, "Tanpa batas"],
  ["Template sertifikat", "20 template dasar", "20 dasar + 22 bertema (bunga, rumah sakit, olahraga, perusahaan, dll)"],
  ["Desain sendiri (unggah PDF/PNG/JPG)", "Boleh membuat & menyimpan 3, tidak bisa dipakai", "Hingga 20 desain, bisa dipakai"],
  ["Watermark sertifikatku.com", "Ada", "Tanpa watermark"],
  ["Hapus program", false, true],
  ["Formulir pendaftaran & pemetaan kolom", true, true],
  ["Persetujuan otomatis / manual", true, true],
  ["QR verifikasi & unduh PDF", true, true],
  ["Email otomatis ke peserta", true, true],
  ["Unduh data kehadiran (CSV)", true, true],
];

function Cell({ v }: { v: string | boolean }) {
  if (v === true) return <Check className="mx-auto h-5 w-5 text-emerald-600" aria-label="Ya" />;
  if (v === false) return <Minus className="mx-auto h-5 w-5 text-slate-300" aria-label="Tidak" />;
  return <span>{v}</span>;
}

function buyHref(plan: "bulanan" | "tahunan", email: string | null | undefined) {
  const base = process.env.NEXT_PUBLIC_UPGRADE_URL;
  if (!base) return null;
  if (base.startsWith("mailto:")) {
    const subject = encodeURIComponent(`Upgrade Pro ${plan} - Sertifikat Online`);
    const body = encodeURIComponent(`Halo, saya ingin upgrade ke paket Pro (${plan}).\nEmail akun: ${email ?? "-"}`);
    return `${base}?subject=${subject}&body=${body}`;
  }
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}plan=${plan}`;
}

export default async function UpgradePage() {
  const { isPro, profile } = await requireUser();
  const monthlyHref = buyHref("bulanan", profile.email);
  const yearlyHref = buyHref("tahunan", profile.email);
  const saving = MONTHLY * 12 - YEARLY;

  const Buy = ({ href, children, primary }: { href: string | null; children: React.ReactNode; primary?: boolean }) =>
    href ? (
      <a href={href} className={`btn w-full ${primary ? "btn-primary" : ""}`}>{children}</a>
    ) : (
      <span className="btn w-full cursor-not-allowed opacity-60" title="Pembayaran online segera hadir">{children}</span>
    );

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"><ArrowLeft className="h-4 w-4" /> Kembali</Link>
      <div className="mt-3 text-center">
        <h1 className="text-3xl font-bold">Pilih paket yang sesuai</h1>
        <p className="mt-2 text-slate-600">Buka seluruh template bertema, desain sendiri, program tanpa batas, dan sertifikat tanpa watermark.</p>
      </div>

      {isPro ? (
        <div className="mt-8 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <Crown className="h-5 w-5 text-amber-600" /> Paket Pro Anda sedang aktif. Terima kasih telah berlangganan!
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="card flex flex-col">
            <p className="text-sm font-medium text-slate-500">Pro Bulanan</p>
            <p className="mt-2 text-4xl font-bold">{rp(MONTHLY)}<span className="text-base font-normal text-slate-500"> / bulan</span></p>
            <p className="mt-2 flex-1 text-sm text-slate-600">Fleksibel, berhenti kapan saja.</p>
            <div className="mt-4"><Buy href={monthlyHref}>Pilih bulanan</Buy></div>
          </div>
          <div className="card relative flex flex-col border-brand-500 ring-2 ring-brand-100">
            <span className="badge badge-pro absolute -top-3 right-5">Hemat {rp(saving)}</span>
            <p className="text-sm font-medium text-brand-700">Pro Tahunan</p>
            <p className="mt-2 text-4xl font-bold">{rp(YEARLY)}<span className="text-base font-normal text-slate-500"> / tahun</span></p>
            <p className="mt-2 flex-1 text-sm text-slate-600">Setara {rp(Math.round(YEARLY / 12))} per bulan — paling hemat.</p>
            <div className="mt-4"><Buy href={yearlyHref} primary>Pilih tahunan</Buy></div>
          </div>
          {!monthlyHref && <p className="text-center text-xs text-slate-500 md:col-span-2">Pembayaran online segera hadir. Sementara itu, hubungi admin untuk mengaktifkan paket Pro.</p>}
        </div>
      )}

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
