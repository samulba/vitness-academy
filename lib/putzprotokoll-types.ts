/**
 * Client-safe Types fuer das Putzprotokoll-Feature.
 * KEINE Supabase-Imports — duerfen aus Client-Components importiert
 * werden.
 */

export type CleaningTemplate = {
  id: string;
  location_id: string;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type CleaningSection = {
  id: string;
  template_id: string;
  titel: string;
  aufgaben: string[];
  sort_order: number;
  created_at: string;
};

export type ProtocolStatus = "eingereicht" | "reviewed";

/**
 * Snapshot eines Bereichs pro Protokoll-Eintrag. Wird beim Submit
 * eingefroren — wenn das Template spaeter geaendert wird, bleibt
 * dieser Eintrag historisch korrekt.
 */
export type ProtocolSectionEntry = {
  section_id: string;
  titel: string;
  /** Aufgaben die der User abgehakt hat (string-array der Aufgaben-Texte) */
  tasks_done: string[];
  /** Mängel-/Bemerkungen-Notiz */
  maengel: string;
  /** Storage-Pfade im cleaning-photos-Bucket */
  photo_paths: string[];
};

export type CleaningProtocol = {
  id: string;
  location_id: string;
  datum: string; // YYYY-MM-DD
  sections: ProtocolSectionEntry[];
  general_note: string | null;
  status: ProtocolStatus;
  submitted_by: string | null;
  submitted_by_name: string | null;
  submitted_at: string;
  reviewed_by: string | null;
  reviewed_by_name: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  /** location.name fuer Anzeige (joined beim Laden) */
  location_name: string | null;
};

/**
 * Public-URL fuer ein Photo aus dem cleaning-photos-Bucket bauen.
 * Bucket ist public (siehe Migration 0055), also reicht ein
 * direkter URL-Pfad ohne Signed-URL.
 */
export function cleaningPhotoUrl(
  path: string | null | undefined,
  supabaseUrl: string,
): string | null {
  if (!path) return null;
  const base = supabaseUrl.replace(/\/$/, "");
  return `${base}/storage/v1/object/public/cleaning-photos/${path}`;
}

export const PROTOKOLL_PHOTOS_MAX = 5;
