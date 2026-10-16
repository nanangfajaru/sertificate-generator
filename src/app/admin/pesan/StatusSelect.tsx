"use client";

import { useTransition } from "react";
import { setMessageStatus } from "./actions";

const OPTIONS = [["baru", "Baru"], ["dibalas", "Sudah dibalas"], ["selesai", "Selesai"]] as const;
const TONE: Record<string, string> = { baru: "bg-brand-50 text-brand-700", dibalas: "bg-amber-50 text-amber-800", selesai: "bg-emerald-50 text-emerald-700" };

export default function StatusSelect({ id, status }: { id: string; status: string }) {
  const [pending, start] = useTransition();
  return (
    <select
      aria-label="Status pesan"
      disabled={pending}
      defaultValue={status}
      onChange={(e) => start(() => setMessageStatus(id, e.target.value as "baru"))}
      className={`rounded-full border-0 px-3 py-1 text-xs font-semibold ${TONE[status] ?? ""}`}
    >
      {OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}
