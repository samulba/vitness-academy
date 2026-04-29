-- =============================================================
-- 0018_formulare.sql
-- Form-Builder: Studioleitung baut Formulare selbst, Mitarbeiter
-- fuellen aus, Studioleitung sieht Inbox.
--
-- Ein Template definiert die Felder als JSONB-Liste, eine
-- Submission speichert die Antworten als JSONB-Map.
-- =============================================================

create table if not exists public.form_templates (
  id           uuid primary key default gen_random_uuid(),
  location_id  uuid references public.locations(id) on delete set null,
  slug         text not null unique,
  title        text not null,
  description  text,
  fields       jsonb not null default '[]'::jsonb,
  status       text not null default 'aktiv'
               check (status in ('entwurf', 'aktiv', 'archiviert')),
  sort_order   integer not null default 0,
  created_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists form_templates_status_idx
  on public.form_templates (status, sort_order);

drop trigger if exists set_updated_at_form_templates on public.form_templates;
create trigger set_updated_at_form_templates
  before update on public.form_templates
  for each row execute function public.set_updated_at();

alter table public.form_templates enable row level security;

-- Mitarbeiter sieht aktive Templates
drop policy if exists "templates_select_active" on public.form_templates;
create policy "templates_select_active"
  on public.form_templates for select
  to authenticated
  using (status = 'aktiv' or public.is_admin());

-- Admin schreibt
drop policy if exists "templates_admin_write" on public.form_templates;
create policy "templates_admin_write"
  on public.form_templates for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());


-- =============================================================
-- Submissions
-- =============================================================
create table if not exists public.form_submissions (
  id            uuid primary key default gen_random_uuid(),
  template_id   uuid not null references public.form_templates(id) on delete cascade,
  submitted_by  uuid not null references public.profiles(id)       on delete cascade,
  data          jsonb not null default '{}'::jsonb,
  status        text not null default 'eingereicht'
                check (status in ('eingereicht', 'in_bearbeitung', 'erledigt', 'abgelehnt')),
  admin_note    text,
  submitted_at  timestamptz not null default now(),
  processed_by  uuid references public.profiles(id) on delete set null,
  processed_at  timestamptz
);

create index if not exists form_submissions_status_idx
  on public.form_submissions (status, submitted_at desc);
create index if not exists form_submissions_user_idx
  on public.form_submissions (submitted_by, submitted_at desc);
create index if not exists form_submissions_template_idx
  on public.form_submissions (template_id);

alter table public.form_submissions enable row level security;

-- Mitarbeiter sieht eigene Submissions
drop policy if exists "submissions_select_own" on public.form_submissions;
create policy "submissions_select_own"
  on public.form_submissions for select
  to authenticated
  using (auth.uid() = submitted_by or public.is_staff_or_higher());

drop policy if exists "submissions_insert_own" on public.form_submissions;
create policy "submissions_insert_own"
  on public.form_submissions for insert
  to authenticated
  with check (auth.uid() = submitted_by);

-- Admin/Fuehrungskraft kann Status updaten
drop policy if exists "submissions_admin_update" on public.form_submissions;
create policy "submissions_admin_update"
  on public.form_submissions for update
  to authenticated
  using (public.is_staff_or_higher())
  with check (public.is_staff_or_higher());

drop policy if exists "submissions_admin_delete" on public.form_submissions;
create policy "submissions_admin_delete"
  on public.form_submissions for delete
  to authenticated
  using (public.is_admin());
