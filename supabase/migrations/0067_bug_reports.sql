-- =============================================================
-- 0067_bug_reports.sql
--
-- Bug-Report-System: Software-Fehler und Probleme aus der App,
-- gemeldet entweder
--   a) direkt aus dem Error-Popup (Quelle 'error_popup')
--   b) ueber die Seite /problem-melden (Quelle 'manuell')
--
-- Dedup: Bei Quelle = 'error_popup' wird per error_digest
-- entschieden, ob es schon einen offenen Eintrag gibt. Wenn ja,
-- wird der bestehende Eintrag aufgewertet (meldungen_count++,
-- letzte_meldung_at = now()) statt einen neuen anzulegen. Logik
-- liegt in der Server-Action (lib/bug-reports-actions), nicht in
-- der DB -- die DB hat dafuer nur einen partiellen Index.
--
-- Storage-Bucket "bug-screenshots" muss separat in der Supabase
-- Cloud angelegt werden (siehe Hinweis ganz unten).
-- =============================================================

create table if not exists public.bug_reports (
  id                  uuid primary key default gen_random_uuid(),

  -- Auto-Kontext vom Error-Popup (NULL bei Quelle = 'manuell')
  error_digest        text,
  pfad                text,
  user_agent          text,
  fehler_message      text,
  fehler_stack        text,

  -- User-Input
  beschreibung        text,
  kategorie           text not null default 'bug'
                       check (kategorie in ('bug', 'ui', 'vorschlag', 'sonstiges')),
  quelle              text not null
                       check (quelle in ('error_popup', 'manuell')),
  screenshot_path     text,

  -- Workflow
  status              text not null default 'neu'
                       check (status in ('neu', 'in_bearbeitung', 'behoben', 'verworfen', 'duplikat')),
  prioritaet          text not null default 'normal'
                       check (prioritaet in ('niedrig', 'normal', 'hoch', 'kritisch')),
  duplikat_von        uuid references public.bug_reports(id) on delete set null,
  admin_notiz         text,

  -- Audit / Counter
  reported_by         uuid references public.profiles(id) on delete set null,
  assigned_to         uuid references public.profiles(id) on delete set null,
  meldungen_count     int not null default 1,
  letzte_meldung_at   timestamptz not null default now(),

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  resolved_at         timestamptz
);

create index if not exists bug_reports_status_idx
  on public.bug_reports (status, created_at desc);
create index if not exists bug_reports_reported_by_idx
  on public.bug_reports (reported_by);

-- Partial-Index fuer Dedup-Lookup: nur offene Reports mit
-- gleichem Digest sollen Dedup ausloesen.
create index if not exists bug_reports_digest_offen_idx
  on public.bug_reports (error_digest)
  where error_digest is not null
    and status in ('neu', 'in_bearbeitung');

-- updated_at automatisch nachfuehren
drop trigger if exists set_updated_at_bug_reports on public.bug_reports;
create trigger set_updated_at_bug_reports
  before update on public.bug_reports
  for each row execute function public.set_updated_at();

-- Audit-Log
drop trigger if exists audit_trg on public.bug_reports;
create trigger audit_trg
  after insert or update or delete on public.bug_reports
  for each row execute function public.audit_event();

-- =============================================================
-- RLS
-- =============================================================
alter table public.bug_reports enable row level security;

-- Eingeloggte User koennen melden
drop policy if exists "bug_reports_insert_own" on public.bug_reports;
create policy "bug_reports_insert_own"
  on public.bug_reports for insert
  to authenticated
  with check (auth.uid() = reported_by);

-- Eigene Reports darf der User sehen
drop policy if exists "bug_reports_select_own" on public.bug_reports;
create policy "bug_reports_select_own"
  on public.bug_reports for select
  to authenticated
  using (auth.uid() = reported_by);

-- Admin / Fuehrungskraft sieht & verwaltet alles
drop policy if exists "bug_reports_admin_all" on public.bug_reports;
create policy "bug_reports_admin_all"
  on public.bug_reports for all
  to authenticated
  using (public.is_admin() or public.is_staff_or_higher())
  with check (public.is_admin() or public.is_staff_or_higher());

-- =============================================================
-- Permissions-Modul "bug_reports" seeden
-- (analog 0061_permissions_extend.sql)
-- =============================================================
do $$
declare
  superadmin_id uuid := '00000000-0000-0000-0000-000000000004';
  admin_id      uuid := '00000000-0000-0000-0000-000000000003';
  fuehrung_id   uuid := '00000000-0000-0000-0000-000000000002';
  aktion text;
begin
  -- Superadmin + Admin: alle 4 Aktionen
  foreach aktion in array array['view','create','edit','delete'] loop
    insert into public.role_permissions (role_id, modul, aktion)
      values (superadmin_id, 'bug_reports', aktion)
      on conflict do nothing;
    insert into public.role_permissions (role_id, modul, aktion)
      values (admin_id, 'bug_reports', aktion)
      on conflict do nothing;
  end loop;

  -- Fuehrungskraft: view + edit (kein delete, kein create-only --
  -- Fuehrung soll Bugs triagieren koennen, aber nicht endgueltig
  -- entfernen)
  foreach aktion in array array['view','edit'] loop
    insert into public.role_permissions (role_id, modul, aktion)
      values (fuehrung_id, 'bug_reports', aktion)
      on conflict do nothing;
  end loop;
end $$;

-- =============================================================
-- Storage-Bucket "bug-screenshots" muss separat angelegt werden:
--   Supabase Dashboard -> Storage -> "New bucket"
--     Name: bug-screenshots
--     Public bucket: AUS (privat, signed URLs)
-- Policies werden hier gesetzt.
-- =============================================================

drop policy if exists "bug_screenshots_authed_write" on storage.objects;
create policy "bug_screenshots_authed_write"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'bug-screenshots');

-- Lesen: User darf eigene Screenshots, Admin darf alle.
-- Convention: Pfad beginnt mit "<user-id>/...".
drop policy if exists "bug_screenshots_own_read" on storage.objects;
create policy "bug_screenshots_own_read"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'bug-screenshots'
    and (
      public.is_admin()
      or public.is_staff_or_higher()
      or (storage.foldername(name))[1] = auth.uid()::text
    )
  );

drop policy if exists "bug_screenshots_admin_delete" on storage.objects;
create policy "bug_screenshots_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'bug-screenshots' and public.is_admin());
