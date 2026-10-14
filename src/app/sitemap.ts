import type { MetadataRoute } from "next";
import { SEO_PAGES } from "@/lib/seo-pages";
import { siteUrl } from "@/lib/util";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    ...SEO_PAGES.map((p) => ({ url: `${base}/sertifikat/${p.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    { url: `${base}/privasi`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/syarat`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
