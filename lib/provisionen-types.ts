/**
 * Client-safe Types und Konstanten für Provisionen.
 * Server-Loaders + Berechnung liegen in lib/provisionen.ts.
 */

export type Laufzeit = "26" | "52" | "104" | "sonst";

export const LAUFZEIT_OPTIONS: ReadonlyArray<{
  value: Laufzeit;
  label: string;
}> = [
  { value: "26", label: "26 Wochen" },
  { value: "52", label: "52 Wochen" },
  { value: "104", label: "104 Wochen" },
  { value: "sonst", label: "Sonstige" },
];

export function laufzeitLabel(v: string): string {
  return LAUFZEIT_OPTIONS.find((l) => l.value === v)?.label ?? v;
}

export type CommissionEntry = {
  id: string;
  vertriebler_id: string;
  vertriebler_name: string | null;
  location_id: string | null;
  datum: string;
  mitglied_name: string;
  mitglied_nummer: string | null;
  laufzeit: Laufzeit;
  beitrag_14taegig: number;
  beitrag_netto: number;
  startpaket: number;
  getraenke_soli: number;
  bemerkung: string | null;
  /** Berechnet im App-Layer, nicht persistiert. */
  provision: number;
  created_at: string;
};

export type CommissionRate = {
  id: string;
  laufzeit: Laufzeit;
  prozent_beitrag: number;
  prozent_startpaket: number;
  valid_from: string;
};

/**
 * Provisions-Berechnung. Beide Sätze werden auf den Eintrag
 * angewendet:
 *   provision = (beitrag_netto * prozent_beitrag/100)
 *             + (startpaket    * prozent_startpaket/100)
 *
 * Wenn für die Laufzeit kein Satz mit valid_from <= entry.datum
 * existiert, ist die Provision 0 (sollte nicht passieren bei
 * korrekt geseedet).
 */
export function berechneProvision(
  entry: {
    laufzeit: Laufzeit;
    datum: string;
    beitrag_netto: number;
    startpaket: number;
  },
  rates: CommissionRate[],
): number {
  const passende = rates
    .filter((r) => r.laufzeit === entry.laufzeit && r.valid_from <= entry.datum)
    .sort((a, b) => b.valid_from.localeCompare(a.valid_from));
  const rate = passende[0];
  if (!rate) return 0;
  return (
    (entry.beitrag_netto * rate.prozent_beitrag) / 100 +
    (entry.startpaket * rate.prozent_startpaket) / 100
  );
}

export function formatEuro(n: number): string {
  return n.toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
