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

  // Erst mit neuen Spalten versuchen (custom_role_id, avatar_path).
  // Falls Migration noch nicht eingespielt ist, fallback auf altes SELECT,
  // damit die App nicht hart abstuerzt.
  let data: Record<string, unknown> | null = null;

  const erstesEnsureSelect = await supabase
    .from("profiles")
    .select(
      "id, full_name, first_name, last_name, phone, role, custom_role_id, location_id, onboarding_done, archived_at, avatar_path",
    )
    .eq("id", user.id)
    .single();

  if (erstesEnsureSelect.data) {
    data = erstesEnsureSelect.data as Record<string, unknown>;
  } else {
    // Fallback ohne custom_role_id (Migration 0025 noch nicht da)
    const fallback = await supabase
      .from("profiles")
      .select(
        "id, full_name, first_name, last_name, phone, role, location_id, onboarding_done, archived_at, avatar_path",
      )
      .eq("id", user.id)
      .single();
    if (fallback.data) {
      data = fallback.data as Record<string, unknown>;
    } else {
      // Letzter Fallback: Migration 0024 (avatar_path) noch nicht da
      const minimal = await supabase
        .from("profiles")
        .select(
          "id, full_name, first_name, last_name, phone, role, location_id, onboarding_done, archived_at",
        )
        .eq("id", user.id)
        .single();
      if (minimal.data) {
        data = minimal.data as Record<string, unknown>;
      }
    }
  }

  if (!data) return null;

  const customRoleId = (data.custom_role_id as string | null | undefined) ?? null;
  const role = data.role as keyof typeof SYSTEM_ROLE_IDS;
  const roleId = customRoleId ?? SYSTEM_ROLE_IDS[role];

  let permissions: ReadonlySet<string> = new Set();
  if (roleId) {
    const { data: perms } = await supabase
      .from("role_permissions")
      .select("modul, aktion")
      .eq("role_id", roleId);
    permissions = ladePermissionsSetFuerRolle(perms);
  }

  return {
    id: data.id as string,
    full_name: (data.full_name as string | null) ?? null,
    first_name: (data.first_name as string | null) ?? null,
    last_name: (data.last_name as string | null) ?? null,
    phone: (data.phone as string | null) ?? null,
    role,
    custom_role_id: customRoleId,
    location_id: (data.location_id as string | null) ?? null,
    onboarding_done: Boolean(data.onboarding_done),
    archived_at: (data.archived_at as string | null) ?? null,
    avatar_path: (data.avatar_path as string | null) ?? null,
    permissions,
  };
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
