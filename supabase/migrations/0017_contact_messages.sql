-- Pesan dari halaman Hubungi kami; hanya dibaca/ditulis lewat service role (tanpa policy).
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  org text,
  topic text not null,
  message text not null,
  status text not null default 'baru' check (status in ('baru', 'dibalas', 'selesai')),
  emailed boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists contact_messages_created_idx on public.contact_messages (created_at desc);
alter table public.contact_messages enable row level security;
