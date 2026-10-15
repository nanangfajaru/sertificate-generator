-- Bungkus auth.uid() dengan (select ...) agar dievaluasi sekali per query, bukan per baris.
alter policy orders_select_own on public.orders using (user_id = (select auth.uid()));
alter policy participants_admin_select on public.participants using (is_admin((select auth.uid())));
alter policy participants_owner_all on public.participants using (exists (select 1 from public.programs p where p.id = participants.program_id and p.owner_id = (select auth.uid()))) with check (exists (select 1 from public.programs p where p.id = participants.program_id and p.owner_id = (select auth.uid())));
alter policy profiles_admin_select on public.profiles using (is_admin((select auth.uid())));
alter policy profiles_select_own on public.profiles using (id = (select auth.uid()));
alter policy designs_admin_select on public.program_designs using (is_admin((select auth.uid())));
alter policy designs_owner_all on public.program_designs using (exists (select 1 from public.programs p where p.id = program_designs.program_id and p.owner_id = (select auth.uid()))) with check (exists (select 1 from public.programs p where p.id = program_designs.program_id and p.owner_id = (select auth.uid())));
alter policy fields_admin_select on public.program_fields using (is_admin((select auth.uid())));
alter policy fields_owner_all on public.program_fields using (exists (select 1 from public.programs p where p.id = program_fields.program_id and p.owner_id = (select auth.uid()))) with check (exists (select 1 from public.programs p where p.id = program_fields.program_id and p.owner_id = (select auth.uid())));
alter policy programs_admin_select on public.programs using (is_admin((select auth.uid())));
alter policy programs_owner_all on public.programs using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create index if not exists programs_design_idx on public.programs (design_id);
