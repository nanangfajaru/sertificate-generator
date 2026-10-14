import Logo from "@/components/Logo";
import Link from "next/link";
import { ArrowRight, BadgeCheck, CalendarDays, Check, ClipboardList, Link2, ListChecks, Mail, QrCode, Send, X } from "lucide-react";
import { ApprovalMockup, FormMockup, VerifyMockup } from "@/components/landing/Mockups";
import LazyMount from "@/components/LazyMount";
import SampleCert from "@/components/SampleCert";
import { TEMPLATES } from "@/lib/certificate/templates";
import { formatDateRange } from "@/lib/certificate/sources";
import { SEO_PAGES } from "@/lib/seo-pages";
import { SHOWCASE } from "@/lib/showcase";


const steps = [
  { icon: ClipboardList, t: "Buat program", d: "Isi data kegiatan dan penandatangan, lalu pilih template." },
  { icon: Send, t: "Bagikan tautan", d: "Peserta mendaftar lewat link atau QR formulir yang Anda atur." },
  { icon: ListChecks, t: "Setujui", d: "Sertifikat terbit otomatis atau setelah persetujuan Anda." },
  { icon: Mail, t: "Terima sertifikat", d: "Peserta mengunduh PDF lengkap dengan nomor dan QR." },
];

const compare = {
  manual: [
    "Buat formulir di Google Form, lalu tunggu peserta mengisi",
    "Ekspor jawaban ke spreadsheet dan rapikan nama satu per satu",
    "Impor ke Canva, Word, atau alat lain untuk membuat sertifikat",
    "Unduh PDF lalu kirim ke peserta secara manual, tidak langsung (tidak real-time)",
    "Salah data atau nama? Ulangi dari awal",
  ],
  ours: [
    "Satu link atau QR untuk pendaftaran",
    "Sertifikat PDF terbit otomatis dari data yang diisi peserta",
    "Peserta mengunduh sendiri saat itu juga, tanpa menunggu panitia",
    "Nomor unik dan QR di setiap sertifikat untuk memeriksa keasliannya",
    "Salah data? Perbaiki sekali, sertifikat ikut berubah",
  ],
};

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
            <a href="#kegunaan" className="hover:text-slate-900">Kegunaan</a>
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

      {/* Sorotan fitur dengan mockup */}
      <section id="fitur" className="mx-auto max-w-6xl scroll-mt-16 space-y-28 px-5 py-24">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">Fitur</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">Seluruh proses penerbitan, dalam satu tempat.</h2>
        </div>

        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600"><Link2 className="h-5 w-5" /></span>
            <h3 className="mt-4 text-2xl font-bold tracking-tight">Satu tautan, peserta mengisi sendiri.</h3>
            <p className="mt-3 text-slate-600">Bagikan link atau QR formulir di grup dan layar acara. Peserta mengisi dari ponsel tanpa membuat akun, dan data langsung masuk ke daftar Anda.</p>
            <ul className="mt-5 space-y-2.5 text-slate-700">
              {["Link pendek yang bisa Anda beri nama sendiri", "QR siap unduh untuk poster dan layar", "Atur isian formulir sesuai kebutuhan"].map((t) => (<li key={t} className="flex gap-2.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {t}</li>))}
            </ul>
          </div>
          <FormMockup />
        </div>

        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div className="lg:order-2">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600"><ListChecks className="h-5 w-5" /></span>
            <h3 className="mt-4 text-2xl font-bold tracking-tight">Terbit otomatis atau setelah Anda setujui.</h3>
            <p className="mt-3 text-slate-600">Pilih langsung terbit, atau tinjau dulu siapa yang benar-benar hadir lalu setujui sekaligus. Peserta bisa diberi tahu lewat email begitu sertifikatnya siap.</p>
            <ul className="mt-5 space-y-2.5 text-slate-700">
              {["Persetujuan massal dalam satu klik", "Cabut sertifikat bila terjadi kesalahan", "Unduh rekap kehadiran dalam CSV"].map((t) => (<li key={t} className="flex gap-2.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {t}</li>))}
            </ul>
          </div>
          <div className="lg:order-1"><ApprovalMockup /></div>
        </div>

        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600"><QrCode className="h-5 w-5" /></span>
            <h3 className="mt-4 text-2xl font-bold tracking-tight">Keaslian sertifikat bisa diverifikasi.</h3>
            <p className="mt-3 text-slate-600">Setiap sertifikat memiliki nomor unik dan QR yang mengarah ke halaman verifikasi, sehingga pihak ketiga dapat memeriksa keasliannya dalam hitungan detik.</p>
            <ul className="mt-5 space-y-2.5 text-slate-700">
              {["Nomor sertifikat berurutan sesuai format Anda", "Gambar tanda tangan penandatangan", "Desain sendiri dengan posisi data yang bisa diatur"].map((t) => (<li key={t} className="flex gap-2.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {t}</li>))}
            </ul>
          </div>
          <VerifyMockup />
        </div>

      </section>

      {/* Alur kerja */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">Alur kerja</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight">Empat langkah sederhana.</h2>
        <ol className="relative mt-14 grid gap-10 md:grid-cols-4">
          <div className="absolute left-[12%] right-[12%] top-7 hidden h-px bg-gradient-to-r from-brand-200 via-brand-500 to-brand-200 md:block" />
          {steps.map(({ icon: Icon, t, d }, i) => (
            <li key={t} className="relative text-center">
              <span className="relative mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-200"><Icon className="h-6 w-6" /></span>
              <p className="mt-4 text-xs font-semibold text-brand-600">Langkah {i + 1}</p>
              <h3 className="mt-1 font-semibold">{t}</h3>
              <p className="mx-auto mt-1.5 max-w-[16rem] text-sm leading-relaxed text-slate-600">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Kegunaan (tautan ke halaman SEO) */}
      <section id="kegunaan" className="mx-auto max-w-6xl scroll-mt-16 px-5 py-24">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">Kegunaan</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">Untuk kegiatan apa sertifikatnya?</h2>
          <p className="mt-3 text-slate-600">Pilih jenis kegiatan Anda dan lihat contoh sertifikat yang sesuai.</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SEO_PAGES.map((p) => (
            <Link key={p.slug} href={`/sertifikat/${p.slug}`} className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-brand-500 hover:shadow-lg">
              <div className="relative h-44 overflow-hidden bg-gradient-to-br from-brand-50 via-slate-50 to-white">
                <LazyMount aspect="auto" className="absolute inset-0">
                  <div className="absolute left-[30%] top-6 w-[58%] rotate-[7deg] overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg transition duration-300 group-hover:rotate-[10deg] group-hover:translate-x-1">
                    <SampleCert templateId={p.templates[1]} name="Citra Lestari" event={p.sampleEvent} />
                  </div>
                  <div className="absolute left-[8%] top-9 w-[58%] -rotate-[6deg] overflow-hidden rounded-md border border-slate-200 bg-white shadow-xl transition duration-300 group-hover:-rotate-[9deg] group-hover:-translate-x-1">
                    <SampleCert templateId={p.templates[0]} name="Aisyah Putri" event={p.sampleEvent} />
                  </div>
                </LazyMount>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-semibold group-hover:text-brand-700">{p.title.replace(/^Sertifikat /, "")}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-slate-600">{p.intro}</p>
                <span className="mt-auto pt-3 text-sm font-medium text-brand-700">Lihat contoh →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Manual vs SertifikatKu */}
      <section className="border-y border-slate-100 bg-slate-50/60 py-24">
        <div className="mx-auto max-w-5xl px-5">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">Perbandingan</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">Dari 5 alat berbeda menjadi satu.</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-7">
              <p className="font-semibold text-slate-500">Cara biasa</p>
              <ul className="mt-5 space-y-3.5">{compare.manual.map((t) => (<li key={t} className="flex gap-3 text-slate-600"><X className="mt-0.5 h-5 w-5 shrink-0 text-red-400" /> {t}</li>))}</ul>
            </div>
            <div className="rounded-2xl border-2 border-brand-500 bg-white p-7 shadow-lg shadow-brand-100">
              <p className="font-semibold text-brand-700">Dengan SertifikatKu</p>
              <ul className="mt-5 space-y-3.5">{compare.ours.map((t) => (<li key={t} className="flex gap-3 text-slate-800"><Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /> {t}</li>))}</ul>
            </div>
          </div>
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
            {SHOWCASE.slice(0, 8).map((p) => (
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

      {/* CTA akhir */}
      <section className="px-5 pb-24">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-900 px-8 py-14 text-center text-white shadow-xl">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-white/5" />
          <h2 className="relative text-3xl font-bold tracking-tight sm:text-4xl">Siap menerbitkan sertifikat pertama Anda?</h2>
          <p className="relative mx-auto mt-3 max-w-xl text-brand-100">Buat program, bagikan link, dan biarkan peserta mengambil sertifikatnya sendiri.</p>
          <Link href="/login" className="btn relative mt-8 border-white bg-white px-7 py-3 text-base font-semibold text-brand-700 hover:bg-brand-50">Mulai Sekarang <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      <footer className="border-t border-slate-200">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-slate-500">
          <Logo size={26} />
          <nav className="flex gap-6">
            <a href="#fitur" className="hover:text-slate-900">Fitur</a>
            <a href="#faq" className="hover:text-slate-900">FAQ</a>
            <Link href="/login" className="hover:text-slate-900">Masuk</Link>
            <a href="#kegunaan" className="hover:text-slate-900">Kegunaan</a>
            <Link href="/privasi" className="hover:text-slate-900">Privasi</Link>
            <Link href="/syarat" className="hover:text-slate-900">Syarat</Link>
          </nav>
          <p>© {new Date().getFullYear()} SertifikatKu</p>
        </div>
        <nav aria-label="Jenis sertifikat" className="mx-auto flex max-w-6xl flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 px-5 py-5 text-xs text-slate-500">
          {SEO_PAGES.map((p) => (<Link key={p.slug} href={`/sertifikat/${p.slug}`} className="hover:text-slate-900">{p.title}</Link>))}
        </nav>
      </footer>
    </div>
  );
}
