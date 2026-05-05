"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type ProvisionsErgebnis = { ok: true } | { ok: false; message: string };

const VALID_LAUFZEITEN = ["26", "52", "104", "sonst"];

function parseEuro(raw: FormDataEntryValue | null): number {
  if (raw === null || raw === undefined) return 0;
  const s = String(raw).trim().replace(/\./g, "").replace(",", ".");
  const n = parseFloat(s);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

export async function abschlussAnlegen(
  formData: FormData,
): Promise<ProvisionsErgebnis> {
  const profile = await requireProfile();
  if (!profile.kann_provisionen) {
    return { ok: false, message: "Keine Berechtigung für Provisions-Einträge." };
  }

  const datum = String(formData.get("datum") ?? "").trim();
  const mitglied_name = String(formData.get("mitglied_name") ?? "").trim();
  const mitglied_nummer =
    String(formData.get("mitglied_nummer") ?? "").trim() || null;
  const laufzeit = String(formData.get("laufzeit") ?? "");
  const bemerkung =
    String(formData.get("bemerkung") ?? "").trim() || null;
  const beitrag_14taegig = parseEuro(formData.get("beitrag_14taegig"));
  const beitrag_netto = parseEuro(formData.get("beitrag_netto"));
  const startpaket = parseEuro(formData.get("startpaket"));
  const getraenke_soli = parseEuro(formData.get("getraenke_soli"));

  if (!datum || !/^\d{4}-\d{2}-\d{2}$/.test(datum)) {
    return { ok: false, message: "Bitte ein gültiges Datum eingeben." };
  }
  if (mitglied_name.length < 2) {
    return { ok: false, message: "Mitglied-Name fehlt." };
  }
  if (!VALID_LAUFZEITEN.includes(laufzeit)) {
    return { ok: false, message: "Ungültige Laufzeit." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("commission_entries").insert({
    vertriebler_id: profile.id,
    location_id: profile.location_id,
    datum,
    mitglied_name,
    mitglied_nummer,
    laufzeit,
    beitrag_14taegig,
    beitrag_netto,
    startpaket,
    getraenke_soli,
    bemerkung,
  });
  if (error) {
    return { ok: false, message: "Speichern fehlgeschlagen: " + error.message };
  }

  revalidatePath("/provisionen");
  revalidatePath("/admin/provisionen");
  return { ok: true };
}

export async function abschlussLoeschen(
  id: string,
): Promise<ProvisionsErgebnis> {
  const profile = await requireProfile();
  const supabase = await createClient();
  const { error } = await supabase
    .from("commission_entries")
    .delete()
    .eq("id", id)
    .eq("vertriebler_id", profile.id);
  if (error) {
    return { ok: false, message: "Löschen fehlgeschlagen: " + error.message };
  }
  revalidatePath("/provisionen");
  revalidatePath("/admin/provisionen");
  return { ok: true };
}

export async function abschlussLoeschenAdmin(id: string): Promise<void> {
  await requireProfile();
  // Admin-RLS in der Tabelle prüft is_admin() -> Admin darf alles
  const supabase = await createClient();
  await supabase.from("commission_entries").delete().eq("id", id);
  revalidatePath("/provisionen");
  revalidatePath("/admin/provisionen");
  redirect("/admin/provisionen?toast=deleted");
}
