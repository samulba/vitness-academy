/**
 * Client-safe Types und Helpers fuer Mängel.
 * Server-Loaders liegen in lib/maengel.ts und re-exportieren diese.
 */

export type Status = "offen" | "in_bearbeitung" | "behoben" | "verworfen";
export type Severity = "niedrig" | "normal" | "kritisch";

export type Mangel = {
  id: string;
  location_id: string | null;
  title: string;
  description: string | null;
  photo_paths: string[];
  status: Status;
  severity: Severity;
  reported_by: string | null;
  reported_by_name: string | null;
  reported_by_avatar_path: string | null;
  assigned_to: string | null;
  assigned_to_name: string | null;
  resolution_note: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
};

export const STATUS_LABEL: Record<Status, string> = {
  offen: "Offen",
  in_bearbeitung: "In Bearbeitung",
  behoben: "Behoben",
  verworfen: "Verworfen",
};

export const SEVERITY_LABEL: Record<Severity, string> = {
  niedrig: "Niedrig",
  normal: "Normal",
  kritisch: "Kritisch",
};

/**
 * Pure function -- liefert public URL zu einem Storage-Pfad im
 * 'issue-photos'-Bucket. Sicher fuer Client-Komponenten, da kein
 * Supabase-Client-Import noetig ist (env-Var reicht).
 */
export function fotoUrlFuerPfad(
  path: string | null | undefined,
): string | null {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/issue-photos/${path}`;
}
