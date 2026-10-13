-- Email sistem dikirim dari aplikasi (SMTP sendiri), bukan mailer Supabase.
-- Tabel log untuk membatasi frekuensi pengiriman + fungsi cek status akun (hanya service role).

create table if not exists public.auth_email_log (
  id bigint generated always as identity primary key,
  email text not null,
  kind text not null,
  created_at timestamptz not null default now()
);
create index if not exists auth_email_log_idx on public.auth_email_log (email, kind, created_at desc);
alter table public.auth_email_log enable row level security; -- tanpa policy: hanya service role

create or replace function public.auth_user_status(p_email text)
returns text
language sql stable security definer set search_path = public, auth
as $$
  select coalesce(
    (select case when u.email_confirmed_at is null then 'unconfirmed' else 'confirmed' end
       from auth.users u where lower(u.email) = lower(p_email) limit 1),
    'none');
$$;
revoke all on function public.auth_user_status(text) from public, anon, authenticated;
grant execute on function public.auth_user_status(text) to service_role;
