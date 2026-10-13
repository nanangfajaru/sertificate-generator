-- Email otomatis ke peserta saat sertifikat terbit (dikirim dari aplikasi via SMTP).
alter table public.programs add column if not exists notify_email boolean not null default true;
alter table public.participants add column if not exists emailed_at timestamptz;
