-- Vitness Academy -- Row Level Security
-- Grundregeln:
--   * Mitarbeiter sehen nur eigene Profile/Fortschritte und nur ihnen zugewiesene Lernpfade.
--   * Fuehrungskraefte sehen alle Profile/Fortschritte (Standortfilter später).
--   * Admin/Superadmin haben Vollzugriff.
--   * Inhalts-Tabellen (learning_paths, modules, lessons, content_blocks) sind für
--     authentifizierte Nutzer lesbar; Schreibzugriff nur Admin.

-- RLS aktivieren
alter table public.locations                       enable row level security;
alter table public.profiles                         enable row level security;
alter table public.learning_paths                   enable row level security;
alter table public.modules                          enable row level security;
alter table public.lessons                          enable row level security;
alter table public.lesson_content_blocks            enable row level security;
alter table public.user_learning_path_assignments   enable row level security;
alter table public.user_lesson_progress             enable row level security;

-- =========================================================
-- locations
-- =========================================================
create policy "locations lesbar fuer alle Auth"
  on public.locations
  for select
  to authenticated
  using (true);

create policy "locations Admin schreibt"
  on public.locations
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =========================================================
-- profiles
-- =========================================================
create policy "profiles eigenes Profil lesen"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

create policy "profiles Fuehrungskraft+ sieht alle"
  on public.profiles
  for select
  to authenticated
  using (public.is_staff_or_higher());

create policy "profiles eigenes Profil aktualisieren (full_name)"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

create policy "profiles Admin verwaltet alle"
  on public.profiles
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =========================================================
-- learning_paths
-- =========================================================
create policy "learning_paths Auth darf lesen"
  on public.learning_paths
  for select
  to authenticated
  using (true);

create policy "learning_paths Admin schreibt"
  on public.learning_paths
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =========================================================
-- modules
-- =========================================================
create policy "modules Auth darf lesen"
  on public.modules
  for select
  to authenticated
  using (true);

create policy "modules Admin schreibt"
  on public.modules
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =========================================================
-- lessons
-- =========================================================
create policy "lessons Auth darf lesen"
  on public.lessons
  for select
  to authenticated
  using (true);

create policy "lessons Admin schreibt"
  on public.lessons
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =========================================================
-- lesson_content_blocks
-- =========================================================
create policy "content_blocks Auth darf lesen"
  on public.lesson_content_blocks
  for select
  to authenticated
  using (true);

create policy "content_blocks Admin schreibt"
  on public.lesson_content_blocks
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =========================================================
-- user_learning_path_assignments
-- =========================================================
create policy "assignments eigene sehen"
  on public.user_learning_path_assignments
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "assignments Fuehrungskraft+ sieht alle"
  on public.user_learning_path_assignments
  for select
  to authenticated
  using (public.is_staff_or_higher());

create policy "assignments Admin verwaltet"
  on public.user_learning_path_assignments
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =========================================================
-- user_lesson_progress
-- =========================================================
create policy "progress eigene sehen"
  on public.user_lesson_progress
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "progress eigene anlegen"
  on public.user_lesson_progress
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "progress eigene aktualisieren"
  on public.user_lesson_progress
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "progress Fuehrungskraft+ sieht alle"
  on public.user_lesson_progress
  for select
  to authenticated
  using (public.is_staff_or_higher());

create policy "progress Admin verwaltet alles"
  on public.user_lesson_progress
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
