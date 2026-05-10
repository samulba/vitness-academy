-- =============================================================
-- 0032_kudos.sql
-- Kudos / Mitarbeiter-Lob: jeder kann jedem Kollegen ein Lob
-- schicken. Wird auf /kudos und auf dem Dashboard sichtbar, plus
-- Notification an Empfaenger.
-- =============================================================

create table if not exists public.kudos (
  id           uuid primary key default gen_random_uuid(),
  from_user    uuid not null references public.profiles(id) on delete cascade,
  to_user      uuid not null references public.profiles(id) on delete cascade,
  message      text not null,
  location_id  uuid references public.locations(id) on delete set null,
  created_at   timestamptz not null default now(),
  check (from_user <> to_user)
);

create index if not exists kudos_to_user_idx on public.kudos (to_user, created_at desc);
create index if not exists kudos_created_at_idx on public.kudos (created_at desc);

alter table public.kudos enable row level security;

-- Alle authentifizierten lesen
drop policy if exists "kudos_select" on public.kudos;
create policy "kudos_select"
  on public.kudos for select
  to authenticated
  using (true);

-- Nur eigene posten (auth.uid() = from_user)
drop policy if exists "kudos_insert_own" on public.kudos;
create policy "kudos_insert_own"
  on public.kudos for insert
  to authenticated
  with check (auth.uid() = from_user);

-- Löschen: Eigentuemer (Sender) ODER Admin
drop policy if exists "kudos_delete_own_or_admin" on public.kudos;
create policy "kudos_delete_own_or_admin"
  on public.kudos for delete
  to authenticated
  using (auth.uid() = from_user or public.is_admin());

-- =============================================================
-- Notifications-Type-Enum erweitern: 'kudos' hinzufügen
-- =============================================================
alter table public.notifications
  drop constraint if exists notifications_type_check;
alter table public.notifications
  add constraint notifications_type_check
  check (type in (
    'mangel_status',
    'submission_status',
    'praxis_decision',
    'aufgabe_neu',
    'info_neu',
    'lektion_q_antwort',
    'kudos'
  ));

-- =============================================================
-- Trigger: bei jedem neuen Kudos eine Notification an to_user
-- =============================================================
create or replace function public.notify_kudos_neu()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  absender_name text;
begin
  select coalesce(full_name, 'Ein Kollege') into absender_name
    from public.profiles where id = new.from_user;

  insert into public.notifications (user_id, type, title, body, link)
  values (
    new.to_user,
    'kudos',
    coalesce(absender_name, 'Ein Kollege') || ' hat dich gelobt 🎉',
    left(new.message, 140),
    '/kudos'
  );
  return new;
end;
$$;

drop trigger if exists kudos_after_insert_notify on public.kudos;
create trigger kudos_after_insert_notify
  after insert on public.kudos
  for each row execute function public.notify_kudos_neu();
