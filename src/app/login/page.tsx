import { Suspense } from "react";
import Logo from "@/components/Logo";
import LoginBody from "./LoginBody";

export const metadata = { title: "Masuk", alternates: { canonical: "/login" } };

// Statis: tidak membaca searchParams di server, sehingga halaman langsung dari CDN dan bisa di-prefetch penuh dari landing.
export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="card w-full max-w-sm text-center">
        <Logo size={40} className="mx-auto mb-5" />
        <h1 className="text-xl font-semibold">Masuk atau daftar</h1>
        <p className="mt-1 text-sm text-slate-500">Masuk atau daftar dengan Google maupun email.</p>
        <Suspense fallback={<div className="mt-6 h-[260px]" aria-busy="true" />}>
          <LoginBody />
        </Suspense>
        <p className="mt-6 text-xs text-slate-500">Dengan masuk, Anda menyetujui ketentuan penggunaan layanan.</p>
      </div>
    </main>
  );
}
