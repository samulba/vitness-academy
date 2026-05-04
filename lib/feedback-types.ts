/**
 * Client-safe Types und Konstanten fuer Mitglieder-Feedback.
 * Hat KEINE Supabase-Imports und kann von Client-Components genutzt
 * werden. Server-Loaders liegen in lib/feedback.ts und re-exportieren
 * diese Types.
 */

export type Sentiment = "positive" | "neutral" | "negative";

export type FeedbackKategorie =
  | "allgemein"
  | "service"
  | "sauberkeit"
  | "geraete"
  | "kurse"
  | "beitrag"
  | "sonstiges";

export const FEEDBACK_KATEGORIEN: ReadonlyArray<{
  value: FeedbackKategorie;
  label: string;
}> = [
  { value: "allgemein", label: "Allgemein" },
  { value: "service", label: "Service" },
  { value: "sauberkeit", label: "Sauberkeit" },
  { value: "geraete", label: "Geräte" },
  { value: "kurse", label: "Kurse" },
  { value: "beitrag", label: "Beitrag" },
  { value: "sonstiges", label: "Sonstiges" },
];

const VALID_KATEGORIEN: FeedbackKategorie[] = FEEDBACK_KATEGORIEN.map(
  (k) => k.value,
);
const VALID_SENTIMENTS: Sentiment[] = ["positive", "neutral", "negative"];

export function istValideKategorie(v: string): v is FeedbackKategorie {
  return (VALID_KATEGORIEN as string[]).includes(v);
}

export function istValidesSentiment(v: string): v is Sentiment {
  return (VALID_SENTIMENTS as string[]).includes(v);
}

export function kategorieLabel(v: string): string {
  return FEEDBACK_KATEGORIEN.find((k) => k.value === v)?.label ?? "Allgemein";
}

export type Feedback = {
  id: string;
  location_id: string | null;
  member_name: string | null;
  feedback_text: string;
  sentiment: Sentiment;
  category: FeedbackKategorie;
  captured_by: string | null;
  captured_by_name: string | null;
  captured_at: string;
};
