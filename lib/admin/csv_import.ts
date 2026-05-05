/**
 * Minimaler CSV-Parser für Mitarbeiter-Bulk-Import.
 * Unterstuetzt:
 * - Header-Row (erste Zeile = Spaltennamen)
 * - Komma als Trenner (oder Semikolon, autodetect)
 * - Doppelte Anfuehrungszeichen zum Quoten von Werten mit Trennzeichen
 *   ("...""...") für escaped Quote
 * - Leere Zeilen werden ignoriert
 */
export type Row = Record<string, string>;

export function parseCsv(text: string): Row[] {
  const cleaned = text.replace(/^﻿/, "").replace(/\r\n/g, "\n");
  const lines = cleaned.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  const sep = guessSeparator(lines[0]);
  const headers = parseLine(lines[0], sep).map((h) => h.trim().toLowerCase());
  const rows: Row[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i], sep);
    const row: Row = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = (cols[j] ?? "").trim();
    }
    rows.push(row);
  }
  return rows;
}

function guessSeparator(headerLine: string): string {
  const commas = (headerLine.match(/,/g) ?? []).length;
  const semis = (headerLine.match(/;/g) ?? []).length;
  return semis > commas ? ";" : ",";
}

function parseLine(line: string, sep: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === sep) {
        out.push(cur);
        cur = "";
      } else cur += ch;
    }
  }
  out.push(cur);
  return out;
}

export type BulkRow = {
  /** Original-Zeilennummer (1-indexed nach Header) zur Anzeige */
  zeile: number;
  vorname: string;
  nachname: string;
  email: string;
  rolle: "mitarbeiter" | "fuehrungskraft";
  /** Slugs / Titel der Lernpfade, semikolon-separiert */
  lernpfade: string[];
  /** Validation-Errors für diese Zeile, leer = OK */
  fehler: string[];
};

/**
 * Mappt rohe CSV-Rows auf BulkRow-Objekte und validiert clientseitig.
 */
export function buildBulkRows(
  rows: Row[],
  bekannteLernpfade: { id: string; title: string }[],
): BulkRow[] {
  const titelSet = new Map<string, string>(); // titel-lowercase -> id
  for (const lp of bekannteLernpfade) {
    titelSet.set(lp.title.toLowerCase(), lp.id);
  }

  return rows.map((r, idx) => {
    const fehler: string[] = [];
    const vorname = (r["vorname"] ?? r["first_name"] ?? "").trim();
    const nachname = (r["nachname"] ?? r["last_name"] ?? "").trim();
    const email = (r["email"] ?? r["e-mail"] ?? "").trim().toLowerCase();
    const rolleRaw = (r["rolle"] ?? r["role"] ?? "mitarbeiter").trim().toLowerCase();
    const lernpfadeRaw = (r["lernpfade"] ?? r["learning_paths"] ?? "")
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!vorname && !nachname) fehler.push("Vor- oder Nachname fehlt");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      fehler.push("E-Mail ungültig");
    if (!["mitarbeiter", "fuehrungskraft"].includes(rolleRaw))
      fehler.push("Rolle muss 'mitarbeiter' oder 'fuehrungskraft' sein");

    const lernpfadIds: string[] = [];
    for (const lp of lernpfadeRaw) {
      const id = titelSet.get(lp.toLowerCase());
      if (!id) {
        fehler.push(`Lernpfad nicht gefunden: ${lp}`);
      } else {
        lernpfadIds.push(id);
      }
    }

    return {
      zeile: idx + 2, // +1 fuer 1-index, +1 fuer Header
      vorname,
      nachname,
      email,
      rolle:
        rolleRaw === "fuehrungskraft" ? "fuehrungskraft" : "mitarbeiter",
      lernpfade: lernpfadIds,
      fehler,
    };
  });
}
