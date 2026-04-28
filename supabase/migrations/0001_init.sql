-- Vitness Akademie -- Initiales Schema (Iteration 1)
-- Tabellen: locations, profiles, learning_paths, modules, lessons,
-- lesson_content_blocks, user_learning_path_assignments, user_lesson_progress
--
-- Konventionen:
--   - alle ids sind uuid (Default gen_random_uuid)
--   - timestamps sind timestamptz (Default now())
--   - Enum-aehnliche Felder als text + Check-Constraint, damit spaeter erweiterbar
--   - sort_order als int4 fuer Reihenfolgen

create extension if not exists "pgcrypto";

-- =========================================================
-- Standorte (Vorbereitung Mehrstandort, im UI noch nicht sichtbar)
-- =========================================================
create table public.locations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz not null default now()
);

-- =========================================================
-- Profile (1:1 mit auth.users)
-- =========================================================
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text,
  role         text not null default 'mitarbeiter'
                check (role in ('mitarbeiter','fuehrungskraft','admin','superadmin')),
  location_id  uuid references public.locations(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index profiles_role_idx on public.profiles(role);
create index profiles_location_idx on public.profiles(location_id);

-- =========================================================
-- Lernpfade
-- =========================================================
create table public.learning_paths (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  status      text not null default 'aktiv'
                check (status in ('entwurf','aktiv','archiviert')),
  sort_order  int  not null default 0,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index learning_paths_status_idx on public.learning_paths(status);

-- =========================================================
-- Module (gehoeren zu einem Lernpfad)
-- =========================================================
create table public.modules (
  id                uuid primary key default gen_random_uuid(),
  learning_path_id  uuid not null references public.learning_paths(id) on delete cascade,
  title             text not null,
  description       text,
  sort_order        int  not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index modules_learning_path_idx on public.modules(learning_path_id);

-- =========================================================
-- Lektionen (gehoeren zu einem Modul)
-- =========================================================
create table public.lessons (
  id          uuid primary key default gen_random_uuid(),
  module_id   uuid not null references public.modules(id) on delete cascade,
  title       text not null,
  summary     text,
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index lessons_module_idx on public.lessons(module_id);

-- =========================================================
-- Inhaltsblöcke einer Lektion
--   block_type: text (Markdown), checkliste, video_url, hinweis
--   content: JSON je nach Typ:
--     text:        { "markdown": "..." }
--     checkliste:  { "items": ["...", "..."] }
--     video_url:   { "url": "https://...", "title": "..." }
--     hinweis:     { "variant": "info|warnung", "markdown": "..." }
-- =========================================================
create table public.lesson_content_blocks (
  id          uuid primary key default gen_random_uuid(),
  lesson_id   uuid not null references public.lessons(id) on delete cascade,
  block_type  text not null
                check (block_type in ('text','checkliste','video_url','hinweis')),
  content     jsonb not null default '{}'::jsonb,
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);
create index lesson_content_blocks_lesson_idx on public.lesson_content_blocks(lesson_id);

-- =========================================================
-- Zuweisungen (welcher Mitarbeiter hat welchen Lernpfad)
-- =========================================================
create table public.user_learning_path_assignments (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  learning_path_id  uuid not null references public.learning_paths(id) on delete cascade,
  assigned_by       uuid references public.profiles(id) on delete set null,
  assigned_at       timestamptz not null default now(),
  unique (user_id, learning_path_id)
);
create index ulpa_user_idx on public.user_learning_path_assignments(user_id);
create index ulpa_path_idx on public.user_learning_path_assignments(learning_path_id);

-- =========================================================
-- Fortschritt pro Lektion
-- =========================================================
create table public.user_lesson_progress (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  lesson_id     uuid not null references public.lessons(id) on delete cascade,
  status        text not null default 'nicht_gestartet'
                  check (status in ('nicht_gestartet','in_bearbeitung','abgeschlossen')),
  completed_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (user_id, lesson_id)
);
create index ulp_user_idx on public.user_lesson_progress(user_id);
create index ulp_lesson_idx on public.user_lesson_progress(lesson_id);

-- =========================================================
-- Trigger: updated_at automatisch pflegen
-- =========================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger learning_paths_set_updated_at
  before update on public.learning_paths
  for each row execute function public.set_updated_at();

create trigger modules_set_updated_at
  before update on public.modules
  for each row execute function public.set_updated_at();

create trigger lessons_set_updated_at
  before update on public.lessons
  for each row execute function public.set_updated_at();

create trigger user_lesson_progress_set_updated_at
  before update on public.user_lesson_progress
  for each row execute function public.set_updated_at();

-- =========================================================
-- Trigger: bei neuem auth.user automatisch Profil anlegen
-- =========================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'mitarbeiter')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- Helper-Funktionen fuer RLS
-- =========================================================
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() in ('admin','superadmin'), false);
$$;

create or replace function public.is_staff_or_higher()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    public.current_user_role() in ('fuehrungskraft','admin','superadmin'),
    false
  );
$$;
