"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { getAktiverStandort } from "@/lib/standort-context";

export type Ergebnis =
  | { ok: true; id?: string }
  | { ok: false; message: string };

function parseFormZeit(s: string): string | null {
  // Erwartet "HH:MM" — gibt "HH:MM:00" zurueck. null wenn ungueltig.
  if (!/^\d{1,2}:\d{2}$/.test(s)) return null;
  const [h, m] = s.split(":").map(Number);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Liest Standort-Auswahl aus dem Form-Feld "wo" + optional "bereich":
 *   - "wo" = UUID         → location_id, bereich = null
 *   - "wo" = "sonstiges"  → bereich = freitext, location_id = null
 *   - "wo" = "" / fehlt   → fallback auf aktiven Standort
 */
function parseWo(
  woRaw: string,
  bereichRaw: string,
  fallbackLocationId: string | null,
): { location_id: string | null; bereich: string | null } | { error: string } {
  if (woRaw === "sonstiges") {
    const text = bereichRaw.trim();
    if (text.length === 0) {
      return { error: "Bitte beschreiben was du gemacht hast (z.B. Meeting)." };
    }
    if (text.length > 80) {
      return { error: "Bereich-Beschreibung max 80 Zeichen." };
    }
    return { location_id: null, bereich: text };
  }
  if (UUID_RE.test(woRaw)) {
    return { location_id: woRaw, bereich: null };
  }
  // Leer / unbekannt → fallback
  return { location_id: fallbackLocationId, bereich: null };
}

export async function shiftAnlegen(formData: FormData): Promise<Ergebnis> {
  const profile = await requireProfile();
  const aktiv = await getAktiverStandort();

  const datum = String(formData.get("datum") ?? "").trim();
  const von = String(formData.get("von_zeit") ?? "").trim();
  const bis = String(formData.get("bis_zeit") ?? "").trim();
  const pause = Number(formData.get("pause_minuten") ?? 0);
  const notiz = String(formData.get("notiz") ?? "").trim();
  const woRaw = String(formData.get("wo") ?? "").trim();
  const bereichRaw = String(formData.get("bereich") ?? "");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(datum)) {
    return { ok: false, message: "Datum fehlt." };
  }
  const vonOk = parseFormZeit(von);
  const bisOk = parseFormZeit(bis);
  if (!vonOk || !bisOk) {
    return { ok: false, message: "Bitte gültige Uhrzeiten eintragen." };
  }
  if (Number.isNaN(pause) || pause < 0) {
    return { ok: false, message: "Pause-Minuten muss eine Zahl ≥ 0 sein." };
  }

  const wo = parseWo(woRaw, bereichRaw, aktiv?.id ?? null);
  if ("error" in wo) {
    return { ok: false, message: wo.error };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shifts")
    .insert({
      user_id: profile.id,
      location_id: wo.location_id,
      bereich: wo.bereich,
      datum,
      von_zeit: vonOk,
      bis_zeit: bisOk,
      pause_minuten: pause,
      notiz: notiz || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      ok: false,
      message: "Fehler beim Speichern: " + (error?.message ?? "unbekannt"),
    };
  }

  revalidatePath("/lohn");
  return { ok: true, id: data.id };
}

export async function shiftAktualisieren(
  id: string,
  formData: FormData,
): Promise<Ergebnis> {
  const profile = await requireProfile();
  const aktiv = await getAktiverStandort();

  const datum = String(formData.get("datum") ?? "").trim();
  const von = String(formData.get("von_zeit") ?? "").trim();
  const bis = String(formData.get("bis_zeit") ?? "").trim();
  const pause = Number(formData.get("pause_minuten") ?? 0);
  const notiz = String(formData.get("notiz") ?? "").trim();
  const woRaw = String(formData.get("wo") ?? "").trim();
  const bereichRaw = String(formData.get("bereich") ?? "");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(datum)) {
    return { ok: false, message: "Datum fehlt." };
  }
  const vonOk = parseFormZeit(von);
  const bisOk = parseFormZeit(bis);
  if (!vonOk || !bisOk) {
    return { ok: false, message: "Bitte gültige Uhrzeiten eintragen." };
  }
  if (Number.isNaN(pause) || pause < 0) {
    return { ok: false, message: "Pause-Minuten muss eine Zahl ≥ 0 sein." };
  }

  const wo = parseWo(woRaw, bereichRaw, aktiv?.id ?? null);
  if ("error" in wo) {
    return { ok: false, message: wo.error };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("shifts")
    .update({
      datum,
      von_zeit: vonOk,
      bis_zeit: bisOk,
      pause_minuten: pause,
      notiz: notiz || null,
      location_id: wo.location_id,
      bereich: wo.bereich,
    })
    .eq("id", id)
    .eq("user_id", profile.id); // Defense-in-Depth zus. zu RLS

  if (error) {
    return { ok: false, message: "Fehler: " + error.message };
  }

  revalidatePath("/lohn");
  return { ok: true, id };
}

export async function shiftLoeschen(id: string): Promise<Ergebnis> {
  const profile = await requireProfile();
  const supabase = await createClient();
  const { error } = await supabase
    .from("shifts")
    .delete()
    .eq("id", id)
    .eq("user_id", profile.id);

  if (error) {
    return { ok: false, message: "Fehler: " + error.message };
  }

  revalidatePath("/lohn");
  return { ok: true };
}
