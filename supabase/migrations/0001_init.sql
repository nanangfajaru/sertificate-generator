-- Sertifikat Online: skema awal
-- Jalankan di Supabase SQL Editor (atau `supabase db push`).

create extension if not exists pgcrypto;

-- ───────────────────────────── profiles ─────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  plan_expires_at timestamptz,            -- null = tidak kedaluwarsa (diisi payment gateway nanti)
  created_at timestamptz not null default now()
);

create or replace function public.is_pro(uid uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce(
    (select p.plan = 'pro' and (p.plan_expires_at is null or p.plan_expires_at > now())
       from public.profiles p
     where p.id = uid and (auth.uid() is null or auth.uid() = uid)),
    false);
$$;
revoke all on function public.is_pro(uuid) from public, anon;
grant execute on function public.is_pro(uuid) to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ───────────────────────────── programs ─────────────────────────────
create table public.programs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  slug text not null unique,
  -- data acara
  name text not null,                      -- nama kegiatan
  org_name text not null,                  -- nama instansi
  cert_type text not null default 'Peserta',
  description text not null default 'atas partisipasinya dalam kegiatan',
  start_date date not null,
  end_date date,
  location text,
  number_format text not null default '{no}/SERT/{bulan}/{tahun}',
  cert_seq int not null default 0,
  signer1_name text,
  signer1_title text,
  signer2_name text,
  signer2_title text,
  -- pengaturan alur
  approval_mode text not null default 'auto' check (approval_mode in ('auto', 'manual')),
  is_open boolean not null default true,
  -- sertifikat
  cert_mode text not null default 'template' check (cert_mode in ('template', 'custom')),
  template_id text not null default 'classic-navy',
  mapping jsonb not null default '{}'::jsonb,   -- {slot: form_field_id}, mis. {"name": "...", "extra": "..."}
  show_qr boolean not null default true,
  design_path text,                        -- path di bucket "designs" (file asli pdf/png/jpg)
  design_preview_path text,                -- path png pratinjau
  design_kind text check (design_kind in ('pdf', 'png', 'jpg')),
  design_layout jsonb,                     -- layout teks untuk desain sendiri
  created_at timestamptz not null default now()
);

create index programs_owner_idx on public.programs (owner_id, created_at desc);

-- Batas paket: Free maksimal 5 program, desain sendiri hanya Pro.
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
  if (new.cert_mode = 'custom' or new.design_path is not null)
     and not public.is_pro(new.owner_id) then
    raise exception 'PLAN_LIMIT_CUSTOM_DESIGN: upload desain sendiri hanya untuk paket Pro' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
revoke all on function public.enforce_program_rules() from public, anon, authenticated;

create trigger programs_rules
  before insert or update on public.programs
  for each row execute function public.enforce_program_rules();

-- Nomor sertifikat berurutan (atomik)
create or replace function public.next_cert_seq(p_program uuid)
returns int
language sql security definer set search_path = public
as $$
  update public.programs set cert_seq = cert_seq + 1 where id = p_program returning cert_seq;
$$;
revoke all on function public.next_cert_seq(uuid) from public, anon, authenticated;

-- ───────────────────────────── form fields ─────────────────────────────
create table public.program_fields (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs (id) on delete cascade,
  label text not null,
  type text not null default 'text' check (type in ('text', 'email', 'tel', 'number', 'date', 'textarea', 'select')),
  required boolean not null default false,
  options jsonb not null default '[]'::jsonb,   -- untuk type=select
  sort int not null default 0
);
create index program_fields_program_idx on public.program_fields (program_id, sort);

-- ───────────────────────────── participants ─────────────────────────────
create table public.participants (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs (id) on delete cascade,
  code text not null unique,                    -- kode publik untuk link sertifikat / verifikasi
  data jsonb not null default '{}'::jsonb,      -- {field_id: nilai}
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  cert_number text,
  created_at timestamptz not null default now(),
  approved_at timestamptz
);
create index participants_program_idx on public.participants (program_id, created_at);

-- ───────────────────────────── RLS ─────────────────────────────
-- Halaman publik (form peserta, sertifikat) diakses lewat server memakai service role,
-- jadi anon tidak punya akses langsung ke tabel apa pun.
alter table public.profiles enable row level security;
alter table public.programs enable row level security;
alter table public.program_fields enable row level security;
alter table public.participants enable row level security;

-- profiles: baca sendiri. Tidak ada policy update => plan hanya bisa diubah service role / SQL editor.
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (id = auth.uid());

create policy "programs_owner_all" on public.programs
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "fields_owner_all" on public.program_fields
  for all to authenticated
  using (exists (select 1 from public.programs p where p.id = program_id and p.owner_id = auth.uid()))
  with check (exists (select 1 from public.programs p where p.id = program_id and p.owner_id = auth.uid()));

create policy "participants_owner_all" on public.participants
  for all to authenticated
  using (exists (select 1 from public.programs p where p.id = program_id and p.owner_id = auth.uid()))
  with check (exists (select 1 from public.programs p where p.id = program_id and p.owner_id = auth.uid()));

-- ───────────────────────────── storage ─────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('designs', 'designs', false, 10485760,
        array['application/pdf', 'image/png', 'image/jpeg'])
on conflict (id) do nothing;

-- Pengguna Pro boleh mengelola file di folder miliknya: designs/{user_id}/...
create policy "designs_pro_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'designs'
              and (storage.foldername(name))[1] = auth.uid()::text
              and public.is_pro(auth.uid()));

create policy "designs_owner_select" on storage.objects
  for select to authenticated
  using (bucket_id = 'designs' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "designs_owner_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'designs' and (storage.foldername(name))[1] = auth.uid()::text);

-- ───────────────────────────── cara menjadikan user Pro (manual) ─────────────────────────────
-- update public.profiles set plan = 'pro' where email = 'user@example.com';
