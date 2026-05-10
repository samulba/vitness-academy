-- Migration 0048: get_studio_pulse() RPC für schnelles Admin-Dashboard
-- ====================================================================
-- Vorher: Admin-Dashboard machte 9 separate count-Queries via PostgREST
-- (Promise.all). Jeder Roundtrip ~50-100ms => 300-500ms zusaetzliche
-- Dashboard-Latenz.
-- Jetzt: 1 Postgres-Funktion liefert alle Counts in 1 Query.
-- ====================================================================

create or replace function public.get_studio_pulse(
  heute timestamptz,
  woche timestamptz
)
returns table (
  mitarbeiter             bigint,
  lernpfade               bigint,
  lektionen_heute         bigint,
  maengel_offen           bigint,
  maengel_heute           bigint,
  submissions_offen       bigint,
  submissions_heute       bigint,
  aufgaben_offen          bigint,
  aktive_diese_woche      bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  -- Defense-in-Depth: nur Fuehrungskraft+ darf den Studio-Puls sehen.
  -- Page-Layer hat schon requireRole, hier zusaetzlicher Schutz für
  -- den Fall direkter RPC-Calls.
  if not (public.is_admin() or public.is_staff_or_higher()) then
    raise exception 'Nicht autorisiert';
  end if;

  return query
  select
    (select count(*) from public.profiles)::bigint                                                                            as mitarbeiter,
    (select count(*) from public.learning_paths where status = 'aktiv')::bigint                                               as lernpfade,
    (select count(*) from public.user_lesson_progress where status = 'abgeschlossen' and completed_at >= heute)::bigint       as lektionen_heute,
    (select count(*) from public.studio_issues where status in ('offen','in_bearbeitung'))::bigint                            as maengel_offen,
    (select count(*) from public.studio_issues where created_at >= heute)::bigint                                             as maengel_heute,
    (select count(*) from public.form_submissions where status in ('eingereicht','in_bearbeitung'))::bigint                   as submissions_offen,
    (select count(*) from public.form_submissions where submitted_at >= heute)::bigint                                        as submissions_heute,
    (select count(*) from public.studio_tasks where completed_at is null)::bigint                                             as aufgaben_offen,
    (select count(distinct user_id) from public.user_lesson_progress where last_seen_at >= woche)::bigint                     as aktive_diese_woche;
end;
$$;

-- Nur authentifizierte Admin/Fuehrungskraft duerfen die Funktion
-- aufrufen. (security definer + Aufruf-Check via is_admin/is_staff_or_higher)
revoke all on function public.get_studio_pulse(timestamptz, timestamptz) from public;
grant execute on function public.get_studio_pulse(timestamptz, timestamptz) to authenticated;
