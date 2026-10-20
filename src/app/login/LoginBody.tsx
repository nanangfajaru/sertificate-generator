"use client";

import { useSearchParams } from "next/navigation";
import AuthForm from "./AuthForm";
import GoogleButton from "./GoogleButton";

/** Isi halaman login. Parameter ?next / ?error dibaca di browser agar halaman login bisa statis (dilayani CDN, instan). */
export default function LoginBody() {
  const sp = useSearchParams();
  const next = sp.get("next") ?? undefined;
  const error = sp.get("error");
  return (
    <>
      {error && <p className="mt-4 rounded-lg bg-red-50 p-2 text-sm text-red-700">{error === "link" ? "Tautan tidak valid atau sudah kedaluwarsa. Minta tautan baru." : "Login gagal. Silakan coba lagi."}</p>}
      <div className="mt-6 space-y-4">
        <GoogleButton next={next} />
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="h-px flex-1 bg-slate-200" /> atau dengan email <span className="h-px flex-1 bg-slate-200" />
        </div>
        <AuthForm next={next} />
      </div>
    </>
  );
}
