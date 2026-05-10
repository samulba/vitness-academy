-- =============================================================
-- 0027_onboarding_templates.sql
-- Onboarding-Templates für schnelles Mitarbeiter-Anlegen.
-- Studioleitung definiert "Trainer-Onboarding" -> 4 Lernpfade vor-
-- ausgewählt, "Service-Onboarding" -> andere Pfade. Beim Anlegen
-- eines neuen Mitarbeiters wird das Template gewählt und die
-- Lernpfade sind automatisch geklickt.
-- =============================================================

create table if not exists public.onboarding_templates (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  beschreibung    text,
  role            text not null default 'mitarbeiter'
                    check (role in ('mitarbeiter','fuehrungskraft','admin','superadmin')),
  lernpfad_ids    uuid[] not null default '{}',
  created_by      uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists onboarding_templates_role_idx
  on public.onboarding_templates (role);

drop trigger if exists set_updated_at_onboarding_templates
  on public.onboarding_templates;
create trigger set_updated_at_onboarding_templates
  before update on public.onboarding_templates
  for each row execute function public.set_updated_at();

alter table public.onboarding_templates enable row level security;

-- Authentifizierte lesen (Admin-Form braucht die Liste)
drop policy if exists "onboarding_templates_authed_read"
  on public.onboarding_templates;
create policy "onboarding_templates_authed_read"
  on public.onboarding_templates for select
  to authenticated
  using (true);

-- Schreiben nur Admin/Superadmin
drop policy if exists "onboarding_templates_admin_write"
  on public.onboarding_templates;
create policy "onboarding_templates_admin_write"
  on public.onboarding_templates for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
