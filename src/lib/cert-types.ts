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

/** Peran bawaan pendaftar lewat link publik. */
export const DEFAULT_ROLE = "Peserta";
/** Peran yang biasa ditambahkan manual oleh penyelenggara. */
export const MANUAL_ROLES = ["Pembicara", "Narasumber", "Moderator", "Panitia", "Juri", "Instruktur", "Pemakalah"];

/** Kalimat sertifikat untuk sebuah peran (preset bila ada, selain itu dibentuk dari nama perannya). */
export function roleDescription(role: string) {
  return presetDescription(role) ?? `atas kontribusinya sebagai ${role.toLowerCase()} dalam kegiatan`;
}

/**
 * Jenis & kalimat sertifikat mengikuti peran peserta. Peran "Peserta" memakai pengaturan program
 * (yang bisa sudah diubah penyelenggara); peran lain memakai judul & kalimatnya sendiri.
 */
export function withRole<T extends { cert_type: string; description: string }>(program: T, role: string | null | undefined): T {
  const r = (role ?? "").trim();
  if (!r || r === DEFAULT_ROLE) return program;
  return { ...program, cert_type: r, description: roleDescription(r) };
}

/** Rapikan input peran: kosong → Peserta, huruf awal kapital, maks 40 karakter. */
export function normRole(raw: unknown) {
  const r = String(raw ?? "").replace(/\s+/g, " ").trim().slice(0, 40);
  if (!r) return DEFAULT_ROLE;
  const preset = [DEFAULT_ROLE, ...MANUAL_ROLES, ...CERT_TYPES.map((t) => t.value)].find((p) => p.toLowerCase() === r.toLowerCase());
  return preset ?? r.charAt(0).toUpperCase() + r.slice(1);
}
