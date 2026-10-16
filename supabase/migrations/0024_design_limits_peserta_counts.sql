-- Batas desain sendiri: Free 5 (bisa dibuat & diedit, tidak bisa dipakai), Pro 50.
create or replace function public.enforce_design_limit()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare v_count int; v_max int;
begin
  select count(*) into v_count from public.program_designs where owner_id = new.owner_id;
  v_max := case when public.is_pro(new.owner_id) then 50 else 5 end;
  if v_count >= v_max then
    raise exception 'PLAN_LIMIT_DESIGNS: batas % desain', v_max using errcode = 'P0001';
  end if;
  return new;
end;
$$;

-- Jumlah peserta berperan "Peserta" per program (tampilan kuota). security invoker: RLS tetap berlaku.
create or replace function public.peserta_counts(p_ids uuid[])
returns table(program_id uuid, n bigint)
language sql stable security invoker set search_path = public
as $$
  select p.program_id, count(*) from public.participants p
  where p.program_id = any(p_ids) and p.role = 'Peserta'
  group by p.program_id
$$;
grant execute on function public.peserta_counts(uuid[]) to authenticated;
