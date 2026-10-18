import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import PublicShell from "@/components/public/PublicShell";
import { formatPostDate, getPosts } from "@/lib/blog";
import { siteUrl } from "@/lib/util";

export const metadata = {
  title: "Blog – Tips Sertifikat & Panduan Panitia Acara",
  description: "Panduan praktis membuat sertifikat seminar, webinar, pelatihan, dan lomba, plus tips mengelola peserta untuk panitia acara.",
  alternates: { canonical: `${siteUrl()}/blog` },
};

export default function BlogIndex() {
  const posts = getPosts();
  return (
    <PublicShell>
      <section className="border-b border-slate-100 bg-gradient-to-b from-brand-50/60 to-white">
        <div className="mx-auto max-w-5xl px-5 pb-12 pt-14">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">Blog</p>
          <h1 className="mt-3 max-w-2xl text-balance text-4xl font-bold tracking-tight text-slate-900">Panduan sertifikat &amp; tips untuk panitia acara</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">Cara praktis menerbitkan sertifikat, mengelola peserta, dan menjalankan acara yang lebih rapi.</p>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-5 py-12">
        {posts.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">Artikel pertama segera terbit.</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {posts.map((p, i) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className={`group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg ${i === 0 && posts.length > 2 ? "md:col-span-2" : ""}`}>
                {p.tags[0] && <span className="w-fit rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">{p.tags[0]}</span>}
                <h2 className={`mt-3 font-bold leading-snug tracking-tight text-slate-900 group-hover:text-brand-700 ${i === 0 && posts.length > 2 ? "text-2xl" : "text-xl"}`}>{p.title}</h2>
                <p className="mt-2 line-clamp-3 text-slate-600">{p.description}</p>
                <div className="mt-auto flex items-center justify-between pt-5 text-sm text-slate-500">
                  <span className="flex items-center gap-3"><time dateTime={p.date}>{formatPostDate(p.date)}</time><span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{p.readingMinutes} menit</span></span>
                  <ArrowRight className="h-4 w-4 text-brand-600 transition group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </PublicShell>
  );
}
