-- =============================================================
-- 0060_announcement_reads_admin_select.sql
-- Bug-Fix: Read-Counter "X haben gelesen" zeigte immer max. 1
--
-- Ursache: 0014_announcements.sql hatte nur eine SELECT-Policy
--   "announcement_reads_select_own"  using (auth.uid() = user_id)
-- Damit konnte jeder User NUR seine eigenen Read-Records sehen.
-- ladeReadCounts() hat für Admins/Fuehrungskraefte deshalb nur
-- eigene Reads gezaehlt -- nicht alle.
--
-- Fix: Zusaetzliche SELECT-Policy für fuehrungskraft+, damit die
-- Admin-Sicht alle Read-Records zählen kann.
-- =============================================================

drop policy if exists "announcement_reads_select_admin"
  on public.user_announcement_reads;

create policy "announcement_reads_select_admin"
  on public.user_announcement_reads for select
  to authenticated
  using (public.is_staff_or_higher());
