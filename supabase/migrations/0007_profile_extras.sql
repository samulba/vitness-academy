-- =============================================================
-- 0007_profile_extras.sql
-- Erweitert das profiles-Schema um getrennte Vor-/Nachnamen
-- und eine optionale Telefonnummer.
--
-- full_name bleibt bestehen (wird in vielen Stellen genutzt:
-- Topbar, Sidebar, Dashboard, Admin). Die Server-Action setzt
-- full_name automatisch aus first_name + last_name zusammen,
-- sobald einer der beiden Werte geändert wird.
-- =============================================================

alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name  text,
  add column if not exists phone      text;

-- Optional: Constraints für sinnvolle Maximallaengen
alter table public.profiles
  drop constraint if exists profiles_first_name_length;
alter table public.profiles
  add  constraint profiles_first_name_length
       check (first_name is null or char_length(first_name) <= 60);

alter table public.profiles
  drop constraint if exists profiles_last_name_length;
alter table public.profiles
  add  constraint profiles_last_name_length
       check (last_name is null or char_length(last_name) <= 60);

alter table public.profiles
  drop constraint if exists profiles_phone_length;
alter table public.profiles
  add  constraint profiles_phone_length
       check (phone is null or char_length(phone) <= 40);

-- Backfill: bestehende full_names heuristisch in first/last splitten
update public.profiles
set
  first_name = coalesce(first_name, split_part(full_name, ' ', 1)),
  last_name  = coalesce(
    last_name,
    nullif(trim(substring(full_name from position(' ' in full_name))), '')
  )
where full_name is not null
  and (first_name is null or last_name is null);
