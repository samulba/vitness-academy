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

  // Vier-Stufen-Fallback fuer Migrations-Lag (jeweils ein Step
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
  const customRoleId = (row.custom_role_id as string | null) ?? null;

  // Permissions laden: effective Role-ID = custom_role_id (falls gesetzt),
  // sonst die System-Role-UUID aus der Basis-Rolle. Defensiv: bei
  // fehlender Tabelle (Migration noch nicht gelaufen) leeres Set.
  const effectiveRoleId = customRoleId ?? SYSTEM_ROLE_IDS[role];
  let permissionsSet: Set<string> = new Set();
  if (effectiveRoleId) {
    const { data: perms } = await supabase
      .from("role_permissions")
      .select("modul, aktion")
      .eq("role_id", effectiveRoleId);
    if (perms) {
      permissionsSet = new Set(
        perms.map(
          (p: { modul: string; aktion: string }) => `${p.modul}:${p.aktion}`,
        ),
      );
    }
  }

  // Permissive Default fuer den Mitarbeiter-Bereich:
  // System-Rollen ohne Custom-Rolle (Standard-Mitarbeiter, Fuehrungs-
  // kraft+, etc.) sehen alle Mitarbeiter-Tabs wie bisher. Nur Custom-
  // Rollen muessen Mitarbeiter-Module explizit gesetzt bekommen, sonst
  // sieht der User die jeweiligen Tabs nicht.
  // Spezialfall Provisionen: zusaetzlich an profiles.kann_provisionen
  // gekoppelt -- der Boolean bleibt die Quelle der Wahrheit fuer
  // "darf Provisionen eintragen" (RLS-Policies pruefen darauf).
  const istCustomRolle = customRoleId !== null;
  const kannProvisionen = Boolean(row.kann_provisionen);
  if (!istCustomRolle) {
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
    custom_role_id: customRoleId,
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
    // Action war zu strikt fuer ihre Rolle). Echter Mitarbeiter ohne
    // Admin-Zugang wird zur Mitarbeiter-Startseite geschickt.
    redirect(istFuehrungskraftOderHoeher(profile.role) ? "/admin" : "/dashboard");
  }
  return profile;
}

/**
 * Permission-basierter Auth-Check fuer Verwaltungs-Pages und Server-
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
