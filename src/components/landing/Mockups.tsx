import { BadgeCheck, Check, Clock, Download, QrCode } from "lucide-react";
import SampleCert from "@/components/SampleCert";

/** Bingkai jendela browser sederhana untuk mockup antarmuka. */
function Frame({ url, children, className = "" }: { url: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl ring-1 ring-slate-900/5 ${className}`}>
      <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-3 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-300" /><span className="h-2.5 w-2.5 rounded-full bg-amber-300" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
        <span className="ml-3 flex-1 truncate rounded-md bg-white px-3 py-1 text-[11px] text-slate-400">{url}</span>
      </div>
      {children}
    </div>
  );
}

export function FormMockup() {
  return (
    <div className="relative">
      <Frame url="sertifikatku.com/p/seminar-teknologi">
        <div className="space-y-4 p-6">
          <div>
            <p className="text-[11px] font-medium text-brand-700">Universitas Contoh Nusantara</p>
            <p className="text-lg font-bold leading-snug">Seminar Nasional Teknologi 2026</p>
          </div>
          {[["Nama lengkap", "Aisyah Putri Rahma"], ["Email", "aisyah@contoh.id"], ["Instansi", "Universitas Contoh"]].map(([l, v]) => (
            <div key={l}>
              <p className="text-xs font-medium text-slate-600">{l}</p>
              <div className="mt-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700">{v}</div>
            </div>
          ))}
          <div className="rounded-lg bg-brand-600 px-4 py-2.5 text-center text-sm font-semibold text-white">Daftar Hadir &amp; Dapatkan Sertifikat</div>
        </div>
      </Frame>
      <div className="absolute -bottom-10 -right-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xl sm:-right-6">
        <div className="grid h-14 w-14 place-items-center rounded-lg bg-slate-900 text-white"><QrCode className="h-9 w-9" /></div>
        <div className="pr-1"><p className="text-xs font-semibold">Pindai untuk daftar</p><p className="text-[11px] text-slate-500">QR siap cetak</p></div>
      </div>
    </div>
  );
}

const ROWS: [string, string, "ok" | "wait"][] = [
  ["Aisyah Putri Rahma", "aisyah@contoh.id", "ok"],
  ["Budi Hartono", "budi@contoh.id", "wait"],
  ["Citra Lestari", "citra@contoh.id", "wait"],
  ["Dimas Pratama", "dimas@contoh.id", "wait"],
];

export function ApprovalMockup() {
  return (
    <Frame url="sertifikatku.com/dashboard/peserta">
      <div className="p-5">
        <div className="flex items-center justify-between">
          <p className="font-semibold">Peserta</p>
          <span className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white">Setujui 3 terpilih</span>
        </div>
        <div className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200">
          {ROWS.map(([n, e, s], i) => (
            <div key={n} className="flex items-center gap-3 px-3 py-2.5">
              <span className={`grid h-4 w-4 place-items-center rounded border ${i > 0 ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300"}`}>{i > 0 && <Check className="h-3 w-3" />}</span>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{n}</p><p className="truncate text-xs text-slate-500">{e}</p></div>
              {s === "ok" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800"><BadgeCheck className="h-3 w-3" /> Disetujui</span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800"><Clock className="h-3 w-3" /> Menunggu</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

export function VerifyMockup() {
  return (
    <div className="relative mx-auto max-w-md">
      <Frame url="sertifikatku.com/c/aB3xK9">
        <div className="space-y-4 bg-slate-50 p-5">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <BadgeCheck className="h-8 w-8 text-emerald-600" />
              <div><p className="font-semibold">Sertifikat valid</p><p className="text-xs text-slate-500">Aisyah Putri Rahma</p><p className="font-mono text-[11px] text-slate-400">001/SERT/X/2026</p></div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-2.5 py-1.5 text-xs font-semibold text-white"><Download className="h-3.5 w-3.5" /> PDF</span>
          </div>
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white"><SampleCert templateId="classic-navy" name="Aisyah Putri Rahma" /></div>
        </div>
      </Frame>
    </div>
  );
}
