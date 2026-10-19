// Jalankan: NODE_OPTIONS=--conditions=react-server npx tsx scripts/gen-samples.mts
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { SAMPLE_PROGRAM, sampleKey, type SampleEvent } from "../src/lib/samples";
import { SEO_PAGES } from "../src/lib/seo-pages";
import { getTemplate } from "../src/lib/certificate/templates";
import { resolveLayout } from "../src/lib/certificate/sources";
import { renderCertificatePdf } from "../src/lib/certificate/pdf";
import { brandLayout } from "../src/lib/certificate/branding";

const jobs = new Map<string, { t: string; name: string; ev?: SampleEvent; logo?: boolean }>();
const add = (t: string, name = "Nama Peserta", ev?: SampleEvent, logo = false) => jobs.set(sampleKey(t, name, ev, logo), { t, name, ev, logo });
add("modern-teal", "Budi Hartono"); add("frame-crimson", "Citra Lestari"); add("classic-navy", "Aisyah Putri Rahma");
// Galeri template landing: dengan logo lembaga fiktif.
for (const t of ["classic-navy", "flora-rose", "sport-futsal", "frame-crimson", "medic-cross", "company-skyline", "modern-teal", "batik-kawung"]) add(t, undefined, undefined, true);
for (const p of SEO_PAGES) {
  add(p.templates[1], "Citra Lestari", p.sampleEvent);
  add(p.templates[0], "Aisyah Putri", p.sampleEvent);
  for (const t of p.templates) add(t, "Nama Peserta", p.sampleEvent);
}
const tmp = process.argv[2] ?? "/tmp/samples-tmp";
fs.mkdirSync(tmp, { recursive: true });
fs.mkdirSync("public/samples", { recursive: true });
const logo = { kind: "png" as const, bytes: new Uint8Array(fs.readFileSync("scripts/assets/sample-logo.png")) };
// Hanya membuat gambar yang belum ada (hapus file di public/samples untuk membuat ulang).
for (const [key, j] of jobs) {
  if (fs.existsSync(`public/samples/${key}.webp`)) continue;
  const base = getTemplate(j.t).layout;
  const layout = resolveLayout(j.logo ? brandLayout(base, { certMode: "template", templateId: j.t, logo: true, sig1: false, sig2: false }) : base, {
    program: j.ev ? { ...SAMPLE_PROGRAM, name: j.ev.name, cert_type: j.ev.certType } : SAMPLE_PROGRAM,
    data: { n: j.name, e: "" },
    certNumber: "001/SERT/X/2026",
    verifyUrl: "https://sertifikatku.com/c/contoh",
  });
  const pdf = await renderCertificatePdf(layout, null, j.logo ? { logo } : {});
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
