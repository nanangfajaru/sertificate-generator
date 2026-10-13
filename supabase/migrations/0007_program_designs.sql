-- Beberapa desain sendiri per program. Semua pengguna boleh membuat/menyimpan desain;
-- hanya Pro yang boleh MENGGUNAKANNYA untuk sertifikat (snapshot ke programs.design_*).

create table if not exists public.program_designs (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs (id) on delete cascade,
  name text not null default 'Desain baru',
  file_path text not null,
  preview_path text not null,
  kind text not null check (kind in ('pdf', 'png', 'jpg')),
  layout jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists program_designs_program_idx on public.program_designs (program_id, created_at);
alter table public.program_designs enable row level security;

create policy "designs_owner_all" on public.program_designs
  for all to authenticated
  using (exists (select 1 from public.programs p where p.id = program_id and p.owner_id = auth.uid()))
  with check (exists (select 1 from public.programs p where p.id = program_id and p.owner_id = auth.uid()));

create policy "designs_admin_select" on public.program_designs
  for select to authenticated using (public.is_admin(auth.uid()));

-- Desain yang sedang dipakai (isi snapshot-nya disalin ke programs.design_* agar pipeline PDF tidak berubah)
alter table public.programs add column if not exists design_id uuid references public.program_designs (id) on delete set null;

-- Batas jumlah desain: Free 3, Pro 20 per program
create or replace function public.enforce_design_limit()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare v_owner uuid; v_count int; v_max int;
begin
  select owner_id into v_owner from public.programs where id = new.program_id;
  select count(*) into v_count from public.program_designs where program_id = new.program_id;
  v_max := case when public.is_pro(v_owner) then 20 else 3 end;
  if v_count >= v_max then
    raise exception 'PLAN_LIMIT_DESIGNS: batas % desain per program', v_max using errcode = 'P0001';
  end if;
  return new;
end;
$$;
revoke all on function public.enforce_design_limit() from public, anon, authenticated;

create trigger program_designs_limit
  before insert on public.program_designs
  for each row execute function public.enforce_design_limit();

-- Storage: semua pemilik boleh mengunggah ke foldernya (policy lama khusus Pro tetap ada; policy permisif digabung OR)
create policy "designs_owner_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'designs' and (storage.foldername(name))[1] = auth.uid()::text);

-- Aturan program: menggunakan desain sendiri hanya Pro. Diperiksa saat beralih ke mode custom
-- atau mengganti file desain aktif; pembaruan lain pada program lama tidak terblokir.
create or replace function public.enforce_program_rules()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' and not public.is_pro(new.owner_id) then
    if (select count(*) from public.programs where owner_id = new.owner_id) >= 5 then
      raise exception 'PLAN_LIMIT_PROGRAMS: paket Free dibatasi 5 program' using errcode = 'P0001';
    end if;
  end if;
  if new.cert_mode = 'custom' and not public.is_pro(new.owner_id) then
    if tg_op = 'INSERT' or old.cert_mode is distinct from 'custom' or new.design_path is distinct from old.design_path then
      raise exception 'PLAN_LIMIT_CUSTOM_DESIGN: menggunakan desain sendiri hanya untuk paket Pro' using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;

-- Pindahkan desain tunggal lama (programs.design_*) ke tabel baru
insert into public.program_designs (program_id, name, file_path, preview_path, kind, layout)
select id, 'Desain 1', design_path, design_preview_path, design_kind, design_layout
from public.programs
where design_path is not null and design_preview_path is not null and design_kind is not null
  and design_layout is not null and design_id is null;

update public.programs p set design_id = d.id
from public.program_designs d
where d.program_id = p.id and p.design_id is null and p.design_path = d.file_path;
