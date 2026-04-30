"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AKTIONEN, MODULE, type Aktion, type Modul } from "@/lib/permissions";

type Ergebnis = { ok: true; id?: string } | { ok: false; message: string };

function validBaseLevel(
  s: string,
): s is "mitarbeiter" | "fuehrungskraft" | "admin" | "superadmin" {
  return ["mitarbeiter", "fuehrungskraft", "admin", "superadmin"].includes(s);
}

export async function rolleAnlegen(formData: FormData): Promise<void> {
  await requireRole(["superadmin"]);

  const name = String(formData.get("name") ?? "").trim();
  const beschreibung =
    String(formData.get("beschreibung") ?? "").trim() || null;
  const base_level = String(formData.get("base_level") ?? "mitarbeiter");

  if (name.length === 0 || name.length > 60) {
    redirect("/admin/rollen/neu?fehler=name");
  }
  if (!validBaseLevel(base_level)) {
    redirect("/admin/rollen/neu?fehler=base_level");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("roles")
    .insert({ name, beschreibung, base_level, is_system: false })
    .select("id")
    .single();
  if (error || !data) {
    redirect("/admin/rollen/neu?fehler=insert");
  }

  revalidatePath("/admin/rollen");
  redirect(`/admin/rollen/${data.id}?toast=created`);
}

export async function rollePermissionsSpeichern(
  roleId: string,
  formData: FormData,
): Promise<void> {
  await requireRole(["superadmin"]);

  const supabase = await createClient();

  // Welche checkboxen sind angehakt?
  const erteilt: { role_id: string; modul: Modul; aktion: Aktion }[] = [];
  for (const modul of MODULE) {
    for (const aktion of AKTIONEN) {
      const value = formData.get(`p_${modul}_${aktion}`);
      if (value !== null) {
        erteilt.push({ role_id: roleId, modul, aktion });
      }
    }
  }

  // Komplettes Replace: erst loeschen, dann neu insert.
  const { error: delError } = await supabase
    .from("role_permissions")
    .delete()
    .eq("role_id", roleId);
  if (delError) {
    redirect(`/admin/rollen/${roleId}?fehler=delete`);
  }

  if (erteilt.length > 0) {
    const { error: insError } = await supabase
      .from("role_permissions")
      .insert(erteilt);
    if (insError) {
      redirect(`/admin/rollen/${roleId}?fehler=insert`);
    }
  }

  revalidatePath("/admin/rollen");
  revalidatePath(`/admin/rollen/${roleId}`);
  // Layout neu rendern, damit Sidebar fuer veraenderte Rolle aktualisiert
  revalidatePath("/", "layout");
  redirect(`/admin/rollen/${roleId}?toast=saved`);
}

export async function rolleStammdatenSpeichern(
  roleId: string,
  formData: FormData,
): Promise<void> {
  await requireRole(["superadmin"]);

  const name = String(formData.get("name") ?? "").trim();
  const beschreibung =
    String(formData.get("beschreibung") ?? "").trim() || null;
  const base_level = String(formData.get("base_level") ?? "mitarbeiter");

  if (name.length === 0 || name.length > 60) {
    redirect(`/admin/rollen/${roleId}?fehler=name`);
  }
  if (!validBaseLevel(base_level)) {
    redirect(`/admin/rollen/${roleId}?fehler=base_level`);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("roles")
    .update({ name, beschreibung, base_level })
    .eq("id", roleId)
    .eq("is_system", false);
  if (error) {
    redirect(`/admin/rollen/${roleId}?fehler=update`);
  }

  revalidatePath("/admin/rollen");
  revalidatePath(`/admin/rollen/${roleId}`);
  revalidatePath("/", "layout");
  redirect(`/admin/rollen/${roleId}?toast=saved`);
}

export async function rolleArchivieren(
  roleId: string,
): Promise<Ergebnis> {
  await requireRole(["superadmin"]);
  const supabase = await createClient();

  // Pruefen: ist System-Rolle?
  const { data: rolle } = await supabase
    .from("roles")
    .select("is_system")
    .eq("id", roleId)
    .maybeSingle();
  if (!rolle) return { ok: false, message: "Rolle nicht gefunden." };
  if (rolle.is_system) {
    return { ok: false, message: "System-Rollen können nicht archiviert werden." };
  }

  // Pruefen: hat noch Mitarbeiter?
  const { count } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("custom_role_id", roleId);
  if ((count ?? 0) > 0) {
    return {
      ok: false,
      message: `Noch ${count} Mitarbeiter in dieser Rolle — bitte erst umzuweisen.`,
    };
  }

  const { error } = await supabase
    .from("roles")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", roleId)
    .eq("is_system", false);
  if (error) return { ok: false, message: error.message };

  revalidatePath("/admin/rollen");
  return { ok: true };
}
