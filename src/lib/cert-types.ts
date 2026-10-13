/** Jenis sertifikat bawaan beserta kalimat deskripsi yang cocok. */
export const CERT_TYPES: { value: string; description: string }[] = [
  { value: "Peserta", description: "atas partisipasinya dalam kegiatan" },
  { value: "Panitia", description: "atas kontribusinya sebagai panitia dalam kegiatan" },
  { value: "Pembicara", description: "atas kontribusinya sebagai pembicara dalam kegiatan" },
  { value: "Narasumber", description: "atas kontribusinya sebagai narasumber dalam kegiatan" },
  { value: "Moderator", description: "atas kontribusinya sebagai moderator dalam kegiatan" },
  { value: "Juri", description: "atas kontribusinya sebagai juri dalam kegiatan" },
  { value: "Instruktur", description: "atas kontribusinya sebagai instruktur dalam kegiatan" },
  { value: "Relawan", description: "atas partisipasinya sebagai relawan dalam kegiatan" },
  { value: "Pemakalah", description: "atas partisipasinya sebagai pemakalah dalam kegiatan" },
  { value: "Juara 1", description: "atas prestasinya dalam kegiatan" },
  { value: "Juara 2", description: "atas prestasinya dalam kegiatan" },
  { value: "Juara 3", description: "atas prestasinya dalam kegiatan" },
  { value: "Lulus", description: "telah dinyatakan lulus dari program" },
  { value: "Magang", description: "telah menyelesaikan program magang pada" },
];

export const CUSTOM_TYPE = "__custom__";

export function presetDescription(type: string): string | undefined {
  return CERT_TYPES.find((t) => t.value === type)?.description;
}

export function isPresetType(type: string) {
  return CERT_TYPES.some((t) => t.value === type);
}
