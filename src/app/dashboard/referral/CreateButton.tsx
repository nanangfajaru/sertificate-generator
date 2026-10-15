"use client";

import { Gift, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { createMyReferral } from "./actions";

export default function CreateButton() {
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <div>
      <button className="btn btn-primary" disabled={pending} onClick={() => start(async () => { const r = await createMyReferral(); setErr(r.error ?? null); })}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />} Buat kode referral
      </button>
      {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
    </div>
  );
}
