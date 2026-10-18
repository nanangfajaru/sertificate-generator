import Logo from "@/components/Logo";
import AuthForm from "./AuthForm";
import GoogleButton from "./GoogleButton";

export const metadata = { title: "Masuk" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="card w-full max-w-sm text-center">
        <Logo size={40} className="mx-auto mb-5" />
        <h1 className="text-xl font-semibold">Masuk atau daftar</h1>
        <p className="mt-1 text-sm text-slate-500">Masuk atau daftar dengan Google maupun email.</p>
        {error && <p className="mt-4 rounded-lg bg-red-50 p-2 text-sm text-red-700">{error === "link" ? "Tautan tidak valid atau sudah kedaluwarsa. Minta tautan baru." : "Login gagal. Silakan coba lagi."}</p>}
        <div className="mt-6 space-y-4">
          <GoogleButton next={next} />
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="h-px flex-1 bg-slate-200" /> atau dengan email <span className="h-px flex-1 bg-slate-200" />
          </div>
          <AuthForm next={next} />
        </div>
        <p className="mt-6 text-xs text-slate-500">Dengan masuk, Anda menyetujui ketentuan penggunaan layanan.</p>
      </div>
    </main>
  );
}
