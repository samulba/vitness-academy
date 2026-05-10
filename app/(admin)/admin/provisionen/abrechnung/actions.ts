"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ladeAbrechnungsVorschau } from "@/lib/provisionen";

/**
 * Locked einen Monat: nimmt Snapshot aus aktuellen genehmigten
 * Einträgen + Bonus-Stufen, schreibt eine Payout-Zeile pro
 * Vertriebler. Ab jetzt blockt der DB-Trigger jede Änderung an
 * commission_entries für betroffene Monate.
 */
export async function monatLocken(formData: FormData): Promise<void> {
  const profile = await requirePermission("provisionen", "edit");
  const monatYYYYMM = String(formData.get("monat_yyyymm") ?? "").trim();

  if (!/^\d{4}-\d{2}$/.test(monatYYYYMM)) {
    redirect("/admin/provisionen/abrechnung?toast=error");
  }

  const vorschau = await ladeAbrechnungsVorschau(monatYYYYMM);
  if (vorschau.length === 0) {
    // Nichts zu locken
    redirect(`/admin/provisionen/abrechnung/${monatYYYYMM}?toast=error`);
  }

  const supabase = await createClient();
  const inserts = vorschau.map((v) => ({
    monat_yyyymm: monatYYYYMM,
    vertriebler_id: v.vertriebler_id,
    abschluesse_anzahl: v.abschluesse_anzahl,
    provision_summe: v.provision_summe,
    bonus_summe: v.bonus_summe,
    total: v.total,
    bonus_stufe_info: v.bonus_stufe_info,
    locked_by: profile.id,
  }));
  const { error } = await supabase
    .from("commission_payouts")
    .insert(inserts);
  if (error) {
    redirect(`/admin/provisionen/abrechnung/${monatYYYYMM}?toast=error`);
  }

  revalidatePath("/admin/provisionen/abrechnung");
  revalidatePath(`/admin/provisionen/abrechnung/${monatYYYYMM}`);
  revalidatePath("/admin/provisionen");
  revalidatePath("/provisionen");
  redirect(`/admin/provisionen/abrechnung/${monatYYYYMM}?toast=saved`);
}

/**
 * Notausgang: Monat wieder entsperren. Nur Superadmin. Löscht alle
 * Payout-Zeilen des Monats. Einträge können dann wieder editiert
 * werden.
 */
export async function monatEntsperren(monatYYYYMM: string): Promise<void> {
  await requirePermission("provisionen", "delete");

  if (!/^\d{4}-\d{2}$/.test(monatYYYYMM)) {
    redirect("/admin/provisionen/abrechnung?toast=error");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("commission_payouts")
    .delete()
    .eq("monat_yyyymm", monatYYYYMM);

  if (error) {
    redirect(`/admin/provisionen/abrechnung/${monatYYYYMM}?toast=error`);
  }

  revalidatePath("/admin/provisionen/abrechnung");
  revalidatePath(`/admin/provisionen/abrechnung/${monatYYYYMM}`);
  revalidatePath("/admin/provisionen");
  revalidatePath("/provisionen");
  redirect(`/admin/provisionen/abrechnung?toast=deleted`);
}

/**
 * Markiert eine Payout-Zeile als ausgezahlt (mit Datum + Methode).
 * Triggert eine Notification an den Vertriebler.
 */
export async function auszahlungSetzen(
  payoutId: string,
  formData: FormData,
): Promise<void> {
  await requirePermission("provisionen", "edit");

  const am = String(formData.get("ausgezahlt_am") ?? "").trim();
  const via = String(formData.get("ausgezahlt_via") ?? "").trim();
  const note = String(formData.get("ausgezahlt_note") ?? "").trim() || null;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(am)) {
    redirect("/admin/provisionen/abrechnung?toast=error");
  }

  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("commission_payouts")
    .update({
      status: "ausgezahlt",
      ausgezahlt_am: am,
      ausgezahlt_via: via.length > 0 ? via : "ueberweisung",
      ausgezahlt_note: note,
    })
    .eq("id", payoutId)
    .select("vertriebler_id, monat_yyyymm, total")
    .maybeSingle();

  if (error || !row) {
    redirect("/admin/provisionen/abrechnung?toast=error");
  }

  // Notification an Vertriebler
  await supabase.from("notifications").insert({
    user_id: row.vertriebler_id,
    type: "praxis_decision",
    title: "Provision ausgezahlt",
    body: `Deine Provision für ${row.monat_yyyymm} (${row.total} €) wurde ausgezahlt.`,
    link: "/provisionen",
  });

  revalidatePath("/admin/provisionen/abrechnung");
  revalidatePath(`/admin/provisionen/abrechnung/${row.monat_yyyymm}`);
  revalidatePath("/provisionen");
  redirect(
    `/admin/provisionen/abrechnung/${row.monat_yyyymm}?toast=saved`,
  );
}

/**
 * Setzt eine Payout-Zeile zurück auf 'offen' (Korrektur).
 */
export async function auszahlungZuruecksetzen(
  payoutId: string,
): Promise<void> {
  await requirePermission("provisionen", "edit");

  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("commission_payouts")
    .update({
      status: "offen",
      ausgezahlt_am: null,
      ausgezahlt_via: null,
      ausgezahlt_note: null,
    })
    .eq("id", payoutId)
    .select("monat_yyyymm")
    .maybeSingle();

  if (error || !row) {
    redirect("/admin/provisionen/abrechnung?toast=error");
  }

  revalidatePath("/admin/provisionen/abrechnung");
  revalidatePath(`/admin/provisionen/abrechnung/${row.monat_yyyymm}`);
  revalidatePath("/provisionen");
  redirect(
    `/admin/provisionen/abrechnung/${row.monat_yyyymm}?toast=saved`,
  );
}
