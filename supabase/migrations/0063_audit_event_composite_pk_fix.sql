-- =========================================================
-- 0063_audit_event_composite_pk_fix.sql
--
-- Bug-Fix: Migration 0061 hat den audit_trg auf
-- public.role_permissions aktiviert, aber die Tabelle hat
-- keine 'id'-Spalte (composite PK aus role_id, modul, aktion).
-- Die audit_event()-Funktion griff hart auf NEW.id / OLD.id
-- zu und scheiterte mit:
--   ERROR 42703: record "new" has no field "id"
--
-- Folge: jeder INSERT/UPDATE/DELETE auf role_permissions
-- failed -- damit auch das Permissions-Speichern in der
-- Rollen-Verwaltung UND die Default-Seeds in Migration 0062.
--
-- Fix: NEW/OLD über to_jsonb() projezieren und 'id' optional
-- aus dem JSONB lesen. Wenn die Spalte fehlt, ist row_id
-- einfach null -- der audit_log-Eintrag selbst wird trotzdem
-- geschrieben (before/after enthalten den vollen Datensatz).
-- =========================================================

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
  begin
    v_actor := auth.uid();
  exception when others then
    v_actor := null;
  end;

  if (tg_op = 'DELETE') then
    v_before := to_jsonb(old);
    v_after  := null;
    v_row_id := v_before ->> 'id';
  elsif (tg_op = 'UPDATE') then
    v_before := to_jsonb(old);
    v_after  := to_jsonb(new);
    v_row_id := coalesce(v_after ->> 'id', v_before ->> 'id');
  else -- INSERT
    v_before := null;
    v_after  := to_jsonb(new);
    v_row_id := v_after ->> 'id';
  end if;

  insert into public.audit_log (table_name, row_id, action, actor_id, before, after)
  values (tg_table_name, v_row_id, lower(tg_op), v_actor, v_before, v_after);

  if (tg_op = 'DELETE') then
    return old;
  end if;
  return new;
end;
$$;
