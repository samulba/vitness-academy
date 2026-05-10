-- =============================================================
-- 0020_audit_log.sql
-- Audit-Log: Wer hat wann was geändert? Pro kritischer Tabelle
-- haengt ein Trigger, der vor/nach-Werte sowie auth.uid() in
-- public.audit_log schreibt. Nur admin/superadmin sieht die Daten.
-- =============================================================

create table if not exists public.audit_log (
  id          bigserial primary key,
  table_name  text not null,
  row_id      text,
  action      text not null check (action in ('insert', 'update', 'delete')),
  actor_id    uuid references public.profiles(id) on delete set null,
  before      jsonb,
  after       jsonb,
  at          timestamptz not null default now()
);

create index if not exists audit_log_table_at_idx
  on public.audit_log (table_name, at desc);
create index if not exists audit_log_actor_at_idx
  on public.audit_log (actor_id, at desc);
create index if not exists audit_log_at_idx
  on public.audit_log (at desc);

-- ----------------------- Trigger-Funktion -----------------------
create or replace function public.audit_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid;
  v_row_id text;
  v_before jsonb;
  v_after jsonb;
begin
  -- auth.uid() liefert die User-ID des aktuellen Requests
  begin
    v_actor := auth.uid();
  exception when others then
    v_actor := null;
  end;

  if (tg_op = 'DELETE') then
    v_before := to_jsonb(old);
    v_after  := null;
    v_row_id := coalesce(old.id::text, null);
  elsif (tg_op = 'UPDATE') then
    v_before := to_jsonb(old);
    v_after  := to_jsonb(new);
    v_row_id := coalesce(new.id::text, old.id::text);
  else -- INSERT
    v_before := null;
    v_after  := to_jsonb(new);
    v_row_id := coalesce(new.id::text, null);
  end if;

  insert into public.audit_log (table_name, row_id, action, actor_id, before, after)
  values (tg_table_name, v_row_id, lower(tg_op), v_actor, v_before, v_after);

  if (tg_op = 'DELETE') then
    return old;
  end if;
  return new;
end;
$$;

-- Hilfs-Macro: Trigger an Tabelle haengen
do $$
declare
  t text;
  tabellen text[] := array[
    'profiles',
    'locations',
    'learning_paths',
    'modules',
    'lessons',
    'lesson_content_blocks',
    'user_learning_path_assignments',
    'quizzes',
    'quiz_questions',
    'quiz_options',
    'practical_tasks',
    'user_practical_signoffs',
    'knowledge_articles',
    'knowledge_categories',
    'studio_contacts',
    'studio_announcements',
    'studio_tasks',
    'studio_issues',
    'form_templates'
  ];
begin
  foreach t in array tabellen loop
    -- Trigger nur erstellen, wenn die Tabelle existiert
    if exists (
      select 1 from information_schema.tables
      where table_schema = 'public' and table_name = t
    ) then
      execute format('drop trigger if exists audit_trg on public.%I', t);
      execute format(
        'create trigger audit_trg
           after insert or update or delete on public.%I
           for each row execute function public.audit_event()',
        t
      );
    end if;
  end loop;
end $$;

-- ----------------------- RLS audit_log --------------------------
alter table public.audit_log enable row level security;

-- Nur Admin/Superadmin sieht das Log
drop policy if exists "audit_select_admin" on public.audit_log;
create policy "audit_select_admin"
  on public.audit_log for select
  to authenticated
  using (public.is_admin());

-- Niemand schreibt direkt -- das macht der Trigger über security definer.
-- Service-Role bypasst RLS sowieso.
