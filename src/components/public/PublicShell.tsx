import Link from "next/link";
import Logo from "@/components/Logo";
import HeaderMotif from "./HeaderMotif";
import SocialLinks from "./SocialLinks";

/** Kerangka halaman publik sederhana (Tentang, Kontak): header dengan tombol masuk dan footer ringkas. */
export default function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="relative bg-navy shadow-[0_1px_0_0_rgba(251,191,36,.45)]">
        <HeaderMotif />
        <div className="relative mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
          <Logo size={30} light />
          <nav className="flex items-center gap-5 text-sm">
            <Link href="/blog" className="hidden text-slate-300 hover:text-white sm:inline">Blog</Link>
            <Link href="/tentang" className="hidden text-slate-300 hover:text-white sm:inline">Tentang</Link>
            <Link href="/kontak" className="hidden text-slate-300 hover:text-white sm:inline">Kontak</Link>
            <Link href="/login" className="btn btn-sm border-amber-400 bg-amber-400 font-semibold text-navy hover:bg-amber-300">Mulai gratis</Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-slate-100">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-slate-500">
          <Logo size={24} uid="lm-pub-foot" />
          <nav className="flex flex-wrap gap-5">
            <Link href="/#faq" className="hover:text-slate-900">FAQ</Link>
            <Link href="/blog" className="hover:text-slate-900">Blog</Link>
            <Link href="/tentang" className="hover:text-slate-900">Tentang Kami</Link>
            <Link href="/kontak" className="hover:text-slate-900">Hubungi Kami</Link>
            <Link href="/privasi" className="hover:text-slate-900">Privasi</Link>
            <Link href="/syarat" className="hover:text-slate-900">Syarat</Link>
          </nav>
          <div className="flex flex-wrap items-center gap-4">
            <SocialLinks />
            <p>© {new Date().getFullYear()} SertifikatKu</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
