import Link from "next/link";
import { Award, Check, FileUp, Link2, QrCode, ShieldCheck, Users, Zap } from "lucide-react";
import SampleCert from "@/components/SampleCert";

const features = [
  { icon: Link2, title: "Satu link untuk peserta", text: "Bagikan link pendaftaran. Peserta isi form, sertifikat langsung tersedia." },
  { icon: Zap, title: "Otomatis atau dengan approval", text: "Pilih terbit otomatis, atau setujui peserta dulu — bisa massal sekaligus." },
  { icon: Users, title: "Form yang bisa diatur", text: "Tentukan sendiri data yang diisi, lalu petakan ke kolom di sertifikat." },
  { icon: QrCode, title: "QR verifikasi", text: "Setiap sertifikat punya nomor unik dan QR untuk cek keaslian." },
  { icon: FileUp, title: "Desain sendiri (Pro)", text: "Upload PDF/PNG/JPG, lalu geser posisi nama, tanggal, dan nomor sesukamu." },
  { icon: ShieldCheck, title: "Rekap kehadiran", text: "Unduh daftar peserta & kehadiran ke CSV/Excel kapan saja." },
];

const steps = [
  ["Masuk dengan Google", "Tanpa password. Akun Free langsung aktif."],
  ["Buat program", "Isi nama instansi, kegiatan, tanggal, penandatangan. Pilih template."],
  ["Bagikan link", "Peserta mengisi form pendaftaran dari ponsel mereka."],
  ["Sertifikat terbit", "Otomatis atau setelah kamu setujui. Unduh PDF + QR verifikasi."],
];

const faqs = [
  ["Apakah peserta perlu membuat akun?", "Tidak. Peserta cukup membuka link dan mengisi form."],
  ["Apa bedanya Free dan Pro?", "Free: 5 program dan 5 template. Pro: program tanpa batas, seluruh template (terus bertambah), dan upload desain sendiri."],
  ["Format file desain apa yang didukung?", "PDF (halaman pertama), PNG, dan JPG, maksimal 10 MB."],
  ["Bagaimana cara membayar Pro?", "Pembayaran online segera hadir. Sementara itu hubungi kami untuk aktivasi manual."],
];

export default function Landing() {
  return (
    <div>
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Award className="h-5 w-5 text-brand-600" /> Sertifikat Online
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
            <a href="#fitur" className="hover:text-slate-900">Fitur</a>
            <a href="#template" className="hover:text-slate-900">Template</a>
            <a href="#harga" className="hover:text-slate-900">Harga</a>
            <a href="#faq" className="hover:text-slate-900">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn btn-sm">Masuk</Link>
            <Link href="/login" className="btn btn-primary btn-sm">Daftar gratis</Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="badge bg-brand-100 text-brand-700">Gratis untuk 5 program pertama</span>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              Sertifikat acara terbit <span className="text-brand-600">otomatis</span>, tanpa ribet.
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Buat program, bagikan satu link, dan peserta langsung mendapat sertifikat PDF lengkap dengan nomor dan QR verifikasi.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login" className="btn btn-primary px-5 py-3">Mulai gratis dengan Google</Link>
              <a href="#template" className="btn px-5 py-3">Lihat template</a>
            </div>
            <ul className="mt-6 space-y-1 text-sm text-slate-600">
              {["Tanpa kartu kredit", "Peserta tidak perlu login", "Unduh rekap kehadiran"].map((t) => (
                <li key={t} className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> {t}</li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-brand-100/60 blur-2xl" />
            <div className="relative rotate-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
              <SampleCert templateId="classic-navy" name="Aisyah Putri Rahma" />
            </div>
            <div className="absolute -bottom-6 -left-4 hidden w-44 -rotate-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg sm:block">
              <SampleCert templateId="modern-teal" name="Budi Hartono" />
            </div>
          </div>
        </div>
      </section>

      <section id="fitur" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-3xl font-bold">Semua yang kamu butuhkan untuk e-sertifikat</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Icon className="h-5 w-5" /></div>
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold">Cara kerjanya</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-4">
            {steps.map(([t, d], i) => (
              <li key={t} className="relative">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 font-semibold text-white">{i + 1}</div>
                <h3 className="mt-3 font-semibold">{t}</h3>
                <p className="mt-1 text-sm text-slate-600">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="template" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-3xl font-bold">Template siap pakai</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-slate-600">5 template gratis, dan koleksi Pro yang terus bertambah. Atau upload desainmu sendiri.</p>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
          {["classic-navy", "modern-teal", "ribbon-slate", "geometric-crimson", "dark-gold", "seal-crimson"].map((id) => (
            <div key={id} className="overflow-hidden rounded-lg border border-slate-200 shadow-sm">
              <SampleCert templateId={id} />
            </div>
          ))}
        </div>
      </section>

      <section id="harga" className="bg-slate-50 py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-center text-3xl font-bold">Harga</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="card">
              <h3 className="font-semibold">Free</h3>
              <p className="mt-2 text-3xl font-bold">Rp0</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                {["Hingga 5 program", "5 template sertifikat", "Form pendaftaran custom", "Auto-terbit atau approval", "Rekap kehadiran CSV"].map((t) => (
                  <li key={t} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-emerald-600" /> {t}</li>
                ))}
              </ul>
              <Link href="/login" className="btn mt-6 w-full">Mulai gratis</Link>
            </div>
            <div className="card border-brand-500 ring-2 ring-brand-100">
              <h3 className="flex items-center gap-2 font-semibold">Pro <span className="badge badge-pro">Segera</span></h3>
              <p className="mt-2 text-3xl font-bold">Hubungi kami</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                {["Program tanpa batas", "Seluruh template, terus bertambah", "Upload desain sendiri (PDF/PNG/JPG)", "Atur posisi teks sesukamu", "Semua fitur Free"].map((t) => (
                  <li key={t} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-brand-600" /> {t}</li>
                ))}
              </ul>
              <Link href="/login" className="btn btn-primary mt-6 w-full">Coba dulu yang Free</Link>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="text-center text-3xl font-bold">Pertanyaan umum</h2>
        <div className="mt-8 space-y-3">
          {faqs.map(([q, a]) => (
            <details key={q} className="card group">
              <summary className="cursor-pointer font-medium">{q}</summary>
              <p className="mt-2 text-sm text-slate-600">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-100 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Sertifikat Online
      </footer>
    </div>
  );
}
