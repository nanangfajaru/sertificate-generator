-- Cek admin di RLS dibungkus subquery agar dievaluasi sekali per query (initPlan), bukan per baris.
alter policy participants_admin_select on public.participants using ((select public.is_admin((select auth.uid()))));
alter policy profiles_admin_select on public.profiles using ((select public.is_admin((select auth.uid()))));
alter policy designs_admin_select on public.program_designs using ((select public.is_admin((select auth.uid()))));
alter policy fields_admin_select on public.program_fields using ((select public.is_admin((select auth.uid()))));
alter policy programs_admin_select on public.programs using ((select public.is_admin((select auth.uid()))));
