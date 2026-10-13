-- Batas paket Free: 10 program, tidak bisa hapus program, 100 peserta per program.

create or replace function public.enforce_program_rules()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' and not public.is_pro(new.owner_id) then
    if (select count(*) from public.programs where owner_id = new.owner_id) >= 10 then
      raise exception 'PLAN_LIMIT_PROGRAMS: paket Free dibatasi 10 program' using errcode = 'P0001';
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

-- Free tidak boleh menghapus program (hanya saat dilakukan langsung oleh pemiliknya; penghapusan akun/admin tetap jalan).
create or replace function public.block_free_program_delete()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if auth.uid() is not null and auth.uid() = old.owner_id and not public.is_pro(old.owner_id) then
    raise exception 'PLAN_LIMIT_DELETE: paket Free tidak dapat menghapus program' using errcode = 'P0001';
  end if;
  return old;
end;
$$;
revoke all on function public.block_free_program_delete() from public, anon, authenticated;

drop trigger if exists programs_block_delete on public.programs;
create trigger programs_block_delete
  before delete on public.programs
  for each row execute function public.block_free_program_delete();

-- Free maksimal 100 peserta per program.
create or replace function public.enforce_participant_limit()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare v_owner uuid;
begin
  select owner_id into v_owner from public.programs where id = new.program_id;
  if v_owner is not null and not public.is_pro(v_owner) then
    if (select count(*) from public.participants where program_id = new.program_id) >= 100 then
      raise exception 'PLAN_LIMIT_PARTICIPANTS: paket Free dibatasi 100 peserta per program' using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;
revoke all on function public.enforce_participant_limit() from public, anon, authenticated;

drop trigger if exists participants_limit on public.participants;
create trigger participants_limit
  before insert on public.participants
  for each row execute function public.enforce_participant_limit();
