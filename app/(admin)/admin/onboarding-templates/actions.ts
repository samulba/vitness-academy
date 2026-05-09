"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { reorderBulk } from "@/lib/admin/reorder";
import { istUUID } from "@/lib/utils";
import type { Rolle } from "@/lib/rollen";

const VALIDE_ROLLEN: Rolle[] = [
  "mitarbeiter",
  "fuehrungskraft",
  "admin",
  "superadmin",
];

function payload(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const beschreibung =
    String(formData.get("beschreibung") ?? "").trim() || null;
  const role = String(formData.get("role") ?? "mitarbeiter") as Rolle;
  const lernpfad_ids = formData
    .getAll("lernpfade")
    .map((v) => String(v))
    .filter(istUUID);
  return { name, beschreibung, role, lernpfad_ids };
}

export async function templateAnlegen(formData: FormData): Promise<void> {
  const profile = await requireRole(["fuehrungskraft", "admin", "superadmin"]);
  const p = payload(formData);
  if (!p.name) redirect("/admin/onboarding-templates/neu?fehler=name");
  if (!VALIDE_ROLLEN.includes(p.role))
    redirect("/admin/onboarding-templates/neu?fehler=rolle");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("onboarding_templates")
    .insert({ ...p, created_by: profile.id })
    .select("id")
    .maybeSingle();
  if (error || !data?.id) {
    redirect("/admin/onboarding-templates?toast=error");
  }

  revalidatePath("/admin/onboarding-templates");
  revalidatePath("/admin/benutzer/neu");
  redirect(`/admin/onboarding-templates/${data.id}?toast=created`);
}

export async function templateAktualisieren(
  id: string,
  formData: FormData,
): Promise<void> {
  await requireRole(["fuehrungskraft", "admin", "superadmin"]);
  const p = payload(formData);
  if (!p.name) redirect(`/admin/onboarding-templates/${id}?fehler=name`);
  if (!VALIDE_ROLLEN.includes(p.role))
    redirect(`/admin/onboarding-templates/${id}?fehler=rolle`);

  const supabase = await createClient();
  const { error } = await supabase
    .from("onboarding_templates")
    .update(p)
    .eq("id", id);
  if (error) redirect(`/admin/onboarding-templates/${id}?toast=error`);

  revalidatePath("/admin/onboarding-templates");
  revalidatePath(`/admin/onboarding-templates/${id}`);
  revalidatePath("/admin/benutzer/neu");
  redirect(`/admin/onboarding-templates/${id}?toast=saved`);
}

export async function templateLoeschen(id: string): Promise<void> {
  await requireRole(["fuehrungskraft", "admin", "superadmin"]);
  const supabase = await createClient();
  const { error } = await supabase
    .from("onboarding_templates")
    .delete()
    .eq("id", id);
  if (error) {
    redirect(`/admin/onboarding-templates/${id}?toast=error`);
  }
  revalidatePath("/admin/onboarding-templates");
  revalidatePath("/admin/benutzer/neu");
  redirect("/admin/onboarding-templates?toast=deleted");
}

// =============================================================
// Checklist-Items pro Template
// =============================================================

/**
 * Anlegen eines Checklist-Items fuer ein bestimmtes Template ODER
 * Standard (template_id null). Sort-Order wird automatisch ans
 * Ende gesetzt.
 */
export async function checklistItemAnlegenFuer(
  templateId: string | null,
  formData: FormData,
): Promise<void> {
  await requireRole(["fuehrungskraft", "admin", "superadmin"]);
  const label = String(formData.get("label") ?? "").trim();
  const beschreibung =
    String(formData.get("beschreibung") ?? "").trim() || null;
  if (!label) {
    redirect(
      templateId
        ? `/admin/onboarding-templates/${templateId}?toast=error`
        : "/admin/onboarding-templates?toast=error",
    );
  }

  const supabase = await createClient();
  // sort_order = max + 10 (10er-Schritte fuer Drag-and-Drop-Spielraum)
  let q = supabase
    .from("onboarding_checklist_items")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);
  q = templateId ? q.eq("template_id", templateId) : q.is("template_id", null);
  const { data: maxRow } = await q.maybeSingle();
  const sort_order = ((maxRow?.sort_order as number | undefined) ?? 0) + 10;

  const { error } = await supabase.from("onboarding_checklist_items").insert({
    template_id: templateId,
    label,
    beschreibung,
    sort_order,
  });
  if (error) {
    console.error("[checklistItemAnlegenFuer]", error);
    redirect(
      templateId
        ? `/admin/onboarding-templates/${templateId}?toast=error`
        : "/admin/onboarding-templates?toast=error",
    );
  }

  revalidatePath("/admin/onboarding-templates");
  if (templateId) revalidatePath(`/admin/onboarding-templates/${templateId}`);
  revalidatePath("/admin/benutzer");
  redirect(
    templateId
      ? `/admin/onboarding-templates/${templateId}?toast=created`
      : "/admin/onboarding-templates?toast=created",
  );
}

export async function checklistItemAktualisieren(
  itemId: string,
  formData: FormData,
): Promise<void> {
  await requireRole(["fuehrungskraft", "admin", "superadmin"]);
  const label = String(formData.get("label") ?? "").trim();
  const beschreibung =
    String(formData.get("beschreibung") ?? "").trim() || null;
  if (!label) return;

  const supabase = await createClient();
  const { data: bestehend } = await supabase
    .from("onboarding_checklist_items")
    .select("template_id")
    .eq("id", itemId)
    .maybeSingle();
  const tid = (bestehend?.template_id as string | null | undefined) ?? null;

  const { error } = await supabase
    .from("onboarding_checklist_items")
    .update({ label, beschreibung })
    .eq("id", itemId);
  if (error) {
    console.error("[checklistItemAktualisieren]", error);
  }

  revalidatePath("/admin/onboarding-templates");
  if (tid) revalidatePath(`/admin/onboarding-templates/${tid}`);
  revalidatePath("/admin/benutzer");
}

export async function checklistItemLoeschenFuer(
  itemId: string,
): Promise<void> {
  await requireRole(["fuehrungskraft", "admin", "superadmin"]);
  const supabase = await createClient();
  const { data: item } = await supabase
    .from("onboarding_checklist_items")
    .select("template_id")
    .eq("id", itemId)
    .maybeSingle();
  const tid = (item?.template_id as string | null | undefined) ?? null;

  const { error } = await supabase
    .from("onboarding_checklist_items")
    .delete()
    .eq("id", itemId);
  if (error) {
    console.error("[checklistItemLoeschenFuer]", error);
  }

  revalidatePath("/admin/onboarding-templates");
  if (tid) revalidatePath(`/admin/onboarding-templates/${tid}`);
  revalidatePath("/admin/benutzer");
}

/**
 * Bulk-Reorder fuer Drag-and-Drop. Kein revalidatePath (wie bei
 * Modulen/Lektionen) -- lokaler Client-State zeigt schon korrekt.
 * Items haben eindeutige UUIDs, der Scope (templateId) wird nicht
 * im Update gebraucht -- nur beim Filtern in der UI.
 */
export async function checklistItemReihenfolgeBulk(
  neueIds: string[],
): Promise<{ ok: boolean; message?: string }> {
  await requireRole(["fuehrungskraft", "admin", "superadmin"]);
  return await reorderBulk({
    tabelle: "onboarding_checklist_items",
    ids: neueIds,
  });
}
