"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth";

/** Stellt sicher dass es ein Template fuer den Standort gibt. */
export async function templateAnlegenWennFehlt(
  locationId: string,
): Promise<void> {
  await requirePermission("putzprotokolle", "create");
  const supabase = await createClient();
  const { data: existiert } = await supabase
    .from("cleaning_protocol_templates")
    .select("id")
    .eq("location_id", locationId)
    .maybeSingle();
  if (existiert) {
    redirect(`/admin/putzprotokolle/templates/${locationId}`);
    return;
  }
  await supabase
    .from("cleaning_protocol_templates")
    .insert({ location_id: locationId, active: true });
  revalidatePath("/admin/putzprotokolle/templates");
  redirect(`/admin/putzprotokolle/templates/${locationId}`);
}

export async function sectionAnlegen(
  templateId: string,
  formData: FormData,
): Promise<void> {
  await requirePermission("putzprotokolle", "create");
  const titel = String(formData.get("titel") ?? "").trim();
  if (titel.length < 2) {
    redirect(`/admin/putzprotokolle/templates?toast=titel-fehlt`);
    return;
  }

  const supabase = await createClient();
  // Standort des Templates ermitteln (fuer revalidate-Pfad)
  const { data: tpl } = await supabase
    .from("cleaning_protocol_templates")
    .select("location_id")
    .eq("id", templateId)
    .maybeSingle();

  // Hoechsten sort_order finden
  const { data: rows } = await supabase
    .from("cleaning_protocol_sections")
    .select("sort_order")
    .eq("template_id", templateId)
    .order("sort_order", { ascending: false })
    .limit(1);
  const naechster =
    rows && rows.length > 0 ? Number(rows[0].sort_order) + 1 : 1;

  await supabase.from("cleaning_protocol_sections").insert({
    template_id: templateId,
    titel,
    aufgaben: [],
    sort_order: naechster,
  });

  if (tpl?.location_id) {
    revalidatePath(`/admin/putzprotokolle/templates/${tpl.location_id}`);
  }
}

export async function sectionAktualisieren(
  sectionId: string,
  formData: FormData,
): Promise<void> {
  await requirePermission("putzprotokolle", "edit");
  const titel = String(formData.get("titel") ?? "").trim();
  const aufgabenRaw = String(formData.get("aufgaben") ?? "");
  // Eine Aufgabe pro Zeile
  const aufgaben = aufgabenRaw
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const supabase = await createClient();
  const { data: section } = await supabase
    .from("cleaning_protocol_sections")
    .select("template_id, cleaning_protocol_templates!inner(location_id)")
    .eq("id", sectionId)
    .maybeSingle();

  await supabase
    .from("cleaning_protocol_sections")
    .update({ titel, aufgaben })
    .eq("id", sectionId);

  // location_id aus dem Join lesen (nested via Supabase fetch)
  const locationId = (
    section as unknown as {
      cleaning_protocol_templates?: { location_id?: string };
    } | null
  )?.cleaning_protocol_templates?.location_id;
  if (locationId) {
    revalidatePath(`/admin/putzprotokolle/templates/${locationId}`);
  }
}

export async function sectionLoeschen(sectionId: string): Promise<void> {
  await requirePermission("putzprotokolle", "delete");
  const supabase = await createClient();
  const { data: section } = await supabase
    .from("cleaning_protocol_sections")
    .select("template_id, cleaning_protocol_templates!inner(location_id)")
    .eq("id", sectionId)
    .maybeSingle();
  await supabase
    .from("cleaning_protocol_sections")
    .delete()
    .eq("id", sectionId);
  const locationId = (
    section as unknown as {
      cleaning_protocol_templates?: { location_id?: string };
    } | null
  )?.cleaning_protocol_templates?.location_id;
  if (locationId) {
    revalidatePath(`/admin/putzprotokolle/templates/${locationId}`);
  }
}

export async function sectionVerschieben(
  sectionId: string,
  richtung: "up" | "down",
): Promise<void> {
  await requirePermission("putzprotokolle", "edit");
  const supabase = await createClient();

  const { data: section } = await supabase
    .from("cleaning_protocol_sections")
    .select("id, template_id, sort_order")
    .eq("id", sectionId)
    .maybeSingle();
  if (!section) return;

  const richtungOp = richtung === "up" ? "lt" : "gt";
  const orderRichtung = richtung === "up" ? false : true;

  const { data: nachbarn } = await supabase
    .from("cleaning_protocol_sections")
    .select("id, sort_order")
    .eq("template_id", section.template_id)
    [richtungOp]("sort_order", section.sort_order)
    .order("sort_order", { ascending: orderRichtung })
    .limit(1);
  if (!nachbarn || nachbarn.length === 0) return;

  const nachbar = nachbarn[0];
  await supabase
    .from("cleaning_protocol_sections")
    .update({ sort_order: nachbar.sort_order })
    .eq("id", section.id);
  await supabase
    .from("cleaning_protocol_sections")
    .update({ sort_order: section.sort_order })
    .eq("id", nachbar.id);

  const { data: tpl } = await supabase
    .from("cleaning_protocol_templates")
    .select("location_id")
    .eq("id", section.template_id)
    .maybeSingle();
  if (tpl?.location_id) {
    revalidatePath(`/admin/putzprotokolle/templates/${tpl.location_id}`);
  }
}
