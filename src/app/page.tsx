import Logo from "@/components/Logo";
import Link from "next/link";
import { BadgeCheck, CalendarDays, Check, FileSpreadsheet, FileUp, Link2, ListChecks, QrCode, SlidersHorizontal } from "lucide-react";
import LazyMount from "@/components/LazyMount";
import SampleCert from "@/components/SampleCert";
import { TEMPLATES } from "@/lib/certificate/templates";
import { formatDateRange } from "@/lib/certificate/sources";
import { SHOWCASE } from "@/lib/showcase";

const features = [
  { icon: Link2, title: "Satu tautan pendaftaran", text: "Peserta mengisi formulir dari perangkat apa pun, tanpa membuat akun." },
  { icon: SlidersHorizontal, title: "Formulir yang fleksibel", text: "Tentukan isian peserta dan petakan ke kolom pada sertifikat." },
  { icon: ListChecks, title: "Otomatis atau dengan persetujuan", text: "Terbitkan langsung, atau setujui peserta terlebih dahulu secara massal." },
  { icon: QrCode, title: "Verifikasi keaslian", text: "Nomor unik dan QR pada setiap sertifikat untuk pemeriksaan keaslian." },
  { icon: FileUp, title: "Desain sendiri", text: "Unggah PDF atau gambar, lalu atur posisi nama, tanggal, dan nomor." },
  { icon: FileSpreadsheet, title: "Rekap kehadiran", text: "Unduh data peserta dan kehadiran dalam format CSV kapan saja." },
];

const steps = [
  ["Buat program", "Isi data kegiatan dan penandatangan, lalu pilih template."],
  ["Bagikan tautan", "Peserta mendaftar melalui formulir yang telah Anda atur."],
  ["Setujui", "Sertifikat terbit otomatis atau setelah persetujuan Anda."],
  ["Unduh sertifikat", "Peserta mengunduh PDF lengkap dengan nomor dan QR."],
];

const faqs = [
  ["Apakah peserta perlu membuat akun?", "Tidak. Peserta cukup membuka tautan dan mengisi formulir."],
  ["Bagaimana keaslian sertifikat diperiksa?", "Setiap sertifikat memuat nomor unik dan QR yang mengarah ke halaman verifikasi."],
  ["Bisakah menggunakan desain sendiri?", "Bisa. Unggah PDF, PNG, atau JPG hingga 10 MB, lalu atur posisi setiap data pada sertifikat."],
  ["Dalam format apa sertifikat diterbitkan?", "PDF beresolusi tinggi yang siap dicetak maupun dibagikan secara digital."],
  ["Bagaimana cara masuk?", "Gunakan akun Google, atau daftar dengan email dan password."],
];

const showcaseTemplates = ["classic-navy", "flora-rose", "sport-futsal", "frame-crimson", "medic-cross", "company-skyline", "modern-teal", "batik-kawung"];

export default function Landing() {
  return (
    <div className="text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Logo size={34} />
          <nav className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
            <a href="#fitur" className="hover:text-slate-900">Fitur</a>
            <a href="#template" className="hover:text-slate-900">Template</a>
            <a href="#contoh" className="hover:text-slate-900">Contoh Program</a>
            <a href="#faq" className="hover:text-slate-900">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 sm:block">Masuk</Link>
            <Link href="/login" className="btn btn-primary">Mulai Sekarang</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-100">
        <div className="bg-grid absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
        <div className="absolute -top-40 right-0 h-[480px] w-[480px] rounded-full bg-brand-100/70 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 py-20 lg:grid-cols-[1.05fr_1fr] lg:py-28">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">Platform sertifikat digital</p>
            <h1 className="mt-4 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.4rem]">
              Terbitkan sertifikat peserta dalam hitungan detik.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              Kumpulkan data peserta melalui satu tautan, setujui, lalu terbitkan sertifikat PDF lengkap dengan QR verifikasi.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login" className="btn btn-primary px-6 py-3 text-base">Mulai Sekarang</Link>
              <a href="#template" className="btn px-6 py-3 text-base">Lihat Template</a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute left-0 top-10 w-[62%] -rotate-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
              <SampleCert templateId="modern-teal" name="Budi Hartono" />
            </div>
            <div className="absolute right-0 top-0 w-[62%] rotate-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
              <SampleCert templateId="frame-crimson" name="Citra Lestari" />
            </div>
            <div className="relative ml-[12%] mt-24 w-[76%] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl ring-1 ring-slate-900/5">
              <SampleCert templateId="classic-navy" name="Aisyah Putri Rahma" />
            </div>
            <div className="absolute -bottom-4 left-0 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-lg">
              <BadgeCheck className="h-5 w-5 text-emerald-600" />
              <span className="font-medium">Sertifikat terverifikasi</span>
            </div>
          </div>
        </div>
      </section>

      {/* Ringkasan angka */}
      <section className="border-b border-slate-100 bg-slate-50/60">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-y-6 px-5 py-8 text-center md:grid-cols-4">
          {[
            [`${TEMPLATES.length}+`, "Template siap pakai"],
            ["PDF + QR", "Sertifikat terverifikasi"],
            ["Massal", "Persetujuan peserta"],
            ["CSV", "Ekspor rekap kehadiran"],
          ].map(([v, l]) => (
            <div key={l}>
              <dt className="text-2xl font-bold tracking-tight">{v}</dt>
              <dd className="mt-1 text-sm text-slate-500">{l}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Fitur */}
      <section id="fitur" className="mx-auto max-w-6xl scroll-mt-16 px-5 py-24">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">Fitur</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">Seluruh proses penerbitan, dalam satu tempat.</h2>
        </div>
        <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title}>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Icon className="h-5 w-5" /></div>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Alur kerja */}
      <section className="border-y border-slate-100 bg-slate-50/60 py-24">
        <div className="mx-auto max-w-6xl px-5">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">Alur kerja</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">Empat langkah sederhana.</h2>
          <ol className="mt-12 grid gap-8 md:grid-cols-4">
            {steps.map(([t, d], i) => (
              <li key={t} className="relative border-t-2 border-slate-200 pt-6">
                <span className="absolute -top-[2px] left-0 h-0.5 w-12 bg-brand-600" />
                <span className="text-sm font-semibold text-brand-600">0{i + 1}</span>
                <h3 className="mt-2 font-semibold">{t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Template */}
      <section id="template" className="mx-auto max-w-6xl scroll-mt-16 px-5 py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">Template</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">Desain profesional, siap digunakan.</h2>
          </div>
          <Link href="/login" className="text-sm font-medium text-brand-700 hover:underline">Lihat seluruh {TEMPLATES.length} template →</Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {showcaseTemplates.map((id) => (
            <div key={id} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <LazyMount><SampleCert templateId={id} /></LazyMount>
            </div>
          ))}
        </div>
      </section>

      {/* Contoh program */}
      <section id="contoh" className="scroll-mt-16 border-y border-slate-100 bg-slate-50/60 py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">Contoh program</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">Dipakai untuk beragam kegiatan.</h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SHOWCASE.map((p) => (
              <article key={p.key} className="flex flex-col rounded-xl border border-slate-200 bg-white p-4">
                <span className="w-fit rounded-md bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">{p.category}</span>
                <h3 className="mt-3 line-clamp-2 text-sm font-semibold leading-snug">{p.name}</h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500">{p.org}</p>
                <div className="mt-auto flex items-center gap-1.5 pt-4 text-xs text-slate-500">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{formatDateRange(p.start, p.end)}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-16 px-5 py-24">
        <h2 className="text-center text-3xl font-bold tracking-tight">Pertanyaan umum</h2>
        <div className="mt-10 divide-y divide-slate-200 border-y border-slate-200">
          {faqs.map(([q, a]) => (
            <details key={q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                {q}
                <span className="text-xl font-light text-slate-400 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-24">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-slate-900 px-8 py-16 text-center">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white">Siap menerbitkan sertifikat pertama Anda?</h2>
          <Link href="/login" className="btn mt-8 border-white bg-white px-6 py-3 text-base text-slate-900 hover:bg-slate-100">Mulai Sekarang</Link>
        </div>
      </section>

      <footer className="border-t border-slate-200">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-slate-500">
          <Logo size={26} />
          <nav className="flex gap-6">
            <a href="#fitur" className="hover:text-slate-900">Fitur</a>
            <a href="#faq" className="hover:text-slate-900">FAQ</a>
            <Link href="/login" className="hover:text-slate-900">Masuk</Link>
            <Link href="/privasi" className="hover:text-slate-900">Privasi</Link>
            <Link href="/syarat" className="hover:text-slate-900">Syarat</Link>
          </nav>
          <p>© {new Date().getFullYear()} SertifikatKu</p>
        </div>
      </footer>
    </div>
  );
}
