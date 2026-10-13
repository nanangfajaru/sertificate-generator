-- Admin owner: dapat melihat seluruh data. Perubahan paket dilakukan lewat server (service role).

alter table public.profiles add column if not exists is_admin boolean not null default false;

create or replace function public.is_admin(uid uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce(
    (select p.is_admin from public.profiles p
      where p.id = uid and (auth.uid() is null or auth.uid() = uid)),
    false);
$$;
revoke all on function public.is_admin(uuid) from public, anon;
grant execute on function public.is_admin(uuid) to authenticated;

create policy "profiles_admin_select" on public.profiles
  for select to authenticated using (public.is_admin(auth.uid()));

create policy "programs_admin_select" on public.programs
  for select to authenticated using (public.is_admin(auth.uid()));

create policy "fields_admin_select" on public.program_fields
  for select to authenticated using (public.is_admin(auth.uid()));

create policy "participants_admin_select" on public.participants
  for select to authenticated using (public.is_admin(auth.uid()));

-- Menjadikan seseorang admin (jalankan manual di SQL Editor, atau pakai `npm run seed`):
-- update public.profiles set is_admin = true, plan = 'pro', plan_expires_at = null where email = 'owner@example.com';
