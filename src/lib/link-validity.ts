/**
 * Masa berlaku tautan sertifikat: `link_valid_days` hari sejak disetujui (approved_at),
 * berakhir pada akhir hari (23:59:59 WIB) tanggal tersebut. Tanpa pengaturan = tanpa batas.
 * Fungsi murni, aman dipakai di server maupun klien.
 */
const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const WIB = 7 * 3600_000;

export function linkExpiry(days: number | null | undefined, approvedAt: string | null | undefined, createdAt?: string | null): Date | null {
  const base = approvedAt ?? createdAt;
  if (!days || !base) return null;
  const j = new Date(new Date(base).getTime() + days * 86_400_000 + WIB); // jam dinding WIB
  return new Date(Date.UTC(j.getUTCFullYear(), j.getUTCMonth(), j.getUTCDate(), 23, 59, 59) - WIB);
}

export function formatExpiry(d: Date) {
  const j = new Date(d.getTime() + WIB);
  return `${j.getUTCDate()} ${BULAN[j.getUTCMonth()]} ${j.getUTCFullYear()}`;
}

export type LinkState = "valid" | "expired" | "pending" | "rejected";

export function linkState(
  p: { status: "pending" | "approved" | "rejected"; approved_at: string | null; created_at: string },
  days: number | null | undefined,
  now: Date = new Date(),
): { state: LinkState; expiry: Date | null } {
  if (p.status !== "approved") return { state: p.status === "pending" ? "pending" : "rejected", expiry: null };
  const expiry = linkExpiry(days, p.approved_at, p.created_at);
  return { state: expiry && now.getTime() > expiry.getTime() ? "expired" : "valid", expiry };
}

export const VALIDITY_PRESETS: { value: number | null; label: string }[] = [
  { value: null, label: "Tanpa batas waktu" },
  { value: 30, label: "30 hari" },
  { value: 60, label: "60 hari" },
  { value: 90, label: "90 hari (3 bulan)" },
  { value: 180, label: "180 hari (6 bulan)" },
  { value: 365, label: "365 hari (1 tahun)" },
  { value: 730, label: "730 hari (2 tahun)" },
];
