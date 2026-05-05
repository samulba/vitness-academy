/**
 * Client-safe Types und Konstanten für Wichtige Infos. Hat KEINE
 * Supabase-Imports und kann von Client-Components genutzt werden.
 *
 * Server-Loaders (ladeAnnouncements, ladeReadIds, aktiveBannerInfo)
 * liegen in lib/infos.ts und re-exportieren diese Types für
 * Server-Code-Convenience.
 */

export type Importance = "info" | "warning" | "critical";

export type InfoKategorie =
  | "allgemein"
  | "geraete"
  | "schicht"
  | "mitglieder"
  | "sonstiges";

export const INFO_KATEGORIEN: ReadonlyArray<{
  value: InfoKategorie;
  label: string;
  iconKey: string;
}> = [
  { value: "allgemein", label: "Allgemein", iconKey: "megaphone" },
  { value: "geraete", label: "Geräte", iconKey: "wrench" },
  { value: "schicht", label: "Schicht & Vertretung", iconKey: "calendar-clock" },
  { value: "mitglieder", label: "Mitglieder", iconKey: "users" },
  { value: "sonstiges", label: "Sonstiges", iconKey: "more-horizontal" },
];

const KATEGORIE_VALUES: InfoKategorie[] = INFO_KATEGORIEN.map((k) => k.value);

export function istValideKategorie(value: string): value is InfoKategorie {
  return (KATEGORIE_VALUES as string[]).includes(value);
}

export function kategorieLabel(value: string): string {
  return INFO_KATEGORIEN.find((k) => k.value === value)?.label ?? "Allgemein";
}

export type Announcement = {
  id: string;
  location_id: string | null;
  category: InfoKategorie;
  title: string;
  body: string;
  importance: Importance;
  pinned: boolean;
  published: boolean;
  author_id: string | null;
  author_name: string | null;
  author_avatar_path: string | null;
  created_at: string;
  updated_at: string;
};
