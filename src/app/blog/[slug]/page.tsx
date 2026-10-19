import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Clock } from "lucide-react";
import Markdown from "@/components/public/Markdown";
import PublicShell from "@/components/public/PublicShell";
import { formatPostDate, getPost, getPosts, relatedPosts } from "@/lib/blog";
import { siteUrl } from "@/lib/util";

export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  if (!post) return {};
  const url = `${siteUrl()}/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: { type: "article", url, title: post.title, description: post.description, publishedTime: post.date, modifiedTime: post.updated ?? post.date },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const base = siteUrl();
  const url = `${base}/blog/${post.slug}`;
  const related = relatedPosts(post);
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      dateModified: post.updated ?? post.date,
      mainEntityOfPage: url,
      inLanguage: "id-ID",
      author: { "@type": "Organization", name: "Tim SertifikatKu", url: base },
      publisher: { "@type": "Organization", name: "SertifikatKu", logo: { "@type": "ImageObject", url: `${base}/logo-512.png` } },
      keywords: post.tags.join(", "),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Beranda", item: base },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${base}/blog` },
        { "@type": "ListItem", position: 3, name: post.title, item: url },
      ],
    },
    ...(post.faq.length
      ? [{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: post.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }]
      : []),
  ];

  return (
    <PublicShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <article className="mx-auto max-w-3xl px-5 pb-16 pt-10">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-900">Beranda</Link> <span className="text-slate-300">/</span> <Link href="/blog" className="hover:text-slate-900">Blog</Link>
        </nav>
        {post.tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">{post.tags.map((t) => <span key={t} className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">{t}</span>)}</div>
        )}
        <h1 className="mt-3 text-balance text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">{post.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-600">{post.description}</p>
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-slate-100 pb-6 text-sm text-slate-500">
          <span className="font-medium text-slate-700">Tim SertifikatKu</span>
          <time dateTime={post.date}>{formatPostDate(post.date)}</time>
          {post.updated && post.updated !== post.date && <span>Diperbarui {formatPostDate(post.updated)}</span>}
          <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{post.readingMinutes} menit baca</span>
        </div>

        {post.headings.length >= 3 && (
          <nav aria-label="Daftar isi" className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
            <p className="text-sm font-semibold text-slate-900">Daftar isi</p>
            <ol className="mt-3 space-y-1.5 text-[15px]">
              {post.headings.map((h, i) => <li key={h.id}><a href={`#${h.id}`} className="text-slate-600 hover:text-brand-700"><span className="mr-2 text-slate-500">{i + 1}.</span>{h.text}</a></li>)}
            </ol>
          </nav>
        )}

        <div className="mt-8"><Markdown>{post.body}</Markdown></div>

        <aside className="mt-14 overflow-hidden rounded-2xl bg-navy ring-1 ring-amber-400/20 p-7 text-white sm:p-9">
          <p className="text-xl font-bold leading-snug sm:text-2xl">Terbitkan sertifikat peserta otomatis, mulai hari ini.</p>
          <p className="mt-2 text-slate-300">Bagikan satu link pendaftaran, sertifikat PDF ber-QR langsung bisa diunduh peserta. Gratis untuk memulai.</p>
          <Link href="/login" className="btn mt-5 border-amber-400 bg-amber-400 font-semibold text-navy hover:bg-amber-300">Coba gratis <ArrowRight className="h-4 w-4" /></Link>
        </aside>

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="text-lg font-bold text-slate-900">Baca juga</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {related.map((r) => (
                <Link key={r.slug} href={`/blog/${r.slug}`} className="group rounded-xl border border-slate-200 p-4 transition hover:border-brand-300 hover:shadow-md">
                  <p className="font-semibold leading-snug text-slate-900 group-hover:text-brand-700">{r.title}</p>
                  <p className="mt-2 text-xs text-slate-500">{r.readingMinutes} menit baca</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </PublicShell>
  );
}
