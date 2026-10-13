"use client";

import { useState, useTransition } from "react";
import { sendTestEmail, type TestResult } from "./actions";

export default function TestForm({ defaultTo }: { defaultTo: string }) {
  const [to, setTo] = useState(defaultTo);
  const [res, setRes] = useState<TestResult | null>(null);
  const [pending, start] = useTransition();
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <input className="input !w-72" type="email" value={to} onChange={(e) => setTo(e.target.value)} />
        <button className="btn btn-primary" disabled={pending} onClick={() => { setRes(null); start(async () => setRes(await sendTestEmail(to))); }}>
          {pending ? "Menguji…" : "Uji koneksi & kirim email"}
        </button>
      </div>
      {res?.ok && <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{res.ok}</p>}
      {res?.error && <p className="break-words rounded-lg bg-red-50 p-3 font-mono text-xs text-red-700">{res.error}</p>}
    </div>
  );
}
