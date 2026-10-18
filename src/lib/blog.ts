import "server-only";
import fs from "node:fs";
import path from "node:path";

/**
 * Artikel blog = file Markdown di content/blog/<slug>.md, dirender statis saat build.
 * Frontmatter (antara baris ---):
 *   title, description (meta, ±150 karakter), date (YYYY-MM-DD), updated (opsional), tags (dipisah koma)
 * Bagian "## Pertanyaan umum" berisi ### pertanyaan + jawaban otomatis menjadi FAQ schema.
 */
export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated: string | null;
  tags: string[];
  body: string;
  readingMinutes: number;
  faq: { q: string; a: string }[];
  headings: { id: string; text: string }[];
};

const DIR = path.join(process.cwd(), "content", "blog");

export function slugifyHeading(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 80);
}

function parse(slug: string, raw: string): BlogPost {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new Error(`Frontmatter tidak ditemukan: ${slug}`);
  const meta: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
  const body = m[2].trim();
  if (!meta.title || !meta.description || !/^\d{4}-\d{2}-\d{2}$/.test(meta.date ?? "")) throw new Error(`Frontmatter tidak lengkap: ${slug}`);

  const headings = [...body.matchAll(/^## (.+)$/gm)].map((h) => ({ id: slugifyHeading(h[1]), text: h[1].trim() }));
  const faq: BlogPost["faq"] = [];
  const faqSec = body.match(/^## (?:Pertanyaan|FAQ)[^\n]*\n([\s\S]*?)(?=^## |^---\s*$|$(?![\s\S]))/im);
  if (faqSec) {
    for (const q of faqSec[1].split(/^### /m).slice(1)) {
      const [first, ...rest] = q.split("\n");
      const a = rest.join("\n").replace(/[*_`[\]]|\(http[^)]*\)/g, "").trim();
      if (first.trim() && a) faq.push({ q: first.trim(), a });
    }
  }
  const words = body.replace(/[#>*_`[\]()-]/g, " ").split(/\s+/).filter(Boolean).length;
  return {
    slug,
    title: meta.title,
    description: meta.description,
    date: meta.date,
    updated: /^\d{4}-\d{2}-\d{2}$/.test(meta.updated ?? "") ? meta.updated : null,
    tags: (meta.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean),
    body,
    readingMinutes: Math.max(1, Math.round(words / 200)),
    faq,
    headings,
  };
}

let cache: BlogPost[] | null = null;

/** Semua artikel, terbaru dulu. */
export function getPosts(): BlogPost[] {
  if (cache) return cache;
  const files = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter((f) => f.endsWith(".md")) : [];
  cache = files.map((f) => parse(f.replace(/\.md$/, ""), fs.readFileSync(path.join(DIR, f), "utf8"))).sort((a, b) => b.date.localeCompare(a.date));
  return cache;
}

export function getPost(slug: string) {
  return getPosts().find((p) => p.slug === slug) ?? null;
}

/** Artikel terkait: tag yang sama dulu, lalu terbaru. */
export function relatedPosts(post: BlogPost, n = 3) {
  const others = getPosts().filter((p) => p.slug !== post.slug);
  const score = (p: BlogPost) => p.tags.filter((t) => post.tags.includes(t)).length;
  return [...others].sort((a, b) => score(b) - score(a) || b.date.localeCompare(a.date)).slice(0, n);
}

export const formatPostDate = (d: string) => new Date(`${d}T00:00:00+07:00`).toLocaleDateString("id-ID", { dateStyle: "long", timeZone: "Asia/Jakarta" });
