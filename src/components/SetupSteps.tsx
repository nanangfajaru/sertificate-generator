import { Check } from "lucide-react";

export const SETUP_STEPS = ["Data acara", "Penandatangan", "Alur", "Formulir & sertifikat"] as const;

/** Penanda langkah pembuatan program baru (dipakai di wizard dan langkah Formulir & sertifikat). */
export default function SetupSteps({ current, onSelect }: { current: number; onSelect?: (i: number) => void }) {
  return (
    <ol className="flex items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
      {SETUP_STEPS.map((title, i) => {
        const done = i < current;
        const cur = i === current;
        const clickable = !!onSelect && done;
        const inner = (
          <>
            <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${cur ? "bg-brand-600 text-white" : done ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"}`}>
              {done ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span className={`truncate text-sm font-medium ${cur ? "" : "hidden md:block"}`}>{title}</span>
          </>
        );
        const cls = `flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-1.5 text-left ${cur ? "bg-brand-50 text-brand-700" : done ? "text-slate-700" : "text-slate-400"}`;
        return (
          <li key={title} className="flex min-w-0 flex-1 items-center gap-1">
            {clickable ? <button type="button" onClick={() => onSelect!(i)} className={`${cls} hover:bg-slate-50`}>{inner}</button> : <div className={cls}>{inner}</div>}
            {i < SETUP_STEPS.length - 1 && <span className={`h-px w-3 shrink-0 lg:w-6 ${done ? "bg-emerald-400" : "bg-slate-200"}`} />}
          </li>
        );
      })}
    </ol>
  );
}
