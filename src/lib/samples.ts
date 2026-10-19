// Contoh sertifikat untuk landing & halaman SEO. Gambar WebP statis dibuat oleh scripts/gen-samples.mts
// sehingga halaman tidak perlu menyertakan SVG sertifikat di HTML-nya.
export const SAMPLE_PROGRAM = {
  org_name: "Universitas Cendekia Nusantara",
  name: "Seminar Nasional Transformasi Digital Pendidikan",
  cert_type: "Peserta",
  description: "atas partisipasinya dalam kegiatan",
  start_date: "2026-10-12",
  end_date: null,
  location: "Jakarta",
  signer1_name: "Dr. Budi Santoso",
  signer1_title: "Ketua Panitia",
  signer2_name: "Prof. Siti Aminah",
  signer2_title: "Dekan",
  mapping: { name: "n", extra: "e" },
};

export type SampleEvent = { name: string; certType: string };

/** `logo`: contoh memakai logo lembaga fiktif (scripts/assets/sample-logo.png). */
export function sampleKey(templateId: string, name: string, event?: SampleEvent, logo = false) {
  const s = `${templateId}|${name}|${event?.name ?? ""}|${event?.certType ?? ""}${logo ? "|logo" : ""}`;
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return `${templateId}-${h.toString(36)}`;
}
