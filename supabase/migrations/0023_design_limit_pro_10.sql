-- Batas desain sendiri per pengguna: Free 3, Pro 10.
create or replace function public.enforce_design_limit()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare v_count int; v_max int;
begin
  select count(*) into v_count from public.program_designs where owner_id = new.owner_id;
  v_max := case when public.is_pro(new.owner_id) then 10 else 3 end;
  if v_count >= v_max then
    raise exception 'PLAN_LIMIT_DESIGNS: batas % desain', v_max using errcode = 'P0001';
  end if;
  return new;
end;
$$;
