import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/blog";
import { SEO_PAGES } from "@/lib/seo-pages";
import { siteUrl } from "@/lib/util";

// Tanggal "Terakhir diperbarui" di halaman Privasi & Syarat; ubah bersamaan bila teksnya diperbarui.
const LEGAL_UPDATED = "2026-10-21";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const posts = getPosts();
  const latestPost = posts.map((p) => p.updated ?? p.date).sort().at(-1);
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    ...SEO_PAGES.map((p) => ({ url: `${base}/sertifikat/${p.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    { url: `${base}/blog`, lastModified: latestPost, changeFrequency: "weekly", priority: 0.6 },
    ...posts.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: p.updated ?? p.date, changeFrequency: "monthly" as const, priority: 0.6 })),
    { url: `${base}/tentang`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/kontak`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/privasi`, lastModified: LEGAL_UPDATED, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/syarat`, lastModified: LEGAL_UPDATED, changeFrequency: "yearly", priority: 0.2 },
  ];
}
