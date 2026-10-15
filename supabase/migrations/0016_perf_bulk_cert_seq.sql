-- Nomor sertifikat untuk banyak peserta sekaligus (satu round-trip), hanya untuk service role.
create or replace function public.next_cert_seq_n(p_program uuid, p_n integer)
returns integer language sql security definer set search_path to 'public' as $$
  update public.programs set cert_seq = cert_seq + greatest(p_n, 0) where id = p_program returning cert_seq;
$$;
revoke all on function public.next_cert_seq_n(uuid, integer) from public, anon, authenticated;
grant execute on function public.next_cert_seq_n(uuid, integer) to service_role;
revoke all on function public.next_cert_seq(uuid) from public, anon, authenticated;
grant execute on function public.next_cert_seq(uuid) to service_role;
create index if not exists participants_program_status_idx on public.participants (program_id, status);
