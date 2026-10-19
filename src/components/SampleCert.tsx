import { sampleKey, type SampleEvent } from "@/lib/samples";

export { SAMPLE_PROGRAM } from "@/lib/samples";

// Gambar statis hasil scripts/gen-samples.mts (dilayani dari /public, di-cache panjang).
// Tersedia varian lebar 400 & 640 px; `sizes` = perkiraan lebar tampil agar browser memilih file terkecil yang cukup.
export default function SampleCert({ templateId, name = "Nama Peserta", className, event, priority, logo, sizes = "(min-width: 1024px) 420px, 90vw" }: { templateId: string; name?: string; className?: string; event?: SampleEvent; priority?: boolean; logo?: boolean; sizes?: string }) {
  const base = `/samples/${sampleKey(templateId, name, event, logo)}`;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`${base}.webp`}
      srcSet={`${base}-400.webp 400w, ${base}-640.webp 640w, ${base}.webp 842w`}
      sizes={sizes}
      alt={`Contoh sertifikat ${name}`}
      width={842}
      height={595}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={className ?? "block h-auto w-full"}
    />
  );
}
