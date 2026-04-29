-- =============================================================
-- 0015_aufgaben.sql
-- Studio-Aufgaben / Tägliche ToDo's.
--
-- Eine Tabelle. Templates (recurrence != 'none') generieren
-- Instances (recurrence = 'none' + recurrence_template_id).
-- Die Generierung passiert beim ersten User-Login des Tages
-- (Server-Component im App-Layout), idempotent via Unique-
-- Constraint auf (recurrence_template_id, due_date).
-- =============================================================

create table if not exists public.studio_tasks (
  id                       uuid primary key default gen_random_uuid(),
  location_id              uuid references public.locations(id) on delete set null,
  title                    text not null,
  description              text,
  assigned_to              uuid references public.profiles(id) on delete set null,
  due_date                 date,
  priority                 text not null default 'normal'
                           check (priority in ('low', 'normal', 'high')),
  recurrence               text not null default 'none'
                           check (recurrence in ('none', 'daily', 'weekly')),
  recurrence_template_id   uuid references public.studio_tasks(id) on delete cascade,
  active                   boolean not null default true,
  completed_by             uuid references public.profiles(id) on delete set null,
  completed_at             timestamptz,
  created_by               uuid references public.profiles(id) on delete set null,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index if not exists studio_tasks_due_idx
  on public.studio_tasks (due_date, completed_at);
create index if not exists studio_tasks_assigned_idx
  on public.studio_tasks (assigned_to);
create index if not exists studio_tasks_template_idx
  on public.studio_tasks (recurrence_template_id);

-- Verhindert doppelte Instanzen einer Recurring-Template am
-- gleichen Tag.
create unique index if not exists studio_tasks_template_due_uniq
  on public.studio_tasks (recurrence_template_id, due_date)
  where recurrence_template_id is not null;

drop trigger if exists set_updated_at_studio_tasks on public.studio_tasks;
create trigger set_updated_at_studio_tasks
  before update on public.studio_tasks
  for each row execute function public.set_updated_at();

alter table public.studio_tasks enable row level security;

-- Mitarbeiter sieht alle nicht-archivierten Tasks (team-wide oder
-- ihm zugewiesen). Templates (recurrence != 'none') versteckt.
drop policy if exists "tasks_select_visible" on public.studio_tasks;
create policy "tasks_select_visible"
  on public.studio_tasks for select
  to authenticated
  using (
    public.is_admin()
    or (
      active = true
      and recurrence = 'none'
      and (assigned_to is null or assigned_to = auth.uid())
    )
  );

-- Mitarbeiter darf eigene oder team-wide Tasks ABHAKEN
-- (nur completed_by + completed_at updaten -- aber RLS ist
-- ja UPDATE-Level, kein column-level. Wir vertrauen darauf
-- dass die Server-Action nur diese Felder setzt).
drop policy if exists "tasks_update_completion" on public.studio_tasks;
create policy "tasks_update_completion"
  on public.studio_tasks for update
  to authenticated
  using (
    recurrence = 'none'
    and (assigned_to is null or assigned_to = auth.uid())
  )
  with check (
    recurrence = 'none'
    and (assigned_to is null or assigned_to = auth.uid())
  );

-- Admin darf alles
drop policy if exists "tasks_admin_all" on public.studio_tasks;
create policy "tasks_admin_all"
  on public.studio_tasks for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
