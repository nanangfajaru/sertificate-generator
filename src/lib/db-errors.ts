import { FREE_PARTICIPANT_LIMIT, FREE_PROGRAM_LIMIT } from "./db";

/** Pesan pengguna untuk error aturan paket yang dilempar trigger database. */
export function dbError(message: string) {
  if (message.includes("PLAN_LIMIT_PROGRAMS")) return `Paket Free dibatasi ${FREE_PROGRAM_LIMIT} program. Upgrade ke Pro untuk program tanpa batas.`;
  if (message.includes("PLAN_LIMIT_PARTICIPANTS")) return `Kuota ${FREE_PARTICIPANT_LIMIT} peserta untuk program ini sudah penuh.`;
  if (message.includes("PLAN_LIMIT_DELETE")) return "Paket Free tidak dapat menghapus program. Upgrade ke Pro untuk menghapus.";
  if (message.includes("PLAN_LIMIT_CUSTOM_DESIGN")) return "Menggunakan desain sendiri untuk sertifikat hanya tersedia di paket Pro.";
  if (message.includes("PLAN_LIMIT_DESIGNS")) return "Batas jumlah desain tercapai (Free 3, Pro 20 per program). Hapus desain yang tidak dipakai.";
  if (message.includes("row-level security")) return "Anda tidak memiliki akses untuk mengubah program ini.";
  return "Terjadi kesalahan, silakan coba lagi.";
}
