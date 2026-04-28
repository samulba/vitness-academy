-- Vitness Academy -- Migration 0004: Praxisfreigaben
-- Konzept:
--   practical_tasks            = Aufgaben-Vorlagen (vom Admin gepflegt),
--                                koennen optional an Lernpfad/Modul/Lektion haengen
--   user_practical_signoffs    = Status pro Mitarbeiter und Aufgabe
--                                (offen -> bereit -> freigegeben/abgelehnt)

create table public.practical_tasks (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  description       text,
  learning_path_id  uuid references public.learning_paths(id) on delete set null,
  module_id         uuid references public.modules(id) on delete set null,
  lesson_id         uuid references public.lessons(id) on delete set null,
  status            text not null default 'aktiv'
                    check (status in ('entwurf','aktiv','archiviert')),
  sort_order        int  not null default 0,
  created_by        uuid references public.profiles(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index practical_tasks_path_idx   on public.practical_tasks(learning_path_id);
create index practical_tasks_module_idx on public.practical_tasks(module_id);
create index practical_tasks_lesson_idx on public.practical_tasks(lesson_id);
create index practical_tasks_status_idx on public.practical_tasks(status);

create table public.user_practical_signoffs (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  task_id           uuid not null references public.practical_tasks(id) on delete cascade,
  status            text not null default 'offen'
                    check (status in ('offen','bereit','freigegeben','abgelehnt')),
  user_note         text,                            -- Notiz vom Mitarbeiter beim Melden
  reviewer_note     text,                            -- Notiz von Fuehrungskraft/Admin
  submitted_at      timestamptz,                     -- wann hat der User "bereit" gemeldet
  approved_by       uuid references public.profiles(id) on delete set null,
  approved_at       timestamptz,                     -- wann hat Fuehrungskraft entschieden
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (user_id, task_id)
);
create index user_practical_signoffs_user_idx   on public.user_practical_signoffs(user_id);
create index user_practical_signoffs_task_idx   on public.user_practical_signoffs(task_id);
create index user_practical_signoffs_status_idx on public.user_practical_signoffs(status);

-- updated_at-Trigger
create trigger practical_tasks_set_updated_at
  before update on public.practical_tasks
  for each row execute function public.set_updated_at();

create trigger user_practical_signoffs_set_updated_at
  before update on public.user_practical_signoffs
  for each row execute function public.set_updated_at();

-- =========================================================
-- Row Level Security
-- =========================================================
alter table public.practical_tasks         enable row level security;
alter table public.user_practical_signoffs enable row level security;

-- practical_tasks: lesbar fuer Auth, Admin schreibt
create policy "practical_tasks Auth lesen"
  on public.practical_tasks for select to authenticated using (true);
create policy "practical_tasks Admin schreiben"
  on public.practical_tasks for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- user_practical_signoffs:
--   - Mitarbeiter darf eigene Eintraege lesen + anlegen + auf "bereit" setzen
--   - Fuehrungskraft+ darf alle lesen
--   - Fuehrungskraft+ darf den Status ueber Update auf freigegeben/abgelehnt setzen
--   - Admin verwaltet alles
create policy "signoffs eigene lesen"
  on public.user_practical_signoffs for select to authenticated
  using (user_id = auth.uid());
create policy "signoffs Fuehrungskraft+ lesen"
  on public.user_practical_signoffs for select to authenticated
  using (public.is_staff_or_higher());
create policy "signoffs eigene anlegen"
  on public.user_practical_signoffs for insert to authenticated
  with check (user_id = auth.uid());
create policy "signoffs eigene aktualisieren"
  on public.user_practical_signoffs for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "signoffs Fuehrungskraft+ entscheiden"
  on public.user_practical_signoffs for update to authenticated
  using (public.is_staff_or_higher())
  with check (public.is_staff_or_higher());
create policy "signoffs Admin verwalten"
  on public.user_practical_signoffs for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
