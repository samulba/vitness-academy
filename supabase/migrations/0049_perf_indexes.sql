-- Migration 0049: Fehlende Indexes für Admin-Listen-Performance
-- ===============================================================
-- /admin/benutzer sortiert nach created_at DESC -- ohne Index = Full-Scan.
-- /admin/kontakte sortiert nach last_name + first_name -- ohne Index = Sort.
-- Studio-Issues + Form-Submissions -- created_at-only Filter braucht
-- eigenen Index, weil bestehender (status, created_at) bei reinem
-- created_at-Filter nicht greift.
-- ===============================================================

create index if not exists profiles_created_at_idx
  on public.profiles (created_at desc);

create index if not exists studio_contacts_name_idx
  on public.studio_contacts (last_name nulls last, first_name nulls last);

create index if not exists studio_issues_created_at_idx
  on public.studio_issues (created_at desc);

create index if not exists form_submissions_submitted_at_idx
  on public.form_submissions (submitted_at desc);

-- Mitarbeiter-Notizen werden pro Mitarbeiter geladen (siehe
-- mitarbeiter-notizen.ts) -- bestehender Index ist OK, hier nur
-- doppelt gesichert.
create index if not exists mitarbeiter_notizen_mitarbeiter_created_idx
  on public.mitarbeiter_notizen (mitarbeiter_id, created_at desc);
