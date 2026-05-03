export function formatProzent(value: number): string {
  if (!Number.isFinite(value)) return "0%";
  return `${Math.round(value)}%`;
}

export function formatDatum(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
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
