-- Program baru dari menu Program dimulai tanpa sertifikat terpilih; wajib dipilih di langkah terakhir wizard.
alter table public.programs add column if not exists cert_chosen boolean not null default true;
