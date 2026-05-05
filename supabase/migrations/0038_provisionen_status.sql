-- =============================================================
-- 0038_provisionen_status.sql
-- Status-Workflow + Stornos für Provisions-Einträge.
--
-- Lifecycle:
--   eingereicht  -> genehmigt    (Admin: approve)
--                -> abgelehnt    (Admin: reject mit Notiz)
--   genehmigt    -> storniert    (Admin: storno -> erzeugt zusätzlich
--                                  einen neuen Storno-Eintrag mit
--                                  negativen Beträgen)
--
-- Vertriebler darf nur 'eingereicht' editieren/löschen. Sobald
-- 'genehmigt' (oder 'abgelehnt' oder 'storniert'): nur Admin.
--
-- Provisions-Aggregation im App-Layer rechnet ab jetzt nur
-- status='genehmigt'-Einträge. Storno-Einträge sind ebenfalls
-- 'genehmigt' aber mit negativen Beträgen → Netting passiert
-- automatisch in der Summe.
-- =============================================================

alter table public.commission_entries
  add column if not exists status text not null default 'eingereicht'
    check (status in ('eingereicht','genehmigt','abgelehnt','storniert')),
  add column if not exists reviewed_by uuid references public.profiles(id) on delete set null,
  add column if not exists reviewed_at timestamptz,
  add column if not exists review_note text,
  add column if not exists storno_von_id uuid references public.commission_entries(id) on delete set null,
  add column if not exists storno_grund text;

create index if not exists commission_entries_status_idx
  on public.commission_entries (status, datum desc);

create index if not exists commission_entries_storno_von_idx
  on public.commission_entries (storno_von_id)
  where storno_von_id is not null;

-- Bestehende Einträge gelten als genehmigt (sonst wären alle alten
-- Daten plötzlich "ausstehend" und würden aus der Provisions-Summe
-- rausfallen).
update public.commission_entries
   set status = 'genehmigt',
       reviewed_at = coalesce(reviewed_at, created_at)
 where status = 'eingereicht';

-- =============================================================
-- RLS-Policies anpassen: Vertriebler darf nur 'eingereicht'
-- editieren/löschen. Admin alles.
-- =============================================================

drop policy if exists "entries_update_own_or_admin" on public.commission_entries;
create policy "entries_update_own_or_admin"
  on public.commission_entries for update
  to authenticated
  using (
    public.is_admin()
    or (vertriebler_id = auth.uid() and status = 'eingereicht')
  )
  with check (
    public.is_admin()
    or (vertriebler_id = auth.uid() and status = 'eingereicht')
  );

drop policy if exists "entries_delete_own_or_admin" on public.commission_entries;
create policy "entries_delete_own_or_admin"
  on public.commission_entries for delete
  to authenticated
  using (
    public.is_admin()
    or (vertriebler_id = auth.uid() and status = 'eingereicht')
  );
