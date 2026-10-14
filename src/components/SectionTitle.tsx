import type { LucideIcon } from "lucide-react";

/** Judul bagian kartu: ikon berwarna + judul + keterangan singkat. */
export default function SectionTitle({ icon: Icon, title, hint }: { icon: LucideIcon; title: string; hint?: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600"><Icon className="h-[18px] w-[18px]" /></span>
      <div>
        <h2 className="font-semibold leading-tight">{title}</h2>
        {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
      </div>
    </div>
  );
}
