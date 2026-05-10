-- =============================================================
-- 0029_onboarding_templates_rls_tighten.sql
-- Verschaerft die SELECT-Policy auf onboarding_templates: nur Admins
-- duerfen lesen. Vorher konnten alle authentifizierten User die
-- Templates über direkte Supabase-API lesen (UI-Schutz reicht nicht).
-- Templates haben nichts mit normalen Mitarbeiter-Workflows zu tun.
-- =============================================================

drop policy if exists "onboarding_templates_authed_read"
  on public.onboarding_templates;

drop policy if exists "onboarding_templates_admin_read"
  on public.onboarding_templates;
create policy "onboarding_templates_admin_read"
  on public.onboarding_templates for select
  to authenticated
  using (public.is_admin());

-- Schreibe-Policy bleibt unveraendert (admin-only).
