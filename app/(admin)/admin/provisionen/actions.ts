"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/**
 * Genehmigt einen ausstehenden Eintrag. Setzt Status auf 'genehmigt',
 * speichert Reviewer + Zeitstempel + optionale Notiz. Triggert eine
 * Notification an den Vertriebler.
 */
export async function abschlussGenehmigen(
  id: string,
  formData: FormData,
): Promise<void> {
  const profile = await requirePermission("provisionen", "edit");
  const note = String(formData.get("review_note") ?? "").trim();

  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("commission_entries")
    .update({
      status: "genehmigt",
      reviewed_by: profile.id,
      reviewed_at: new Date().toISOString(),
      review_note: note.length > 0 ? note : null,
    })
    .eq("id", id)
    .select("vertriebler_id, mitglied_name")
    .maybeSingle();

  if (error || !row) {
    redirect("/admin/provisionen/inbox?toast=error");
  }

  // Notification an Vertriebler
  await supabase.from("notifications").insert({
    user_id: row.vertriebler_id,
    type: "praxis_decision",
    title: "Abschluss genehmigt",
    body: `Dein Abschluss „${row.mitglied_name}" wurde genehmigt.`,
    link: "/provisionen",
  });

  revalidatePath("/admin/provisionen");
  revalidatePath("/admin/provisionen/inbox");
  revalidatePath("/provisionen");
  redirect("/admin/provisionen/inbox?toast=approved");
}

/**
 * Lehnt einen Eintrag ab mit Pflicht-Begründung. Vertriebler sieht
 * Notiz und kann neuen Eintrag anlegen.
 */
export async function abschlussAblehnen(
  id: string,
  formData: FormData,
): Promise<void> {
  const profile = await requirePermission("provisionen", "edit");
  const note = String(formData.get("review_note") ?? "").trim();

  if (note.length < 3) {
    redirect("/admin/provisionen/inbox?toast=error");
  }

  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("commission_entries")
    .update({
      status: "abgelehnt",
      reviewed_by: profile.id,
      reviewed_at: new Date().toISOString(),
      review_note: note,
    })
    .eq("id", id)
    .select("vertriebler_id, mitglied_name")
    .maybeSingle();

  if (error || !row) {
    redirect("/admin/provisionen/inbox?toast=error");
  }

  await supabase.from("notifications").insert({
    user_id: row.vertriebler_id,
    type: "praxis_decision",
    title: "Abschluss abgelehnt",
    body: `„${row.mitglied_name}": ${note}`,
    link: "/provisionen",
  });

  revalidatePath("/admin/provisionen");
  revalidatePath("/admin/provisionen/inbox");
  revalidatePath("/provisionen");
  redirect("/admin/provisionen/inbox?toast=rejected");
}

/**
 * Storniert einen genehmigten Eintrag. Erzeugt einen NEUEN Eintrag mit
 * negativen Beträgen und Status 'genehmigt' (damit das Netting in der
 * Provisions-Summe automatisch passiert). Setzt das Original auf
 * status='storniert'.
 */
export async function abschlussStornieren(
  id: string,
  formData: FormData,
): Promise<void> {
  const profile = await requirePermission("provisionen", "edit");
  const grund = String(formData.get("storno_grund") ?? "").trim();

  if (grund.length < 3) {
    redirect(`/admin/provisionen?toast=error`);
  }

  const supabase = await createClient();
  const { data: orig, error: fetchErr } = await supabase
    .from("commission_entries")
    .select(
      "vertriebler_id, location_id, datum, mitglied_name, mitglied_nummer, laufzeit, beitrag_14taegig, beitrag_netto, startpaket, getraenke_soli, status",
    )
    .eq("id", id)
    .maybeSingle();

  if (fetchErr || !orig) {
    redirect(`/admin/provisionen?toast=error`);
  }
  if (orig.status !== "genehmigt") {
    redirect(`/admin/provisionen?toast=error`);
  }

  // 1) Storno-Eintrag mit negativen Beträgen anlegen
  const { error: insErr } = await supabase.from("commission_entries").insert({
    vertriebler_id: orig.vertriebler_id,
    location_id: orig.location_id,
    datum: new Date().toISOString().slice(0, 10),
    mitglied_name: `${orig.mitglied_name} (Storno)`,
    mitglied_nummer: orig.mitglied_nummer,
    laufzeit: orig.laufzeit,
    beitrag_14taegig: -Number(orig.beitrag_14taegig ?? 0),
    beitrag_netto: -Number(orig.beitrag_netto ?? 0),
    startpaket: -Number(orig.startpaket ?? 0),
    getraenke_soli: -Number(orig.getraenke_soli ?? 0),
    bemerkung: `Storno: ${grund}`,
    status: "genehmigt",
    reviewed_by: profile.id,
    reviewed_at: new Date().toISOString(),
    storno_von_id: id,
    storno_grund: grund,
  });

  if (insErr) {
    redirect(`/admin/provisionen?toast=error`);
  }

  // 2) Original auf 'storniert' setzen
  const { error: updErr } = await supabase
    .from("commission_entries")
    .update({
      status: "storniert",
      reviewed_by: profile.id,
      reviewed_at: new Date().toISOString(),
      storno_grund: grund,
    })
    .eq("id", id);

  if (updErr) {
    redirect(`/admin/provisionen?toast=error`);
  }

  await supabase.from("notifications").insert({
    user_id: orig.vertriebler_id,
    type: "praxis_decision",
    title: "Abschluss storniert",
    body: `„${orig.mitglied_name}": ${grund}`,
    link: "/provisionen",
  });

  revalidatePath("/admin/provisionen");
  revalidatePath("/provisionen");
  redirect(`/admin/provisionen?toast=saved`);
}
