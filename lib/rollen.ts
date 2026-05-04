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
