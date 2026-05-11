/**
 * Client-safe Types und Helpers für Bug-Reports.
 * Server-Loader liegen in lib/bug-reports.ts und re-exportieren diese.
 */

export type BugStatus =
  | "neu"
  | "in_bearbeitung"
  | "behoben"
  | "verworfen"
  | "duplikat";

export type BugPrioritaet = "niedrig" | "normal" | "hoch" | "kritisch";

export type BugKategorie = "bug" | "ui" | "vorschlag" | "sonstiges";

export type BugQuelle = "error_popup" | "manuell";

export type BugReport = {
  id: string;
  error_digest: string | null;
  pfad: string | null;
  user_agent: string | null;
  fehler_message: string | null;
  fehler_stack: string | null;
  beschreibung: string | null;
  kategorie: BugKategorie;
  quelle: BugQuelle;
  screenshot_path: string | null;
  status: BugStatus;
  prioritaet: BugPrioritaet;
  duplikat_von: string | null;
  admin_notiz: string | null;
  reported_by: string | null;
  reported_by_name: string | null;
  assigned_to: string | null;
  assigned_to_name: string | null;
  meldungen_count: number;
  letzte_meldung_at: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
};

export const BUG_STATUS_LABEL: Record<BugStatus, string> = {
  neu: "Neu",
  in_bearbeitung: "In Bearbeitung",
  behoben: "Behoben",
  verworfen: "Verworfen",
  duplikat: "Duplikat",
};

export const BUG_PRIORITAET_LABEL: Record<BugPrioritaet, string> = {
  niedrig: "Niedrig",
  normal: "Normal",
  hoch: "Hoch",
  kritisch: "Kritisch",
};

export const BUG_KATEGORIE_LABEL: Record<BugKategorie, string> = {
  bug: "Bug / Fehler",
  ui: "UI-Problem",
  vorschlag: "Vorschlag",
  sonstiges: "Sonstiges",
};

export const BUG_QUELLE_LABEL: Record<BugQuelle, string> = {
  error_popup: "Fehler-Popup",
  manuell: "Manuell gemeldet",
};

/**
 * Status-Werte, die für Dedup als "noch offen" zaehlen.
 * Muss synchron zum Partial-Index in 0067_bug_reports.sql sein.
 */
export const BUG_OFFENE_STATUS: BugStatus[] = ["neu", "in_bearbeitung"];
