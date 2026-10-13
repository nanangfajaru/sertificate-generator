-- Masa berlaku tautan sertifikat per program (hari sejak sertifikat diterbitkan). NULL = tanpa batas.
alter table public.programs add column if not exists link_valid_days int
  check (link_valid_days is null or (link_valid_days between 1 and 3650));
