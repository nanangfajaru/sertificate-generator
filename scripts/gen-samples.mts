// Jalankan: NODE_OPTIONS=--conditions=react-server npx tsx scripts/gen-samples.mts
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { SAMPLE_PROGRAM, sampleKey, type SampleEvent } from "../src/lib/samples";
import { SEO_PAGES } from "../src/lib/seo-pages";
import { getTemplate } from "../src/lib/certificate/templates";
import { resolveLayout } from "../src/lib/certificate/sources";
import { renderCertificatePdf } from "../src/lib/certificate/pdf";
import { brandLayout } from "../src/lib/certificate/branding";
import type { Item, Layout } from "../src/lib/certificate/types";

const jobs = new Map<string, { t: string; name: string; ev?: SampleEvent; logo?: boolean }>();
const add = (t: string, name = "Nama Peserta", ev?: SampleEvent, logo = false) => jobs.set(sampleKey(t, name, ev, logo), { t, name, ev, logo });
add("modern-teal", "Budi Hartono"); add("frame-crimson", "Citra Lestari"); add("classic-navy", "Aisyah Putri Rahma");
// Galeri template landing: dengan penanda "LOGO".
for (const t of ["classic-navy", "flora-rose", "sport-futsal", "frame-crimson", "medic-cross", "company-skyline", "modern-teal", "batik-kawung"]) add(t, undefined, undefined, true);
for (const p of SEO_PAGES) {
  add(p.templates[1], "Citra Lestari", p.sampleEvent);
  add(p.templates[0], "Aisyah Putri", p.sampleEvent);
  for (const t of p.templates) add(t, "Nama Peserta", p.sampleEvent);
}
const tmp = process.argv[2] ?? "/tmp/samples-tmp";
fs.mkdirSync(tmp, { recursive: true });
fs.mkdirSync("public/samples", { recursive: true });
// Penanda "LOGO" seperti pratinjau di dashboard (CertificateSvg logoPlaceholder).
const logoPlaceholder = (l: Layout): Layout => ({
  ...l,
  items: l.items.map((i): Item =>
    i.type === "image" && i.src === "logo"
      ? { type: "text", x: i.x + i.w / 2, y: i.y + i.h / 2 + i.h * 0.16, size: Math.max(14, i.h * 0.48), font: "sans-bold", color: "#94a3b8", align: "center", text: "LOGO", spacing: i.h * 0.12 }
      : i,
  ),
});
// Hanya membuat gambar yang belum ada (hapus file di public/samples untuk membuat ulang).
for (const [key, j] of jobs) {
  if (fs.existsSync(`public/samples/${key}.webp`)) continue;
  const base = getTemplate(j.t).layout;
  const layout = resolveLayout(j.logo ? logoPlaceholder(brandLayout(base, { certMode: "template", templateId: j.t, logo: true, sig1: false, sig2: false })) : base, {
    program: j.ev ? { ...SAMPLE_PROGRAM, name: j.ev.name, cert_type: j.ev.certType } : SAMPLE_PROGRAM,
    data: { n: j.name, e: "" },
    certNumber: "001/SERT/X/2026",
    verifyUrl: "https://sertifikatku.com/c/contoh",
  });
  const pdf = await renderCertificatePdf(layout, null, {});
  fs.writeFileSync(`${tmp}/${key}.pdf`, pdf);
  execFileSync("pdftoppm", ["-r", "72", "-png", "-singlefile", `${tmp}/${key}.pdf`, `${tmp}/${key}`]);
}
execFileSync("python3", ["-I", "-c", `
import sys,glob,os
from PIL import Image
tmp=sys.argv[1]
for f in glob.glob(tmp+'/*.png'):
    im=Image.open(f).convert('RGB')
    base='public/samples/'+os.path.basename(f)[:-4]
    im.save(base+'.webp','WEBP',quality=80,method=6)
    # Varian kecil untuk srcSet (lihat SampleCert).
    for w in (400, 640):
        im.resize((w, round(im.height*w/im.width)), Image.LANCZOS).save(f'{base}-{w}.webp','WEBP',quality=80,method=6)
`, tmp]);
console.log(jobs.size, "samples");
