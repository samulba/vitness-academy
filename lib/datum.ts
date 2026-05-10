/**
 * Pure Date-Utilities. Keine Locale-Abhaengigkeiten (Server/Client
 * deterministisch identisch). ISO-Format YYYY-MM-DD ueberall.
 */

const WOCHENTAGE_KURZ = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"] as const;

/**
 * Erweitert von+bis zu einer Liste aller Tage inkl. Endpunkten.
 * Erwartet ISO-Strings (YYYY-MM-DD). Gibt sortierte Tage zurueck.
 *
 * Edge-Cases:
 *   - bis < von  → leeres Array
 *   - von == bis → Array mit einem Tag
 *   - ungueltig  → leeres Array
 */
export function taglistVonBis(vonISO: string, bisISO: string): string[] {
  if (!vonISO || !bisISO) return [];
  const von = new Date(`${vonISO}T00:00:00Z`);
  const bis = new Date(`${bisISO}T00:00:00Z`);
  if (Number.isNaN(von.getTime()) || Number.isNaN(bis.getTime())) return [];
  if (bis < von) return [];

  const tage: string[] = [];
  const aktuell = new Date(von);
  while (aktuell <= bis) {
    tage.push(toISODate(aktuell));
    aktuell.setUTCDate(aktuell.getUTCDate() + 1);
  }
  return tage;
}

/**
 * Wochentag-Kurz (Mo/Di/Mi/...) für ein ISO-Date. Nutzt UTC damit
 * keine TZ-Surprises beim Berechnen entstehen.
 */
export function wochentagKurz(iso: string): string {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return "";
  return WOCHENTAGE_KURZ[d.getUTCDay()];
}

function toISODate(d: Date): string {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
