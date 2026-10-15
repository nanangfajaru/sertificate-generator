"use client";

import { useActionState } from "react";
import { createReferralForUser } from "./actions";

export default function ReferralForUserForm() {
  const [s, action, pending] = useActionState(createReferralForUser, {} as { error?: string; ok?: boolean; code?: string });
  return (
    <form action={action} className="card grid items-start gap-3 sm:grid-cols-4">
      <div className="sm:col-span-4">
        <h2 className="font-semibold">Buatkan referral untuk pengguna</h2>
        <p className="text-sm text-slate-500">Kode dibuat otomatis (satu per pengguna) dan mengikuti pengaturan master. Kode baru berlaku di checkout selama pemiliknya Pro.</p>
      </div>
      <div className="sm:col-span-2">
        <label className="label">Email pengguna</label>
        <input name="email" type="email" className="input" required placeholder="nama@email.com" />
      </div>
      <div className="sm:pt-[1.625rem]"><button className="btn btn-primary w-full" disabled={pending}>{pending ? "Membuat…" : "Buat referral"}</button></div>
      <div className="text-sm sm:pt-[1.625rem]">
        {s.ok && <span className="text-emerald-600">Dibuat: <b className="font-mono">{s.code}</b></span>}
        {s.error && <span className="text-red-600">{s.error}</span>}
      </div>
    </form>
  );
}
