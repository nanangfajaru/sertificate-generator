import Link from "next/link";
import Logo from "@/components/Logo";

/** Kerangka halaman publik sederhana (Tentang, Kontak): header dengan tombol masuk dan footer ringkas. */
export default function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-100">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
          <Logo size={30} />
          <nav className="flex items-center gap-5 text-sm">
            <Link href="/tentang" className="hidden text-slate-600 hover:text-slate-900 sm:inline">Tentang</Link>
            <Link href="/kontak" className="hidden text-slate-600 hover:text-slate-900 sm:inline">Kontak</Link>
            <Link href="/login" className="btn btn-primary btn-sm">Mulai gratis</Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-slate-100">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-slate-500">
          <Logo size={24} uid="lm-pub-foot" />
          <nav className="flex flex-wrap gap-5">
            <Link href="/tentang" className="hover:text-slate-900">Tentang kami</Link>
            <Link href="/kontak" className="hover:text-slate-900">Hubungi kami</Link>
            <Link href="/privasi" className="hover:text-slate-900">Privasi</Link>
            <Link href="/syarat" className="hover:text-slate-900">Syarat</Link>
          </nav>
          <p>© {new Date().getFullYear()} SertifikatKu</p>
        </div>
      </footer>
    </div>
  );
}
