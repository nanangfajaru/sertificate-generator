-- Peran per peserta (Peserta, Pembicara, Narasumber, ...). Peran selain Peserta tidak dihitung kuota Free.
alter table public.participants add column if not exists role text not null default 'Peserta';

create or replace function public.enforce_participant_limit()
 returns trigger
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare v_owner uuid;
begin
  if coalesce(new.role, 'Peserta') <> 'Peserta' then
    return new;
  end if;
  select owner_id into v_owner from public.programs where id = new.program_id;
  if v_owner is not null and not public.is_pro(v_owner) then
    if (select count(*) from public.participants where program_id = new.program_id and role = 'Peserta') >= 100 then
      raise exception 'PLAN_LIMIT_PARTICIPANTS: paket Free dibatasi 100 peserta per program' using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$function$;
