import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  istFuehrungskraftOderHoeher,
  type Profil,
  type Rolle,
} from "@/lib/rollen";
import {
  MITARBEITER_MODULE,
  permissionKey,
  SYSTEM_ROLE_IDS,
  type Aktion,
  type Modul,
} from "@/lib/permissions";

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

export async function getCurrentProfile(): Promise<Profil | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Vier-Stufen-Fallback für Migrations-Lag (jeweils ein Step
  // weniger Spalten falls neuere Migration noch nicht ausgefuehrt):
  //   Plus  = mit custom_role_id (Migration 0025)
  //   Voll  = mit template_id (Migration 0050) ohne custom_role_id
  //   Mid   = mit kann_provisionen (Migration 0034) ohne beides
  //   Basis = ohne alle drei
  let row: Record<string, unknown> | null = null;
  const plus = await supabase
    .from("profiles")
    .select(
      "id, full_name, first_name, last_name, phone, role, location_id, onboarding_done, archived_at, avatar_path, kann_provisionen, template_id, custom_role_id",
    )
    .eq("id", user.id)
    .maybeSingle();
  if (plus.data) {
    row = plus.data as Record<string, unknown>;
  } else {
    const voll = await supabase
      .from("profiles")
      .select(
        "id, full_name, first_name, last_name, phone, role, location_id, onboarding_done, archived_at, avatar_path, kann_provisionen, template_id",
      )
      .eq("id", user.id)
      .maybeSingle();
    if (voll.data) {
      row = voll.data as Record<string, unknown>;
    } else {
      const mid = await supabase
        .from("profiles")
        .select(
          "id, full_name, first_name, last_name, phone, role, location_id, onboarding_done, archived_at, avatar_path, kann_provisionen",
        )
        .eq("id", user.id)
        .maybeSingle();
      if (mid.data) {
        row = mid.data as Record<string, unknown>;
      } else {
        const basis = await supabase
          .from("profiles")
          .select(
            "id, full_name, first_name, last_name, phone, role, location_id, onboarding_done, archived_at, avatar_path",
          )
          .eq("id", user.id)
          .maybeSingle();
        if (basis.data) row = basis.data as Record<string, unknown>;
      }
    }
  }
  if (!row) return null;

  const role = row.role as Rolle;
  const legacyCustomRoleId = (row.custom_role_id as string | null) ?? null;

  // Multi-Custom-Rollen aus profile_roles laden (Migration 0066).
  // Fallback: bei fehlender Tabelle (Migration noch nicht gelaufen)
  // greifen wir auf das alte legacyCustomRoleId zurueck -- nur als
  // Single-Rolle-Modus, damit nichts kaputtgeht.
  let customRoleIds: string[] = [];
  const junction = await supabase
    .from("profile_roles")
    .select("role_id")
    .eq("profile_id", user.id);
  if (junction.error) {
    if (legacyCustomRoleId) customRoleIds = [legacyCustomRoleId];
  } else {
    customRoleIds = (
      (junction.data ?? []) as { role_id: string }[]
    ).map((r) => r.role_id);
  }

  // base_level der zugewiesenen Custom-Rollen ermitteln, damit wir
  // unterscheiden zwischen "Mitarbeiter-Filter-Rolle" (additiv, nur
  // mitarbeiter-* Tabs) und "Verwaltungs-Rolle" (überschreibt
  // System-Defaults für /admin/*).
  const mitarbeiterCustomIds: string[] = [];
  const verwaltungsCustomIds: string[] = [];
  if (customRoleIds.length > 0) {
    const { data: rollenMeta } = await supabase
      .from("roles")
      .select("id, base_level")
      .in("id", customRoleIds);
    for (const r of (rollenMeta ?? []) as {
      id: string;
      base_level: string;
    }[]) {
      if (r.base_level === "mitarbeiter") mitarbeiterCustomIds.push(r.id);
      else verwaltungsCustomIds.push(r.id);
    }
  }

  // Effective Verwaltungs-Rollen-IDs: entweder die zugewiesenen Custom-
  // Verwaltungs-Rollen (override), sonst die System-Role für base_level.
  const effectiveVerwaltungsIds: string[] =
    verwaltungsCustomIds.length > 0
      ? verwaltungsCustomIds
      : [SYSTEM_ROLE_IDS[role]];

  // Mitarbeiter-Filter-Rollen kommen IMMER additiv dazu.
  const alleEffectiveIds = [
    ...effectiveVerwaltungsIds,
    ...mitarbeiterCustomIds,
  ];

  const permissionsSet: Set<string> = new Set();
  if (alleEffectiveIds.length > 0) {
    const { data: perms } = await supabase
      .from("role_permissions")
      .select("modul, aktion")
      .in("role_id", alleEffectiveIds);
    if (perms) {
      for (const p of perms as { modul: string; aktion: string }[]) {
        permissionsSet.add(`${p.modul}:${p.aktion}`);
      }
    }
  }

  // Permissive Default für den Mitarbeiter-Bereich:
  // Solange KEINE Mitarbeiter-Custom-Rolle zugewiesen ist, sieht der
  // User alle Mitarbeiter-Tabs (wie bisher). Sobald mindestens eine
  // Mitarbeiter-Custom-Rolle gesetzt ist, filtert sie strikt.
  // Spezialfall Provisionen: zusaetzlich an profiles.kann_provisionen
  // gekoppelt -- der Boolean bleibt die Quelle der Wahrheit für
  // "darf Provisionen eintragen" (RLS-Policies prüfen darauf).
  const kannProvisionen = Boolean(row.kann_provisionen);
  if (mitarbeiterCustomIds.length === 0) {
    for (const m of MITARBEITER_MODULE) {
      if (m === "mitarbeiter-provisionen") continue;
      permissionsSet.add(`${m}:view`);
    }
    if (kannProvisionen) {
      permissionsSet.add("mitarbeiter-provisionen:view");
    }
  }

  return {
    id: row.id as string,
    full_name: (row.full_name as string | null) ?? null,
    first_name: (row.first_name as string | null) ?? null,
    last_name: (row.last_name as string | null) ?? null,
    phone: (row.phone as string | null) ?? null,
    role,
    location_id: (row.location_id as string | null) ?? null,
    onboarding_done: Boolean(row.onboarding_done),
    archived_at: (row.archived_at as string | null) ?? null,
    avatar_path: (row.avatar_path as string | null) ?? null,
    kann_provisionen: kannProvisionen,
    template_id: (row.template_id as string | null) ?? null,
    custom_role_ids: customRoleIds,
    permissions: permissionsSet,
  };
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
    // Smart-Fallback: Fuehrungskraft+ bleibt im Admin-Bereich (nur diese
    // Action war zu strikt für ihre Rolle). Echter Mitarbeiter ohne
    // Admin-Zugang wird zur Mitarbeiter-Startseite geschickt.
    redirect(istFuehrungskraftOderHoeher(profile.role) ? "/admin" : "/dashboard");
  }
  return profile;
}

/**
 * Permission-basierter Auth-Check für Verwaltungs-Pages und Server-
 * Actions. Loest custom_role_id auf, sonst System-Role.
 *
 * Nutzung in Pages:    await requirePermission("maengel", "view")
 * Nutzung in Actions:  await requirePermission("maengel", "edit")
 *
 * Smart-Fallback wie requireRole: bei fehlender Permission ->
 *   Fuehrungskraft+ -> /admin
 *   Sonst           -> /dashboard
 *
 * Layout-Auth (requireRole im Admin-Layout) bleibt erste Verteidigungs-
 * linie -- entscheidet ob der User ueberhaupt im /admin/*-Bereich sein
 * darf. Diese Helper hier filtert dann auf Modul-Ebene.
 */
export async function requirePermission(
  modul: Modul,
  aktion: Aktion,
): Promise<Profil> {
  const profile = await requireProfile();
  const key = permissionKey(modul, aktion);
  if (!profile.permissions.has(key)) {
    redirect(istFuehrungskraftOderHoeher(profile.role) ? "/admin" : "/dashboard");
  }
  return profile;
}
