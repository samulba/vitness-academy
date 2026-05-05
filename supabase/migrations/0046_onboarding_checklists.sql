-- =============================================================
-- 0046_onboarding_checklists.sql
--
-- Onboarding-Checklisten:
--   - onboarding_checklist_items: Templated Items (z.B. "Schlüssel
--     ausgehändigt", "Hygieneplan unterschrieben"). Pro Template
--     definiert oder global (template_id = null = gilt für alle).
--   - mitarbeiter_onboarding_progress: Pro Mitarbeiter+Item ein
--     Progress-Eintrag (erledigt_am + erledigt_von).
-- =============================================================

create table if not exists public.onboarding_checklist_items (
  id            uuid primary key default gen_random_uuid(),
  template_id   uuid references public.onboarding_templates(id) on delete cascade,
  -- template_id NULL = gilt für jede:n Mitarbeiter:in (Standard-Items)
  label         text not null check (length(trim(label)) > 0),
  beschreibung  text,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists onboarding_checklist_items_template_idx
  on public.onboarding_checklist_items (template_id, sort_order);

create table if not exists public.mitarbeiter_onboarding_progress (
  id             uuid primary key default gen_random_uuid(),
  mitarbeiter_id uuid not null references public.profiles(id) on delete cascade,
  item_id        uuid not null references public.onboarding_checklist_items(id) on delete cascade,
  erledigt_am    timestamptz,
  erledigt_von   uuid references public.profiles(id) on delete set null,
  notiz          text,
  unique (mitarbeiter_id, item_id)
);

create index if not exists mitarbeiter_onboarding_progress_user_idx
  on public.mitarbeiter_onboarding_progress (mitarbeiter_id);

-- RLS
alter table public.onboarding_checklist_items enable row level security;
alter table public.mitarbeiter_onboarding_progress enable row level security;

-- Items: alle authentifizierten lesen (Mitarbeiter:in sieht eigene
-- Checkliste in /einstellungen später), Admin schreibt.
drop policy if exists "checklist_items_read" on public.onboarding_checklist_items;
create policy "checklist_items_read"
  on public.onboarding_checklist_items for select
  to authenticated using (true);

drop policy if exists "checklist_items_admin_write" on public.onboarding_checklist_items;
create policy "checklist_items_admin_write"
  on public.onboarding_checklist_items for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Progress: User sieht eigenes, Admin/Führungskraft sieht + schreibt alle.
drop policy if exists "onboarding_progress_read" on public.mitarbeiter_onboarding_progress;
create policy "onboarding_progress_read"
  on public.mitarbeiter_onboarding_progress for select
  to authenticated
  using (
    auth.uid() = mitarbeiter_id
    or public.is_admin()
    or public.is_staff_or_higher()
  );

drop policy if exists "onboarding_progress_staff_write" on public.mitarbeiter_onboarding_progress;
create policy "onboarding_progress_staff_write"
  on public.mitarbeiter_onboarding_progress for all
  to authenticated
  using (public.is_admin() or public.is_staff_or_higher())
  with check (public.is_admin() or public.is_staff_or_higher());

-- Audit-Trigger
drop trigger if exists audit_onboarding_checklist_items_trg
  on public.onboarding_checklist_items;
create trigger audit_onboarding_checklist_items_trg
  after insert or update or delete on public.onboarding_checklist_items
  for each row execute function public.audit_event();

drop trigger if exists audit_mitarbeiter_onboarding_progress_trg
  on public.mitarbeiter_onboarding_progress;
create trigger audit_mitarbeiter_onboarding_progress_trg
  after insert or update or delete on public.mitarbeiter_onboarding_progress
  for each row execute function public.audit_event();
