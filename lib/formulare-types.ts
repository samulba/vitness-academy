/**
 * Client-safe types und Konstanten für den Form-Builder.
 * Werden von Client-Components (RenderForm, EingaengeTable, etc.)
 * importiert -- duerfen daher KEIN createClient/cookies enthalten.
 *
 * lib/formulare.ts re-exportiert diese für Server-Convenience.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "date"
  | "number"
  | "select"
  | "checkbox"
  | "radio"
  | "file";

export type FormField = {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  help?: string;
  placeholder?: string;
  options?: string[];
  accept?: string;
  max_size_mb?: number;
};

export type FileWert = {
  path: string;
  name: string;
  size: number;
  type: string;
};

export function istFileWert(v: unknown): v is FileWert {
  return (
    typeof v === "object" &&
    v !== null &&
    "path" in v &&
    typeof (v as FileWert).path === "string"
  );
}

export type Status = "entwurf" | "aktiv" | "archiviert";

export type SubmissionStatus =
  | "eingereicht"
  | "in_bearbeitung"
  | "erledigt"
  | "abgelehnt";

export type Template = {
  id: string;
  location_id: string | null;
  slug: string;
  title: string;
  description: string | null;
  fields: FormField[];
  status: Status;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Submission = {
  id: string;
  template_id: string;
  submitted_by: string;
  submitted_by_name: string | null;
  template_title: string | null;
  data: Record<string, unknown>;
  status: SubmissionStatus;
  admin_note: string | null;
  submitted_at: string;
  processed_by: string | null;
  processed_by_name: string | null;
  processed_at: string | null;
};

export const STATUS_LABEL: Record<SubmissionStatus, string> = {
  eingereicht: "Eingereicht",
  in_bearbeitung: "In Bearbeitung",
  erledigt: "Erledigt",
  abgelehnt: "Abgelehnt",
};
