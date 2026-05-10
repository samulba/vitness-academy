-- =========================================================
-- 0023_notifications.sql
-- Notifications-System: jeder Mitarbeiter hat eine eigene
-- Inbox. Trigger schreiben automatisch Notifications bei
-- Status-Changes auf Mängeln, Submissions, Praxis-Anfragen
-- und neuen Antworten in Lektion-QA.
-- =========================================================

create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        text not null check (type in (
                'mangel_status',
                'submission_status',
                'praxis_decision',
                'aufgabe_neu',
                'info_neu',
                'lektion_q_antwort'
              )),
  title       text not null,
  body        text,
  link        text,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists notifications_user_unread_idx
  on public.notifications (user_id, created_at desc)
  where read_at is null;

create index if not exists notifications_user_idx
  on public.notifications (user_id, created_at desc);

-- ----------------------- RLS ------------------------------
alter table public.notifications enable row level security;

-- Jeder sieht nur seine eigenen Notifications
drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
  on public.notifications for select
  to authenticated
  using (user_id = auth.uid());

-- Jeder darf seine eigenen Notifications als gelesen markieren
drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own"
  on public.notifications for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- INSERT erfolgt nur durch Service-Role / Trigger (security definer)
-- Keine INSERT-Policy für authenticated Users.

-- ----------------------- Trigger-Helper -------------------
create or replace function public.notify_user(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_body text default null,
  p_link text default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_user_id is null then return; end if;
  insert into public.notifications (user_id, type, title, body, link)
  values (p_user_id, p_type, p_title, p_body, p_link);
end;
$$;

-- ----------------------- Triggers --------------------------

-- Mangel: Status-Change benachrichtigt den Reporter
create or replace function public.notify_mangel_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status and new.reported_by is not null then
    perform public.notify_user(
      new.reported_by,
      'mangel_status',
      'Mangel-Status: ' || coalesce(new.title, ''),
      'Status: ' || new.status,
      '/maengel'
    );
  end if;
  return new;
end;
$$;
drop trigger if exists notify_mangel_status_trg on public.studio_issues;
create trigger notify_mangel_status_trg
  after update on public.studio_issues
  for each row execute function public.notify_mangel_status();

-- Submission: Status-Change benachrichtigt den Einreicher
create or replace function public.notify_submission_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_template_title text;
begin
  if new.status is distinct from old.status and new.submitted_by is not null then
    select title into v_template_title from public.form_templates
      where id = new.template_id;
    perform public.notify_user(
      new.submitted_by,
      'submission_status',
      'Einreichung: ' || coalesce(v_template_title, 'Formular'),
      case
        when new.status = 'erledigt' then 'Erledigt'
        when new.status = 'abgelehnt' then 'Abgelehnt'
        when new.status = 'in_bearbeitung' then 'In Bearbeitung'
        else new.status
      end || coalesce(' · ' || new.admin_note, ''),
      '/formulare'
    );
  end if;
  return new;
end;
$$;
drop trigger if exists notify_submission_status_trg on public.form_submissions;
create trigger notify_submission_status_trg
  after update on public.form_submissions
  for each row execute function public.notify_submission_status();

-- Praxis-Entscheidung: bei freigegeben/abgelehnt
create or replace function public.notify_praxis_decision()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_task_title text;
begin
  if new.status is distinct from old.status
     and new.status in ('freigegeben', 'abgelehnt')
     and new.user_id is not null then
    select title into v_task_title from public.practical_tasks
      where id = new.practical_task_id;
    perform public.notify_user(
      new.user_id,
      'praxis_decision',
      case when new.status = 'freigegeben'
        then 'Praxis freigegeben: ' || coalesce(v_task_title, '')
        else 'Praxis abgelehnt: ' || coalesce(v_task_title, '')
      end,
      coalesce(new.reviewer_note, null),
      '/praxisfreigaben'
    );
  end if;
  return new;
end;
$$;
drop trigger if exists notify_praxis_decision_trg on public.user_practical_signoffs;
create trigger notify_praxis_decision_trg
  after update on public.user_practical_signoffs
  for each row execute function public.notify_praxis_decision();

-- Neue Aufgabe: assigned_to bekommt Notification
create or replace function public.notify_aufgabe_neu()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.assigned_to is not null and new.recurrence = 'none' then
    perform public.notify_user(
      new.assigned_to,
      'aufgabe_neu',
      'Neue Aufgabe: ' || coalesce(new.title, ''),
      coalesce(new.description, null),
      '/aufgaben'
    );
  end if;
  return new;
end;
$$;
drop trigger if exists notify_aufgabe_neu_trg on public.studio_tasks;
create trigger notify_aufgabe_neu_trg
  after insert on public.studio_tasks
  for each row execute function public.notify_aufgabe_neu();

-- Neue Q&A-Antwort auf eigene Frage benachrichtigt den Frager
create or replace function public.notify_qa_antwort()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_asked_by uuid;
  v_lesson_id uuid;
  v_lesson_title text;
begin
  select asked_by, lesson_id into v_asked_by, v_lesson_id
    from public.lesson_questions
    where id = new.question_id;
  if v_asked_by is null then return new; end if;
  if v_asked_by = new.answered_by then return new; end if; -- nicht sich selbst
  select title into v_lesson_title from public.lessons where id = v_lesson_id;
  perform public.notify_user(
    v_asked_by,
    'lektion_q_antwort',
    'Antwort auf deine Frage in: ' || coalesce(v_lesson_title, 'Lektion'),
    left(new.body, 140),
    '/lektionen/' || v_lesson_id::text
  );
  return new;
end;
$$;
drop trigger if exists notify_qa_antwort_trg on public.lesson_answers;
create trigger notify_qa_antwort_trg
  after insert on public.lesson_answers
  for each row execute function public.notify_qa_antwort();

-- Neue veroeffentlichte Info: alle aktiven Mitarbeiter
create or replace function public.notify_info_neu()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Nur wenn neu published wird (entweder bei INSERT oder beim Switch von false->true)
  if new.published is true and (
    tg_op = 'INSERT' or old.published is distinct from true
  ) then
    insert into public.notifications (user_id, type, title, body, link)
    select p.id,
           'info_neu',
           'Neue Info: ' || coalesce(new.title, ''),
           case new.importance
             when 'critical' then '⚠ Wichtig'
             when 'warning' then 'Beachten'
             else null
           end,
           '/infos'
    from public.profiles p
    where p.archived_at is null
      and p.role in ('mitarbeiter', 'fuehrungskraft', 'admin', 'superadmin');
  end if;
  return new;
end;
$$;
drop trigger if exists notify_info_neu_trg on public.studio_announcements;
create trigger notify_info_neu_trg
  after insert or update on public.studio_announcements
  for each row execute function public.notify_info_neu();
