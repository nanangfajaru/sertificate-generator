-- Program yang dibuat lewat wizard ditandai belum selesai sampai langkah Formulir & sertifikat disimpan.
alter table public.programs add column if not exists setup_done boolean not null default true;
