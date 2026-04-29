-- =============================================================
-- 0017_studio_issues.sql
-- Maengel im Studio: defekte Geraete, Probleme melden mit Foto.
-- Mitarbeiter melden, Studioleitung verwaltet Status.
-- =============================================================

create table if not exists public.studio_issues (
  id            uuid primary key default gen_random_uuid(),
  location_id   uuid references public.locations(id) on delete set null,
  title         text not null,
  description   text,
  photo_path    text,
  status        text not null default 'offen'
                check (status in ('offen', 'in_bearbeitung', 'behoben', 'verworfen')),
  severity      text not null default 'normal'
                check (severity in ('niedrig', 'normal', 'kritisch')),
  reported_by   uuid references public.profiles(id) on delete set null,
  assigned_to   uuid references public.profiles(id) on delete set null,
  resolution_note text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  resolved_at   timestamptz
);

create index if not exists studio_issues_status_idx
  on public.studio_issues (status, created_at desc);
create index if not exists studio_issues_reported_by_idx
  on public.studio_issues (reported_by);

drop trigger if exists set_updated_at_studio_issues on public.studio_issues;
create trigger set_updated_at_studio_issues
  before update on public.studio_issues
  for each row execute function public.set_updated_at();

alter table public.studio_issues enable row level security;

-- Mitarbeiter sieht alle Issues (Transparenz im Studio)
drop policy if exists "issues_select_authed" on public.studio_issues;
create policy "issues_select_authed"
  on public.studio_issues for select
  to authenticated
  using (true);

-- Mitarbeiter darf eigene Issues anlegen
drop policy if exists "issues_insert_own" on public.studio_issues;
create policy "issues_insert_own"
  on public.studio_issues for insert
  to authenticated
  with check (auth.uid() = reported_by);

-- Mitarbeiter darf eigene noch nicht behobene Issues editieren
-- (Tippfehler, Beschreibung praezisieren)
drop policy if exists "issues_update_own_open" on public.studio_issues;
create policy "issues_update_own_open"
  on public.studio_issues for update
  to authenticated
  using (auth.uid() = reported_by and status in ('offen', 'in_bearbeitung'))
  with check (auth.uid() = reported_by);

-- Admin / Fuehrungskraft darf alles
drop policy if exists "issues_admin_all" on public.studio_issues;
create policy "issues_admin_all"
  on public.studio_issues for all
  to authenticated
  using (public.is_admin() or public.is_staff_or_higher())
  with check (public.is_admin() or public.is_staff_or_higher());

-- =============================================================
-- Storage-Bucket "issue-photos" muss separat angelegt werden:
--   Supabase Dashboard -> Storage -> "New bucket"
--     Name: issue-photos
--     Public bucket: aktiviert
-- Policies werden hier gesetzt.
-- =============================================================

drop policy if exists "issue_photos_authed_write" on storage.objects;
create policy "issue_photos_authed_write"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'issue-photos');

drop policy if exists "issue_photos_authed_read" on storage.objects;
create policy "issue_photos_authed_read"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'issue-photos');

drop policy if exists "issue_photos_admin_delete" on storage.objects;
create policy "issue_photos_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'issue-photos' and public.is_admin());
