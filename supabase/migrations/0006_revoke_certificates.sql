-- Pencabutan sertifikat: peserta tetap tercatat dengan status "revoked" sehingga tautan/QR
-- menampilkan "Sertifikat telah dicabut" (berbeda dari "tidak ditemukan" untuk data yang dihapus).
alter table public.participants drop constraint if exists participants_status_check;
alter table public.participants add constraint participants_status_check
  check (status in ('pending', 'approved', 'rejected', 'revoked'));
alter table public.participants add column if not exists revoked_at timestamptz;
alter table public.participants add column if not exists revoked_reason text;

-- Catatan: kolom programs.link_valid_days (fitur masa berlaku, sudah dibatalkan) tidak dipakai lagi
-- dan bernilai NULL. Boleh dihapus kapan saja:
--   alter table public.programs drop column if exists link_valid_days;
