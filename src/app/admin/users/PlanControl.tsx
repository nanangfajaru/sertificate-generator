"use client";

import { useState, useTransition } from "react";
import { setUserPlan } from "../actions";

export default function PlanControl({ userId, plan, expires }: { userId: string; plan: string; expires: string }) {
  const [p, setP] = useState(plan);
  const [exp, setExp] = useState(expires);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const dirty = p !== plan || (p === "pro" && exp !== expires);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select className="input !w-auto py-1" value={p} onChange={(e) => setP(e.target.value)}>
        <option value="free">Free</option>
        <option value="pro">Pro</option>
      </select>
      {p === "pro" && <input type="date" className="input !w-auto py-1" value={exp} onChange={(e) => setExp(e.target.value)} title="Berlaku sampai (kosong = tanpa batas)" />}
      <button
        className="btn btn-sm"
        disabled={!dirty || pending}
        onClick={() => start(async () => { const r = await setUserPlan(userId, p, p === "pro" && exp ? exp : null); setMsg(r.error ?? "Tersimpan"); })}
      >
        Simpan
      </button>
      {msg && <span className="text-xs text-slate-500">{msg}</span>}
    </div>
  );
}
