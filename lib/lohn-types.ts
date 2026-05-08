/**
 * Client-safe Types fuer Schichten + Lohnabrechnungen.
 * KEINE Supabase-Imports — duerfen aus Client-Components importiert
 * werden.
 */

export type Shift = {
  id: string;
  user_id: string;
  location_id: string | null;
  /** Freitext fuer Nicht-Studio-Schichten (Meeting, Homeoffice, ...) */
  bereich: string | null;
  /** YYYY-MM-DD */
  datum: string;
  /** HH:MM:SS oder HH:MM */
  von_zeit: string;
  bis_zeit: string;
  pause_minuten: number;
  notiz: string | null;
  /** location.name fuer Anzeige */
  location_name?: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Anzeige-Label: Studio-Name wenn vorhanden, sonst Bereich-Freitext,
 * sonst "—".
 */
export function shiftWo(s: Pick<Shift, "location_name" | "bereich">): string {
  return s.location_name ?? s.bereich ?? "—";
}

export type Lohnabrechnung = {
  id: string;
  user_id: string;
  /** Format YYYY-MM */
  monat: string;
  pdf_path: string;
  brutto_cents: number | null;
  netto_cents: number | null;
  hochgeladen_von: string | null;
  hochgeladen_von_name?: string | null;
  hochgeladen_am: string;
};

/**
 * Berechnet Netto-Stunden einer Schicht: (bis - von) - pause/60
 * Behandelt Uebernachtschicht (bis < von) durch +24h-Anpassung.
 * Returns Stunden als Dezimal (z.B. 7.5 = 7 Std 30 Min).
 */
export function shiftStunden(s: {
  von_zeit: string;
  bis_zeit: string;
  pause_minuten: number;
}): number {
  const [vH, vM] = parseZeit(s.von_zeit);
  const [bH, bM] = parseZeit(s.bis_zeit);
  let minuten = bH * 60 + bM - (vH * 60 + vM);
  if (minuten < 0) minuten += 24 * 60; // Uebernachtschicht
  minuten -= s.pause_minuten;
  return Math.max(0, minuten / 60);
}

function parseZeit(z: string): [number, number] {
  const parts = z.split(":");
  return [Number(parts[0] ?? 0), Number(parts[1] ?? 0)];
}

/**
 * Formatiert Stunden-Dezimalzahl als "HHh MMm" (z.B. 7.5 → "7h 30m")
 */
export function formatStunden(stunden: number): string {
  const h = Math.floor(stunden);
  const m = Math.round((stunden - h) * 60);
  if (m === 0) return `${h}h`;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

/**
 * Cents zu "1.234,56 €"
 */
export function formatEuro(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return "—";
  const euro = cents / 100;
  return euro.toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
  });
}

/**
 * Monat YYYY-MM zu "Mai 2026"
 */
export function monatLabel(monat: string): string {
  const [y, m] = monat.split("-");
  const date = new Date(Number(y), Number(m) - 1, 1);
  return date.toLocaleDateString("de-DE", {
    month: "long",
    year: "numeric",
  });
}

/**
 * Heutiger Monat als YYYY-MM
 */
export function aktuellerMonat(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/**
 * Vorheriger / naechster Monat (YYYY-MM)
 */
export function monatPlus(monat: string, delta: number): string {
  const [y, m] = monat.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/**
 * Erster und letzter Tag des Monats als ISO-String
 */
export function monatRange(monat: string): { von: string; bis: string } {
  const [y, m] = monat.split("-").map(Number);
  const ersterTag = new Date(Date.UTC(y, m - 1, 1));
  const letzterTag = new Date(Date.UTC(y, m, 0));
  return {
    von: toISO(ersterTag),
    bis: toISO(letzterTag),
  };
}

function toISO(d: Date): string {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
