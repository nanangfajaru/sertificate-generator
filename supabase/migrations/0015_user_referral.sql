-- Referral buatan pengguna: satu kode per pengguna, persentase mengikuti pengaturan master.
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.app_settings enable row level security; -- tanpa policy: hanya service role

insert into public.app_settings (key, value)
values ('referral_defaults', '{"discount_percent":25,"commission_percent":50}')
on conflict (key) do nothing;

alter table public.vouchers add column if not exists owner_id uuid references public.profiles (id) on delete cascade;
alter table public.vouchers add column if not exists payout_info text;
create unique index if not exists vouchers_owner_uniq on public.vouchers (owner_id) where owner_id is not null;
