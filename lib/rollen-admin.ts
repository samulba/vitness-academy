import { createClient } from "@/lib/supabase/server";
import type { Aktion, Modul } from "@/lib/permissions";

export type RollenZeile = {
  id: string;
  name: string;
  beschreibung: string | null;
  base_level: "mitarbeiter" | "fuehrungskraft" | "admin" | "superadmin";
  is_system: boolean;
  archived_at: string | null;
  mitarbeiter_count: number;
  permission_count: number;
  created_at: string;
  updated_at: string;
};

export async function ladeRollen(): Promise<RollenZeile[]> {
  const supabase = await createClient();
  const { data: rollen } = await supabase
    .from("roles")
    .select(
      "id, name, beschreibung, base_level, is_system, archived_at, created_at, updated_at",
    )
    .order("is_system", { ascending: false })
    .order("name", { ascending: true });
  if (!rollen) return [];

  const ids = rollen.map((r) => r.id);
  const [{ data: zaehlung }, { data: permRows }] = await Promise.all([
    supabase
      .from("profiles")
      .select("custom_role_id")
      .in("custom_role_id", ids),
    supabase.from("role_permissions").select("role_id").in("role_id", ids),
  ]);

  const counts = new Map<string, number>();
  for (const row of zaehlung ?? []) {
    if (!row.custom_role_id) continue;
    counts.set(row.custom_role_id, (counts.get(row.custom_role_id) ?? 0) + 1);
  }
  const permCounts = new Map<string, number>();
  for (const row of permRows ?? []) {
    permCounts.set(row.role_id, (permCounts.get(row.role_id) ?? 0) + 1);
  }

  return rollen.map((r) => ({
    ...r,
    mitarbeiter_count: counts.get(r.id) ?? 0,
    permission_count: permCounts.get(r.id) ?? 0,
  })) as RollenZeile[];
}

export type RollenDetail = {
  id: string;
  name: string;
  beschreibung: string | null;
  base_level: "mitarbeiter" | "fuehrungskraft" | "admin" | "superadmin";
  is_system: boolean;
  archived_at: string | null;
  permissions: { modul: Modul; aktion: Aktion }[];
};

export async function ladeRolle(id: string): Promise<RollenDetail | null> {
  const supabase = await createClient();
  const { data: rolle } = await supabase
    .from("roles")
    .select("id, name, beschreibung, base_level, is_system, archived_at")
    .eq("id", id)
    .maybeSingle();
  if (!rolle) return null;

  const { data: perms } = await supabase
    .from("role_permissions")
    .select("modul, aktion")
    .eq("role_id", id);

  return {
    ...rolle,
    permissions: (perms ?? []) as { modul: Modul; aktion: Aktion }[],
  } as RollenDetail;
}
