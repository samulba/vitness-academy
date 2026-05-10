import { createClient } from "@/lib/supabase/server";
import { istNextJsControlFlow } from "@/lib/admin/safe-loader";
import {
  AKTIONEN,
  MODULE,
  type Aktion,
  type Modul,
} from "@/lib/permissions";

/**
 * Loader + Types für die Rollenverwaltung.
 * Schema in Migration 0025_permissions_matrix.sql + 0061_permissions_extend.sql.
 */

export type RolleBaseLevel =
  | "mitarbeiter"
  | "fuehrungskraft"
  | "admin"
  | "superadmin";

export type RollePermission = { modul: Modul; aktion: Aktion };

export type RolleVoll = {
  id: string;
  name: string;
  beschreibung: string | null;
  base_level: RolleBaseLevel;
  is_system: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  /** Permission-Matrix als Array. Leer wenn keine Rechte erteilt. */
  permissions: RollePermission[];
  /** Anzahl Mitarbeiter mit dieser Custom-Rolle (custom_role_id-Match).
   *  Nur für Custom-Rollen relevant; bei System-Rollen NULL. */
  user_count: number | null;
};

type RolleRoh = {
  id: string;
  name: string;
  beschreibung: string | null;
  base_level: string;
  is_system: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

function validBaseLevel(s: string): RolleBaseLevel {
  if (
    s === "mitarbeiter" ||
    s === "fuehrungskraft" ||
    s === "admin" ||
    s === "superadmin"
  )
    return s;
  return "mitarbeiter";
}

function validModul(s: string): Modul | null {
  return (MODULE as readonly string[]).includes(s) ? (s as Modul) : null;
}
function validAktion(s: string): Aktion | null {
  return (AKTIONEN as readonly string[]).includes(s) ? (s as Aktion) : null;
}

/**
 * Laedt alle nicht-archivierten Rollen (System + Custom) inkl. ihrer
 * Permissions und der Anzahl zugewiesener User. Sortierung: System
 * zuerst (nach base_level), Custom danach alphabetisch.
 */
export async function ladeRollen(): Promise<RolleVoll[]> {
  try {
    const supabase = await createClient();
    const [rollenRes, permsRes, userCountsRes] = await Promise.all([
      supabase
        .from("roles")
        .select(
          "id, name, beschreibung, base_level, is_system, archived_at, created_at, updated_at",
        )
        .is("archived_at", null)
        .order("is_system", { ascending: false })
        .order("name", { ascending: true }),
      supabase.from("role_permissions").select("role_id, modul, aktion"),
      supabase
        .from("profiles")
        .select("custom_role_id")
        .not("custom_role_id", "is", null),
    ]);
    const rollen = (rollenRes.data ?? []) as RolleRoh[];
    const perms = (permsRes.data ?? []) as {
      role_id: string;
      modul: string;
      aktion: string;
    }[];
    const userRows = (userCountsRes.data ?? []) as {
      custom_role_id: string | null;
    }[];

    const permsByRole = new Map<string, RollePermission[]>();
    for (const p of perms) {
      const m = validModul(p.modul);
      const a = validAktion(p.aktion);
      if (!m || !a) continue;
      const list = permsByRole.get(p.role_id) ?? [];
      list.push({ modul: m, aktion: a });
      permsByRole.set(p.role_id, list);
    }

    const userCounts = new Map<string, number>();
    for (const u of userRows) {
      if (!u.custom_role_id) continue;
      userCounts.set(
        u.custom_role_id,
        (userCounts.get(u.custom_role_id) ?? 0) + 1,
      );
    }

    return rollen.map((r) => ({
      id: r.id,
      name: r.name,
      beschreibung: r.beschreibung,
      base_level: validBaseLevel(r.base_level),
      is_system: r.is_system,
      archived_at: r.archived_at,
      created_at: r.created_at,
      updated_at: r.updated_at,
      permissions: permsByRole.get(r.id) ?? [],
      user_count: r.is_system ? null : userCounts.get(r.id) ?? 0,
    }));
  } catch (e) {
    if (istNextJsControlFlow(e)) throw e;
    console.error("[ladeRollen] failed:", e);
    return [];
  }
}

export async function ladeRolle(id: string): Promise<RolleVoll | null> {
  try {
    const supabase = await createClient();
    const [rolleRes, permsRes, userCountRes] = await Promise.all([
      supabase
        .from("roles")
        .select(
          "id, name, beschreibung, base_level, is_system, archived_at, created_at, updated_at",
        )
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("role_permissions")
        .select("modul, aktion")
        .eq("role_id", id),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("custom_role_id", id),
    ]);
    if (!rolleRes.data) return null;
    const r = rolleRes.data as RolleRoh;
    const perms = (permsRes.data ?? []) as { modul: string; aktion: string }[];
    const permissions: RollePermission[] = [];
    for (const p of perms) {
      const m = validModul(p.modul);
      const a = validAktion(p.aktion);
      if (m && a) permissions.push({ modul: m, aktion: a });
    }
    return {
      id: r.id,
      name: r.name,
      beschreibung: r.beschreibung,
      base_level: validBaseLevel(r.base_level),
      is_system: r.is_system,
      archived_at: r.archived_at,
      created_at: r.created_at,
      updated_at: r.updated_at,
      permissions,
      user_count: r.is_system ? null : userCountRes.count ?? 0,
    };
  } catch (e) {
    if (istNextJsControlFlow(e)) throw e;
    console.error("[ladeRolle] failed:", e);
    return null;
  }
}
