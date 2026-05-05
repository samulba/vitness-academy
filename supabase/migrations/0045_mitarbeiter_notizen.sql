-- =============================================================
-- 0045_mitarbeiter_notizen.sql
--
-- Notizen-Thread pro Mitarbeiter:in. Mehrere Einträge mit Autor +
-- Zeitstempel, im Gegensatz zur einzelnen profiles.interne_notiz
-- (Quick-Memo).
--
-- Sichtbarkeit: nur Admin und Führungskraft. Mitarbeiter:in selbst
-- sieht ihre/seine Notizen nicht (für ehrliche Personalführung).
-- =============================================================

create table if not exists public.mitarbeiter_notizen (
  id             uuid primary key default gen_random_uuid(),
  mitarbeiter_id uuid not null references public.profiles(id) on delete cascade,
  autor_id       uuid references public.profiles(id) on delete set null,
  body           text not null check (length(trim(body)) > 0),
  created_at     timestamptz not null default now()
);

create index if not exists mitarbeiter_notizen_mitarbeiter_idx
  on public.mitarbeiter_notizen (mitarbeiter_id, created_at desc);

create index if not exists mitarbeiter_notizen_autor_idx
  on public.mitarbeiter_notizen (autor_id);

alter table public.mitarbeiter_notizen enable row level security;

drop policy if exists "notizen_admin_read" on public.mitarbeiter_notizen;
create policy "notizen_admin_read"
  on public.mitarbeiter_notizen for select
  to authenticated
  using (public.is_admin() or public.is_staff_or_higher());

drop policy if exists "notizen_admin_insert" on public.mitarbeiter_notizen;
create policy "notizen_admin_insert"
  on public.mitarbeiter_notizen for insert
  to authenticated
  with check (
    (public.is_admin() or public.is_staff_or_higher())
    and auth.uid() = autor_id
  );

drop policy if exists "notizen_autor_delete" on public.mitarbeiter_notizen;
create policy "notizen_autor_delete"
  on public.mitarbeiter_notizen for delete
  to authenticated
  using (auth.uid() = autor_id or public.is_admin());

-- Audit-Trigger
drop trigger if exists audit_mitarbeiter_notizen_trg on public.mitarbeiter_notizen;
create trigger audit_mitarbeiter_notizen_trg
  after insert or update or delete on public.mitarbeiter_notizen
  for each row execute function public.audit_event();
