import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profil, Rolle } from "@/lib/rollen";
import { SYSTEM_ROLE_IDS, permissionKey, type Aktion, type Modul } from "@/lib/permissions";

export type { Profil, Rolle } from "@/lib/rollen";
export {
  istAdmin,
  istFuehrungskraftOderHoeher,
  startseiteFuerRolle,
} from "@/lib/rollen";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

function ladePermissionsSetFuerRolle(
  rows: { modul: string; aktion: string }[] | null,
): ReadonlySet<string> {
  if (!rows || rows.length === 0) return new Set();
  return new Set(rows.map((r) => `${r.modul}:${r.aktion}`));
}

export async function getCurrentProfile(): Promise<Profil | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, full_name, first_name, last_name, phone, role, custom_role_id, location_id, onboarding_done, archived_at, avatar_path",
    )
    .eq("id", user.id)
    .single();

  if (error || !data) return null;

  const roleId =
    (data.custom_role_id as string | null) ??
    SYSTEM_ROLE_IDS[data.role as keyof typeof SYSTEM_ROLE_IDS];

  let permissions: ReadonlySet<string> = new Set();
  if (roleId) {
    const { data: perms } = await supabase
      .from("role_permissions")
      .select("modul, aktion")
      .eq("role_id", roleId);
    permissions = ladePermissionsSetFuerRolle(perms);
  }

  return { ...(data as Omit<Profil, "permissions">), permissions };
}

/**
 * Prueft ob das aktuelle Profil eine bestimmte Permission hat.
 * Reine Convenience -- die meisten Aufrufer nutzen requirePermission.
 */
export async function hasPermissionAsync(
  modul: Modul,
  aktion: Aktion,
): Promise<boolean> {
  const profile = await getCurrentProfile();
  if (!profile) return false;
  return profile.permissions.has(permissionKey(modul, aktion));
}

/**
 * Erzwingt eine Permission. Leitet zum Dashboard weiter, wenn nicht erteilt.
 */
export async function requirePermission(
  modul: Modul,
  aktion: Aktion,
): Promise<Profil> {
  const profile = await requireProfile();
  if (!profile.permissions.has(permissionKey(modul, aktion))) {
    redirect("/dashboard");
  }
  return profile;
}

export async function requireProfile(): Promise<Profil> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.archived_at) {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login?archived=1");
  }
  return profile;
}

export async function requireRole(roles: Rolle[]): Promise<Profil> {
  const profile = await requireProfile();
  if (!roles.includes(profile.role)) {
    redirect("/dashboard");
  }
  return profile;
}
