"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { istUUID } from "@/lib/utils";
import {
  AKTIONEN,
  istMitarbeiterModul,
  MODULE,
  type Aktion,
  type Modul,
} from "@/lib/permissions";
import { SYSTEM_ROLE_IDS } from "@/lib/permissions";

const VALID_BASE_LEVELS = [
  "mitarbeiter",
  "fuehrungskraft",
  "admin",
  "superadmin",
] as const;
type BaseLevel = (typeof VALID_BASE_LEVELS)[number];

function validBaseLevel(s: string): BaseLevel | null {
  return (VALID_BASE_LEVELS as readonly string[]).includes(s)
    ? (s as BaseLevel)
    : null;
}

/**
 * Liest aus FormData die ausgewählten Permissions.
 * Felder heissen `permission_<modul>_<aktion>` mit value="on".
 *
 * Strict-Trennung (defense in depth gegen Form-Tampering):
 *  - base_level=mitarbeiter -> nur mitarbeiter-*-Permissions akzeptieren
 *  - base_level fuehrungskraft/admin -> nur Verwaltungs-Permissions
 *  - System-Rollen (is_system=true) ueberspringen den Filter, weil ihr
 *    Bereich nicht der Custom-Rollen-Logik folgt.
 */
function permissionsAusFormData(
  formData: FormData,
  baseLevel: BaseLevel | null,
  istSystemRolle: boolean,
): { modul: Modul; aktion: Aktion }[] {
  const permissions: { modul: Modul; aktion: Aktion }[] = [];
  for (const m of MODULE) {
    for (const a of AKTIONEN) {
      const key = `permission_${m}_${a}`;
      if (formData.get(key) !== "on") continue;
      if (!istSystemRolle && baseLevel) {
        const mitarbeiterPerm = istMitarbeiterModul(m);
        if (baseLevel === "mitarbeiter" && !mitarbeiterPerm) continue;
        if (baseLevel !== "mitarbeiter" && mitarbeiterPerm) continue;
      }
      permissions.push({ modul: m, aktion: a });
    }
  }
  return permissions;
}

/**
 * Legt eine neue Custom-Rolle an inkl. ihrer Permissions.
 * Nur Admin + Superadmin (RLS aus Migration 0061).
 */
export async function rolleAnlegen(formData: FormData): Promise<void> {
  await requirePermission("rollen", "create");

  const name = String(formData.get("name") ?? "").trim();
  const beschreibung = String(formData.get("beschreibung") ?? "").trim() || null;
  const baseLevelRaw = String(formData.get("base_level") ?? "mitarbeiter");
  const baseLevel = validBaseLevel(baseLevelRaw);

  if (name.length === 0) {
    redirect("/admin/rollen/neu?toast=error");
  }
  if (!baseLevel) {
    redirect("/admin/rollen/neu?toast=error");
  }

  const supabase = await createClient();

  // Doppelten Namen verhindern (case-insensitive). Index in 0025 ist
  // partial, schreibender INSERT bricht sonst hart ab.
  const { data: existing } = await supabase
    .from("roles")
    .select("id")
    .ilike("name", name)
    .is("archived_at", null)
    .maybeSingle();
  if (existing) {
    redirect("/admin/rollen/neu?toast=name_existiert");
  }

  const { data: created, error } = await supabase
    .from("roles")
    .insert({
      name,
      beschreibung,
      base_level: baseLevel,
      is_system: false,
    })
    .select("id")
    .single();
  if (error || !created) {
    console.error("[rolleAnlegen] insert failed:", error);
    redirect("/admin/rollen/neu?toast=error");
  }

  const permissions = permissionsAusFormData(formData, baseLevel, false);
  if (permissions.length > 0) {
    const rows = permissions.map((p) => ({
      role_id: created.id,
      modul: p.modul,
      aktion: p.aktion,
    }));
    const { error: permsError } = await supabase
      .from("role_permissions")
      .insert(rows);
    if (permsError) {
      console.error("[rolleAnlegen] permissions failed:", permsError);
    }
  }

  revalidatePath("/admin/rollen");
  redirect(`/admin/rollen/${created.id}?toast=created`);
}

/**
 * Aktualisiert eine Rolle. System-Rollen koennen nur in den
 * Permissions geändert werden -- Name/Beschreibung/base_level
 * bleiben fix.
 */
export async function rolleAktualisieren(
  id: string,
  formData: FormData,
): Promise<void> {
  await requirePermission("rollen", "edit");
  if (!istUUID(id)) redirect("/admin/rollen?toast=error");

  const supabase = await createClient();
  const { data: rolle } = await supabase
    .from("roles")
    .select("id, is_system")
    .eq("id", id)
    .maybeSingle();
  if (!rolle) redirect("/admin/rollen?toast=error");

  // Nur für Custom-Rollen: Name/Beschreibung/base_level updaten
  if (!rolle.is_system) {
    const name = String(formData.get("name") ?? "").trim();
    const beschreibung =
      String(formData.get("beschreibung") ?? "").trim() || null;
    const baseLevelRaw = String(formData.get("base_level") ?? "mitarbeiter");
    const baseLevel = validBaseLevel(baseLevelRaw);
    if (name.length === 0 || !baseLevel) {
      redirect(`/admin/rollen/${id}?toast=error`);
    }
    const { error } = await supabase
      .from("roles")
      .update({ name, beschreibung, base_level: baseLevel })
      .eq("id", id);
    if (error) {
      console.error("[rolleAktualisieren] update meta failed:", error);
      redirect(`/admin/rollen/${id}?toast=error`);
    }
  }

  // Permissions: Neu setzen (delete-all + insert).
  // Beide Fehler werfen wir explizit weiter (vorher nur geloggt) --
  // sonst zeigt das Form "Gespeichert" obwohl RLS den Schreibvorgang
  // blockiert hat.
  //
  // Filter-Baseline: Bei Custom-Rolle die DB-Baseline (vor Update) holen
  // und gegen die filtern; bei System-Rolle bleibt der Permissions-
  // Bereich frei. Falls die Action selbst gerade das base_level ändert,
  // ist der NEUE Wert relevant -- den ziehen wir wieder aus FormData.
  const aktuellesBaseLevel = rolle.is_system
    ? null
    : validBaseLevel(String(formData.get("base_level") ?? ""));
  const permissions = permissionsAusFormData(
    formData,
    aktuellesBaseLevel,
    rolle.is_system,
  );
  const { error: deleteError } = await supabase
    .from("role_permissions")
    .delete()
    .eq("role_id", id);
  if (deleteError) {
    console.error("[rolleAktualisieren] delete failed:", deleteError);
    redirect(`/admin/rollen/${id}?toast=error`);
  }
  if (permissions.length > 0) {
    const rows = permissions.map((p) => ({
      role_id: id,
      modul: p.modul,
      aktion: p.aktion,
    }));
    const { error: permsError } = await supabase
      .from("role_permissions")
      .insert(rows);
    if (permsError) {
      console.error("[rolleAktualisieren] insert failed:", permsError);
      redirect(`/admin/rollen/${id}?toast=error`);
    }
  }

  revalidatePath("/admin/rollen");
  revalidatePath(`/admin/rollen/${id}`);
  redirect(`/admin/rollen/${id}?toast=saved`);
}

/**
 * Archiviert eine Custom-Rolle. System-Rollen koennen nicht
 * archiviert werden. Profile mit dieser custom_role_id behalten den
 * FK -- die Rolle ist nur "ausgeblendet". Sicherer als delete weil
 * Audit-Log und Profile-Refs erhalten bleiben.
 */
export async function rolleArchivieren(id: string): Promise<void> {
  // Archivieren ist reversibel (setzt nur archived_at) -- edit-Permission
  // statt delete. Migration 0025 schliesst Admin explizit von rollen:delete
  // aus (nur Superadmin), aber Admin muss Custom-Rollen archivieren koennen.
  await requirePermission("rollen", "edit");
  if (!istUUID(id)) redirect("/admin/rollen?toast=error");

  const supabase = await createClient();
  const { data: rolle } = await supabase
    .from("roles")
    .select("id, is_system")
    .eq("id", id)
    .maybeSingle();
  if (!rolle || rolle.is_system) {
    redirect("/admin/rollen?toast=error");
  }

  const { error } = await supabase
    .from("roles")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id);
  if (error) {
    console.error("[rolleArchivieren] failed:", error);
    redirect(`/admin/rollen/${id}?toast=error`);
  }

  revalidatePath("/admin/rollen");
  redirect("/admin/rollen?toast=archived");
}

/**
 * Helper für die UI: laedt die Permissions einer System-Rolle als
 * Vorlage für das Anlegen einer neuen Custom-Rolle. Wird vom
 * "Vorlage laden"-Button genutzt -- aber als Server-Action damit man
 * die Permissions clientseitig rendern kann ohne extra-Query.
 */
export async function ladeSystemRollenVorlage(
  baseLevel: BaseLevel,
): Promise<{ modul: Modul; aktion: Aktion }[]> {
  await requirePermission("rollen", "view");
  const roleId = SYSTEM_ROLE_IDS[baseLevel];
  if (!roleId) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("role_permissions")
    .select("modul, aktion")
    .eq("role_id", roleId);
  const result: { modul: Modul; aktion: Aktion }[] = [];
  for (const p of (data ?? []) as { modul: string; aktion: string }[]) {
    if (
      (MODULE as readonly string[]).includes(p.modul) &&
      (AKTIONEN as readonly string[]).includes(p.aktion)
    ) {
      result.push({ modul: p.modul as Modul, aktion: p.aktion as Aktion });
    }
  }
  return result;
}
