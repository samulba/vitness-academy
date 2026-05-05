/**
 * Client-safe Types und Konstanten für Provisionen.
 * Server-Loaders + Berechnung liegen in lib/provisionen.ts.
 */

export type Laufzeit = "26" | "52" | "104" | "sonst";

export type EntryStatus =
  | "eingereicht"
  | "genehmigt"
  | "abgelehnt"
  | "storniert";

export const STATUS_LABEL: Record<EntryStatus, string> = {
  eingereicht: "Eingereicht",
  genehmigt: "Genehmigt",
  abgelehnt: "Abgelehnt",
  storniert: "Storniert",
};

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
  status: EntryStatus;
  reviewed_by: string | null;
  reviewed_by_name: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  storno_von_id: string | null;
  storno_grund: string | null;
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
  /** null = Default-Satz, sonst persönlicher Satz für diesen Vertriebler */
  vertriebler_id?: string | null;
  notiz?: string | null;
};

export type BonusStufe = {
  id: string;
  vertriebler_id: string | null;
  ab_abschluessen: number;
  bonus_prozent: number;
  valid_from: string;
  notiz: string | null;
};

/**
 * Findet den passenden Satz für einen Eintrag. Persönliche Sätze des
 * Vertrieblers gewinnen gegen den Default. Innerhalb der gleichen
 * Kategorie gewinnt der jüngste valid_from <= entry.datum.
 */
export function findeRate(
  entry: {
    laufzeit: Laufzeit;
    datum: string;
  },
  rates: CommissionRate[],
  vertrieblerId?: string | null,
): CommissionRate | null {
  const passende = rates.filter(
    (r) => r.laufzeit === entry.laufzeit && r.valid_from <= entry.datum,
  );
  // 1) Persönlicher Satz für den Vertriebler
  if (vertrieblerId) {
    const personal = passende
      .filter((r) => r.vertriebler_id === vertrieblerId)
      .sort((a, b) => b.valid_from.localeCompare(a.valid_from));
    if (personal[0]) return personal[0];
  }
  // 2) Default
  const defaults = passende
    .filter(
      (r) =>
        r.vertriebler_id === null || r.vertriebler_id === undefined,
    )
    .sort((a, b) => b.valid_from.localeCompare(a.valid_from));
  return defaults[0] ?? null;
}

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
  vertrieblerId?: string | null,
): number {
  const rate = findeRate(entry, rates, vertrieblerId);
  if (!rate) return 0;
  return (
    (entry.beitrag_netto * rate.prozent_beitrag) / 100 +
    (entry.startpaket * rate.prozent_startpaket) / 100
  );
}

/**
 * Findet die passende Bonus-Stufe für einen Vertriebler bei N
 * Abschlüssen. Persönliche Stufen gewinnen gegen Default. Höchste
 * passende Stufe gewinnt (z.B. ab 5: +3% UND ab 10: +5% → bei 12
 * Abschlüssen gilt +5%).
 */
export function findeBonusStufe(
  abschluesse: number,
  monatYYYYMM: string,
  stufen: BonusStufe[],
  vertrieblerId: string,
): BonusStufe | null {
  const monatsEnde = `${monatYYYYMM}-31`;
  const passend = stufen
    .filter(
      (s) =>
        s.valid_from <= monatsEnde &&
        s.ab_abschluessen <= abschluesse &&
        (s.vertriebler_id === vertrieblerId || s.vertriebler_id === null),
    )
    .sort((a, b) => {
      // Persönlich vor Default, dann nach ab_abschluessen desc
      if (a.vertriebler_id && !b.vertriebler_id) return -1;
      if (!a.vertriebler_id && b.vertriebler_id) return 1;
      return b.ab_abschluessen - a.ab_abschluessen;
    });
  return passend[0] ?? null;
}

/**
 * Berechnet die Monats-Provision inklusive Bonus-Stufe für einen
 * Vertriebler. Eingabe: nur 'genehmigt'-Einträge des Monats (Storno
 * mit Negativ-Beträgen sind dabei).
 */
export function berechneMonatsTotal(
  abschluesseProvision: number,
  abschluesseAnzahl: number,
  monatYYYYMM: string,
  stufen: BonusStufe[],
  vertrieblerId: string,
): { provision: number; bonus: number; total: number; stufe: BonusStufe | null } {
  const stufe = findeBonusStufe(
    abschluesseAnzahl,
    monatYYYYMM,
    stufen,
    vertrieblerId,
  );
  const bonus = stufe
    ? (abschluesseProvision * stufe.bonus_prozent) / 100
    : 0;
  return {
    provision: abschluesseProvision,
    bonus,
    total: abschluesseProvision + bonus,
    stufe,
  };
}

export function formatEuro(n: number): string {
  return n.toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
