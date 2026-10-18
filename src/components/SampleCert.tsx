import { sampleKey, type SampleEvent } from "@/lib/samples";

export { SAMPLE_PROGRAM } from "@/lib/samples";

// Gambar statis hasil scripts/gen-samples.mts (dilayani dari /public, di-cache panjang).
export default function SampleCert({ templateId, name = "Nama Peserta", className, event, priority }: { templateId: string; name?: string; className?: string; event?: SampleEvent; priority?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/samples/${sampleKey(templateId, name, event)}.webp`}
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
