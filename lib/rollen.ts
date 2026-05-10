export type Rolle = "mitarbeiter" | "fuehrungskraft" | "admin" | "superadmin";

export type Profil = {
  id: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  role: Rolle;
  location_id: string | null;
  onboarding_done: boolean;
  archived_at: string | null;
  avatar_path: string | null;
  kann_provisionen: boolean;
  template_id: string | null;
  /** UUIDs der zugewiesenen Custom-Rollen (aus profile_roles-Junction,
   *  Migration 0066). Permissions aller zugewiesenen Rollen werden
   *  beim Laden UNIONiert. Leer wenn der User nur die Basis-Rolle hat. */
  custom_role_ids: ReadonlyArray<string>;
  /** Permissions als "modul:aktion"-Strings. Wird in getCurrentProfile()
   *  einmal pro Request via JOIN auf role_permissions geladen.
   *  Leer für User ohne Permission-Eintraege. */
  permissions: ReadonlySet<string>;
};

export function istAdmin(role: Rolle | undefined | null): boolean {
  return role === "admin" || role === "superadmin";
}

export function istFuehrungskraftOderHoeher(
  role: Rolle | undefined | null,
): boolean {
  return (
    role === "fuehrungskraft" || role === "admin" || role === "superadmin"
  );
}

export function startseiteFuerRolle(role: Rolle): string {
  return istAdmin(role) ? "/admin" : "/dashboard";
}
