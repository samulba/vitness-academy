export function formatProzent(value: number): string {
  if (!Number.isFinite(value)) return "0%";
  return `${Math.round(value)}%`;
}

/**
 * Liefert deterministisches "DD.MM.YYYY"-Format unabhängig von ICU/
 * Locale-Verfügbarkeit. Vermeidet Hydration-Mismatches zwischen Node
 * (Server) und Browser bei minimalen Builds ohne Intl-Locales.
 */
export function formatDatum(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

/**
 * Uhrzeit deterministisch in Europe/Berlin formatieren — auch wenn
 * der Server in UTC laeuft. timestamptz aus der DB ist UTC, hier
 * wird's auf die lokale Zeitzone der App-Nutzer:innen umgerechnet.
 */
export function formatUhrzeitBerlin(
  date: string | Date | null | undefined,
): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
  });
}

/**
 * Datum + Uhrzeit (Europe/Berlin) — z.B. "12.05.2026, 14:32".
 */
export function formatDatumUhrzeitBerlin(
  date: string | Date | null | undefined,
): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
  });
}

export function rolleLabel(role: string | null | undefined): string {
  switch (role) {
    case "mitarbeiter":
      return "Mitarbeiter";
    case "fuehrungskraft":
      return "Führungskraft";
    case "admin":
      return "Admin";
    case "superadmin":
      return "Superadmin";
    default:
      return "Unbekannt";
  }
}

export function fortschrittLabel(status: string | null | undefined): string {
  switch (status) {
    case "abgeschlossen":
      return "Abgeschlossen";
    case "in_bearbeitung":
      return "In Bearbeitung";
    case "nicht_gestartet":
    case null:
    case undefined:
      return "Noch nicht gestartet";
    default:
      return "Unbekannt";
  }
}
