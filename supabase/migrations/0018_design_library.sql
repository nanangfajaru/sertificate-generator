-- Pustaka desain per pengguna: satu desain sendiri bisa dipakai di banyak program.
-- program_designs kini dimiliki pengguna (owner_id); program_id hanya asal unggahan (boleh null).

alter table public.program_designs add column if not exists owner_id uuid references public.profiles (id) on delete cascade;
update public.program_designs d set owner_id = p.owner_id from public.programs p where p.id = d.program_id and d.owner_id is null;
alter table public.program_designs alter column owner_id set not null;
alter table public.program_designs alter column owner_id set default auth.uid();
create index if not exists program_designs_owner_idx on public.program_designs (owner_id, created_at);

-- Program dihapus: desain tetap ada di pustaka
alter table public.program_designs alter column program_id drop not null;
alter table public.program_designs drop constraint if exists program_designs_program_id_fkey;
alter table public.program_designs add constraint program_designs_program_id_fkey
  foreign key (program_id) references public.programs (id) on delete set null;

alter policy "designs_owner_all" on public.program_designs
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

-- Batas jumlah desain per pengguna: Free 3, Pro 50
create or replace function public.enforce_design_limit()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare v_count int; v_max int;
begin
  select count(*) into v_count from public.program_designs where owner_id = new.owner_id;
  v_max := case when public.is_pro(new.owner_id) then 50 else 3 end;
  if v_count >= v_max then
    raise exception 'PLAN_LIMIT_DESIGNS: batas % desain', v_max using errcode = 'P0001';
  end if;
  return new;
end;
$$;
revoke all on function public.enforce_design_limit() from public, anon, authenticated;
