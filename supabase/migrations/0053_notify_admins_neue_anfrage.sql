-- =============================================================
-- 0053_notify_admins_neue_anfrage.sql
-- Bei JEDER neuen form_submission werden alle Studioleitungs-User
-- (Fuehrungskraft, Admin, Superadmin) benachrichtigt - nicht nur
-- der Einreicher bei Status-Change.
--
-- Bisheriger Stand: notify_submission_status (Migration 0023)
-- benachrichtigt nur den Einreicher bei Status-Updates.
-- Verwaltung musste aktiv in /admin/formulare/eingaenge schauen.
--
-- Neue Funktion + Trigger fuegen jetzt auch eine "submission_neu"-
-- Notification fuer alle Staff-User am gleichen Standort hinzu,
-- sobald ein Mitarbeiter etwas einreicht.
-- =============================================================

-- 1) Type-Constraint erweitern
alter table public.notifications
  drop constraint if exists notifications_type_check;
alter table public.notifications
  add constraint notifications_type_check
  check (type in (
    'mangel_status',
    'submission_status',
    'submission_neu',
    'praxis_decision',
    'aufgabe_neu',
    'info_neu',
    'lektion_q_antwort'
  ));

-- 2) Trigger-Function: bei INSERT auf form_submissions fanned out
--    eine Notification an jeden Staff-User des gleichen Standorts.
create or replace function public.notify_admins_neue_anfrage()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_template_title text;
  v_submitter_name text;
  v_submitter_location uuid;
  v_admin_id uuid;
begin
  -- Template-Titel + Einreicher-Daten lesen
  select title into v_template_title
    from public.form_templates
    where id = new.template_id;

  select full_name, location_id into v_submitter_name, v_submitter_location
    from public.profiles
    where id = new.submitted_by;

  -- Pro relevantem Staff-User eine Notification.
  -- Filter:
  --   - role IN (fuehrungskraft, admin, superadmin)
  --   - gleicher Standort wie Einreicher ODER Standort NULL (alle)
  --   - nicht der Einreicher selbst (falls Studioleitung sich
  --     selbst etwas einreicht)
  --   - nicht archivierte Profile
  for v_admin_id in
    select id from public.profiles
    where role in ('fuehrungskraft', 'admin', 'superadmin')
      and id <> new.submitted_by
      and archived_at is null
      and (
        v_submitter_location is null
        or location_id is null
        or location_id = v_submitter_location
      )
  loop
    insert into public.notifications (user_id, type, title, body, link)
    values (
      v_admin_id,
      'submission_neu',
      'Neuer Antrag: ' || coalesce(v_template_title, 'Formular'),
      coalesce(v_submitter_name, 'Mitarbeiter:in') || ' hat einen Antrag eingereicht.',
      '/admin/formulare/eingaenge/' || new.id::text
    );
  end loop;

  return new;
end;
$$;

drop trigger if exists notify_admins_neue_anfrage_trg on public.form_submissions;
create trigger notify_admins_neue_anfrage_trg
  after insert on public.form_submissions
  for each row execute function public.notify_admins_neue_anfrage();
