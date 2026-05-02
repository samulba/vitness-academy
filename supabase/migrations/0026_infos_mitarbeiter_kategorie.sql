-- =============================================================
-- 0026_infos_mitarbeiter_kategorie.sql
-- Erweiterung Wichtige Infos:
--   - category-Spalte (5 fixe Werte) fuer bessere Filterung
--   - Mitarbeiter duerfen eigene Infos posten (importance info+warning,
--     pinned=false). Critical + Pin bleibt Admin/Studioleitung.
--   - notify_info_neu: nur bei warning/critical Notification raushauen,
--     damit kleiner Mitarbeiter-Tipp nicht 30 Notifications ausloest.
-- =============================================================

-- 1) Kategorie-Spalte
alter table public.studio_announcements
  add column if not exists category text not null default 'allgemein';

-- Constraint mit den 5 erlaubten Kategorien
alter table public.studio_announcements
  drop constraint if exists studio_announcements_category_check;
alter table public.studio_announcements
  add constraint studio_announcements_category_check
  check (category in ('allgemein','geraete','schicht','mitglieder','sonstiges'));

create index if not exists studio_announcements_category_idx
  on public.studio_announcements (category);

-- 2) RLS umbauen -- Mitarbeiter darf eigene posten/aendern/loeschen
--    SELECT bleibt unveraendert (announcements_select_authed)
--    Bestehende Admin-Write-Policy umbenennen fuer Klarheit
drop policy if exists "announcements_admin_write" on public.studio_announcements;
create policy "infos_admin_all"
  on public.studio_announcements for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- INSERT: Mitarbeiter darf eigene posten, aber kein critical, kein pinned
drop policy if exists "infos_user_insert" on public.studio_announcements;
create policy "infos_user_insert"
  on public.studio_announcements for insert
  to authenticated
  with check (
    auth.uid() = author_id
    and importance in ('info','warning')
    and pinned = false
  );

-- UPDATE: Mitarbeiter darf eigene editieren (Tippfehler etc.)
--   Importance darf nicht zu critical eskaliert werden, pinned bleibt false
drop policy if exists "infos_user_update_own" on public.studio_announcements;
create policy "infos_user_update_own"
  on public.studio_announcements for update
  to authenticated
  using (auth.uid() = author_id)
  with check (
    auth.uid() = author_id
    and importance in ('info','warning')
    and pinned = false
  );

-- DELETE: Mitarbeiter darf eigene loeschen
drop policy if exists "infos_user_delete_own" on public.studio_announcements;
create policy "infos_user_delete_own"
  on public.studio_announcements for delete
  to authenticated
  using (auth.uid() = author_id);

-- 3) notify_info_neu -- nur bei warning/critical broadcasten
--    Fuer 'info' KEINE Notification, sonst spammt jeder Mitarbeiter-Tipp
--    die Bell aller Kollegen.
create or replace function public.notify_info_neu()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.published is true
     and new.importance in ('warning','critical')
     and (tg_op = 'INSERT' or old.published is distinct from true)
  then
    insert into public.notifications (user_id, type, title, body, link)
    select p.id,
           'info_neu',
           'Neue Info: ' || coalesce(new.title, ''),
           case new.importance
             when 'critical' then '⚠ Dringend'
             when 'warning' then 'Beachten'
             else null
           end,
           '/infos'
    from public.profiles p
    where p.archived_at is null
      and p.id <> coalesce(new.author_id, '00000000-0000-0000-0000-000000000000'::uuid)
      and p.role in ('mitarbeiter','fuehrungskraft','admin','superadmin');
  end if;
  return new;
end;
$$;
