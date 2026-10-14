alter table public.profiles
  add column if not exists phone text,
  add column if not exists organization text,
  add column if not exists job_title text;
