// Jalankan: NODE_OPTIONS=--conditions=react-server npx tsx scripts/gen-samples.mts
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { SAMPLE_PROGRAM, sampleKey, type SampleEvent } from "../src/lib/samples";
import { SEO_PAGES } from "../src/lib/seo-pages";
import { getTemplate } from "../src/lib/certificate/templates";
import { resolveLayout } from "../src/lib/certificate/sources";
import { renderCertificatePdf } from "../src/lib/certificate/pdf";

const jobs = new Map<string, { t: string; name: string; ev?: SampleEvent }>();
const add = (t: string, name = "Nama Peserta", ev?: SampleEvent) => jobs.set(sampleKey(t, name, ev), { t, name, ev });
add("modern-teal", "Budi Hartono"); add("frame-crimson", "Citra Lestari"); add("classic-navy", "Aisyah Putri Rahma");
for (const t of ["classic-navy", "flora-rose", "sport-futsal", "frame-crimson", "medic-cross", "company-skyline", "modern-teal", "batik-kawung"]) add(t);
for (const p of SEO_PAGES) {
  add(p.templates[1], "Citra Lestari", p.sampleEvent);
  add(p.templates[0], "Aisyah Putri", p.sampleEvent);
  for (const t of p.templates) add(t, "Nama Peserta", p.sampleEvent);
}
const tmp = process.argv[2] ?? "/tmp/samples-tmp";
fs.mkdirSync(tmp, { recursive: true });
fs.mkdirSync("public/samples", { recursive: true });
for (const [key, j] of jobs) {
  const layout = resolveLayout(getTemplate(j.t).layout, {
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
