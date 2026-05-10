/**
 * Permissions-Matrix für custom Rollen.
 *
 * Im DB-Schema (Migration 0025):
 *   - public.roles: System-Rollen + Custom-Rollen
 *   - public.role_permissions: Modul x Aktion pro Rolle
 *   - profiles.custom_role_id: optional, ueberschreibt Default-Permissions
 *
 * Im App-Layer:
 *   - getCurrentProfile() laedt das Permission-Set einmal pro Request
 *   - hasPermission(profil, modul, aktion) prüft im Code
 *   - requireRole / istAdmin sind Wrapper, die intern auf Permissions
 *     mappen -- bestehende Aufrufer bleiben unverändert.
 *
 * RLS bleibt vorerst auf der enum-Logik; Custom Rollen mit Basis-Level
 * "admin" erben dadurch automatisch alle DB-Rechte ihrer Basis-Rolle.
 *
 * Bereiche:
 *   - VERWALTUNG_MODULE: alles unter /admin/*. Default-deny --
 *     Permission muss explizit gesetzt sein.
 *   - MITARBEITER_MODULE: Tabs unter /(app)/*. Permissive default fuer
 *     Standard-Rollen ohne Custom-Rolle (siehe getCurrentProfile);
 *     Custom-Rollen filtern explizit.
 */

export const VERWALTUNG_MODULE = [
  "lernpfade",
  "quizze",
  "praxisaufgaben",
  "praxisfreigaben",
  "wissen",
  "aufgaben",
  "infos",
  "kontakte",
  "maengel",
  "formulare",
  "benutzer",
  "standorte",
  "rollen",
  "audit",
  "fortschritt",
  // Erweiterte Module (Migration 0061)
  "putzprotokolle",
  "onboarding-templates",
  "feedback",
  "lohn",
  "provisionen",
] as const;

/**
 * Mitarbeiter-Bereich-Module ("/(app)/*"-Tabs). Praefix "mitarbeiter-"
 * grenzt sie eindeutig von den gleichnamigen Verwaltungs-Modulen ab
 * (z.B. "lernpfade" = Admin-Verwaltung von Lernpfaden,
 * "mitarbeiter-lernpfade" = eigene Lernpfade durchgehen).
 *
 * Aktion ist immer nur "view" -- entweder darf der Mitarbeiter den Tab
 * sehen oder nicht. Was er auf der Seite tut, regelt RLS.
 */
export const MITARBEITER_MODULE = [
  "mitarbeiter-dashboard",
  "mitarbeiter-aufgaben",
  "mitarbeiter-formulare",
  "mitarbeiter-maengel",
  "mitarbeiter-putzprotokoll",
  "mitarbeiter-lohn",
  "mitarbeiter-provisionen",
  "mitarbeiter-infos",
  "mitarbeiter-feedback",
  "mitarbeiter-kontakte",
  "mitarbeiter-wissen",
  "mitarbeiter-lernpfade",
  "mitarbeiter-praxisfreigaben",
] as const;

export const MODULE = [
  ...VERWALTUNG_MODULE,
  ...MITARBEITER_MODULE,
] as const;

export type VerwaltungModul = (typeof VERWALTUNG_MODULE)[number];
export type MitarbeiterModul = (typeof MITARBEITER_MODULE)[number];
export type Modul = (typeof MODULE)[number];

export const AKTIONEN = ["view", "create", "edit", "delete"] as const;
export type Aktion = (typeof AKTIONEN)[number];

/**
 * Mitarbeiter-Module kennen nur "view". Im Rollen-Editor werden die
 * anderen Spalten fuer diese Module ausgeblendet.
 */
export const MITARBEITER_AKTIONEN = ["view"] as const;

export type Permission = { modul: Modul; aktion: Aktion };

export function istMitarbeiterModul(m: Modul): m is MitarbeiterModul {
  return (MITARBEITER_MODULE as readonly string[]).includes(m);
}

/** Aktionen, die fuer ein bestimmtes Modul gueltig sind. */
export function aktionenFuerModul(m: Modul): readonly Aktion[] {
  return istMitarbeiterModul(m) ? MITARBEITER_AKTIONEN : AKTIONEN;
}

export const MODUL_LABELS: Record<Modul, string> = {
  lernpfade: "Lernpfade",
  quizze: "Quizze",
  praxisaufgaben: "Praxisaufgaben",
  praxisfreigaben: "Praxisfreigaben (Inbox)",
  wissen: "Handbuch",
  aufgaben: "Studio-Aufgaben",
  infos: "Wichtige Infos",
  kontakte: "Kontakte",
  maengel: "Mängel-Inbox",
  formulare: "Formulare",
  benutzer: "Mitarbeiter",
  standorte: "Standorte",
  rollen: "Rollen & Rechte",
  audit: "Audit-Log",
  fortschritt: "Fortschritt",
  putzprotokolle: "Putzprotokolle",
  "onboarding-templates": "Onboarding-Templates",
  feedback: "Mitglieder-Feedback",
  lohn: "Lohnabrechnungen",
  provisionen: "Provisionen",
  // Mitarbeiter-Bereich
  "mitarbeiter-dashboard": "Mein Tag (Dashboard)",
  "mitarbeiter-aufgaben": "Aufgaben",
  "mitarbeiter-formulare": "Anfragen / Formulare",
  "mitarbeiter-maengel": "Mängel melden",
  "mitarbeiter-putzprotokoll": "Putzprotokoll",
  "mitarbeiter-lohn": "Schichten & Lohn",
  "mitarbeiter-provisionen": "Provisionen",
  "mitarbeiter-infos": "Wichtige Infos",
  "mitarbeiter-feedback": "Mitglieder-Feedback",
  "mitarbeiter-kontakte": "Kontakte",
  "mitarbeiter-wissen": "Handbuch",
  "mitarbeiter-lernpfade": "Lernpfade",
  "mitarbeiter-praxisfreigaben": "Praxisfreigaben",
};

export const AKTION_LABELS: Record<Aktion, string> = {
  view: "Sehen",
  create: "Anlegen",
  edit: "Bearbeiten",
  delete: "Löschen",
};

/**
 * UUIDs der 4 System-Rollen, deterministisch in Migration 0025 geseedet.
 */
export const SYSTEM_ROLE_IDS = {
  mitarbeiter: "00000000-0000-0000-0000-000000000001",
  fuehrungskraft: "00000000-0000-0000-0000-000000000002",
  admin: "00000000-0000-0000-0000-000000000003",
  superadmin: "00000000-0000-0000-0000-000000000004",
} as const;

export function permissionKey(modul: Modul, aktion: Aktion): string {
  return `${modul}:${aktion}`;
}

/**
 * Prüft ob eine Permission im Set vorhanden ist.
 * permissions ist die Liste der erteilten "modul:aktion"-Strings.
 */
export function hasPermission(
  permissions: ReadonlySet<string> | null | undefined,
  modul: Modul,
  aktion: Aktion,
): boolean {
  if (!permissions) return false;
  return permissions.has(permissionKey(modul, aktion));
}

/**
 * Prüft ob _irgendeine_ Permission auf das Modul existiert (z.B. für
 * Sidebar-Sichtbarkeit).
 */
export function hatModulZugriff(
  permissions: ReadonlySet<string> | null | undefined,
  modul: Modul,
): boolean {
  if (!permissions) return false;
  for (const a of aktionenFuerModul(modul)) {
    if (permissions.has(permissionKey(modul, a))) return true;
  }
  return false;
}
