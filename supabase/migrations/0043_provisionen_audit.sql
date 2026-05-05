-- =============================================================
-- 0043_provisionen_audit.sql
--
-- Audit-Log-Triggers für die Provisions-Tabellen. Reuse der
-- bestehenden audit_event()-Funktion aus Migration 0020.
--
-- Damit ist nachvollziehbar:
--   - Wer hat einen Eintrag genehmigt/abgelehnt/storniert?
--   - Wer hat einen Satz geändert?
--   - Wer hat einen Monat abgerechnet?
--   - Wer hat eine Auszahlung markiert?
--
-- Sichtbar im bestehenden /admin/audit-log.
-- =============================================================

drop trigger if exists audit_commission_entries_trg on public.commission_entries;
create trigger audit_commission_entries_trg
  after insert or update or delete on public.commission_entries
  for each row execute function public.audit_event();

drop trigger if exists audit_commission_rates_trg on public.commission_rates;
create trigger audit_commission_rates_trg
  after insert or update or delete on public.commission_rates
  for each row execute function public.audit_event();

drop trigger if exists audit_commission_rates_personal_trg on public.commission_rates_personal;
create trigger audit_commission_rates_personal_trg
  after insert or update or delete on public.commission_rates_personal
  for each row execute function public.audit_event();

drop trigger if exists audit_commission_bonus_stufen_trg on public.commission_bonus_stufen;
create trigger audit_commission_bonus_stufen_trg
  after insert or update or delete on public.commission_bonus_stufen
  for each row execute function public.audit_event();

drop trigger if exists audit_commission_payouts_trg on public.commission_payouts;
create trigger audit_commission_payouts_trg
  after insert or update or delete on public.commission_payouts
  for each row execute function public.audit_event();

drop trigger if exists audit_commission_targets_trg on public.commission_targets;
create trigger audit_commission_targets_trg
  after insert or update or delete on public.commission_targets
  for each row execute function public.audit_event();
