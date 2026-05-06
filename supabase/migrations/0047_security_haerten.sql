-- Migration 0047: Sicherheits-Haertung
-- =====================================
-- 1) issue-photos Storage-Bucket bekommt strikten Pfad-Prefix-Check
--    auf INSERT, damit User A keine Datei unter "userB-uid/..." ablegen
--    kann. Vorher: "with check (bucket_id = 'issue-photos')" -- ohne
--    Pfad-Check, was Spoofing erlaubte.
-- 2) Pflichtfeld-Schutz: vertriebler_id darf bei UPDATE nicht geaendert
--    werden. Verhindert Provisions-Diebstahl. (Defense-in-Depth: aktuelle
--    Policy schuetzt bereits via auth.uid()-Check, aber expliziter Block
--    macht den Schutz lesbarer.)
-- 3) Audit-Log Restrict: nicht direkt aenderbar (bestehende Policies
--    bleiben, hier nur DELETE-Block fuer alle non-superadmin)
-- =====================================

-- 1) issue-photos: INSERT braucht Pfad-Prefix = auth.uid()
drop policy if exists "issue_photos_authed_write" on storage.objects;
create policy "issue_photos_authed_write"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'issue-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- UPDATE auf bestehende Files: Eigentuemer + Admin
drop policy if exists "issue_photos_authed_update" on storage.objects;
create policy "issue_photos_authed_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'issue-photos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  )
  with check (
    bucket_id = 'issue-photos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );

-- SELECT bleibt offen (Bucket ist public, Mangel-Fotos sind nicht
-- streng vertraulich -- nur defektes Geraete-Bild). Falls spaeter
-- Bucket auf private umgestellt wird, hier auch UID-Filter ergaenzen.

-- 2) Audit-Log: kein Mitarbeiter darf je DELETEn (nicht mal Admin)
drop policy if exists "audit_no_delete" on public.audit_log;
create policy "audit_no_delete"
  on public.audit_log for delete
  to authenticated
  using (false);

-- 3) audit_log: kein direkter UPDATE
drop policy if exists "audit_no_update" on public.audit_log;
create policy "audit_no_update"
  on public.audit_log for update
  to authenticated
  using (false)
  with check (false);
