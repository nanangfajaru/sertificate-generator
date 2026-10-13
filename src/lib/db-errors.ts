import { FREE_PROGRAM_LIMIT } from "./db";

/** Pesan pengguna untuk error aturan paket yang dilempar trigger database. */
export function dbError(message: string) {
  if (message.includes("PLAN_LIMIT_PROGRAMS")) return `Paket Free dibatasi ${FREE_PROGRAM_LIMIT} program. Upgrade ke Pro untuk program tanpa batas.`;
  if (message.includes("PLAN_LIMIT_CUSTOM_DESIGN")) return "Menggunakan desain sendiri untuk sertifikat hanya tersedia di paket Pro.";
  if (message.includes("PLAN_LIMIT_DESIGNS")) return "Batas jumlah desain tercapai (Free 3, Pro 20 per program). Hapus desain yang tidak dipakai.";
  return "Terjadi kesalahan, silakan coba lagi.";
}
