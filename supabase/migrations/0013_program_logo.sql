-- Logo penyelenggara (file di bucket privat "signatures").
alter table public.programs add column if not exists logo_path text;
