import { createClient } from "@/lib/supabase/server";
import { istNextJsControlFlow } from "@/lib/admin/safe-loader";
import {
  monatRange,
  shiftStunden,
  type Lohnabrechnung,
  type Shift,
} from "@/lib/lohn-types";

export {
  aktuellerMonat,
  formatEuro,
  formatStunden,
  monatLabel,
  monatPlus,
  monatRange,
  shiftStunden,
  shiftWo,
  type Lohnabrechnung,
  type Shift,
} from "@/lib/lohn-types";

const SHIFT_SELECT = `
  id, user_id, location_id, bereich, datum, von_zeit, bis_zeit, pause_minuten, notiz,
  created_at, updated_at,
  location:locations!shifts_location_id_fkey(name)
`;

type RohShift = Omit<Shift, "location_name"> & {
  location?: { name: string | null } | null;
};

function map(r: RohShift): Shift {
  return {
    ...r,
    location_name: r.location?.name ?? null,
  };
}

/**
 * Lade alle Schichten eines Users im Monat (von..bis inklusiv).
 * Sortiert chronologisch.
 */
export async function ladeShiftsImMonat(
  userId: string,
  monat: string,
): Promise<Shift[]> {
  const range = monatRange(monat);
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from("shifts")
      .select(SHIFT_SELECT)
      .eq("user_id", userId)
      .gte("datum", range.von)
      .lte("datum", range.bis)
      .order("datum", { ascending: true })
      .order("von_zeit", { ascending: true });
    if (error) return [];
    return ((data ?? []) as unknown as RohShift[]).map(map);
  } catch (e) {
    if (istNextJsControlFlow(e)) throw e;
    console.error("[ladeShiftsImMonat]", e);
    return [];
  }
}

/**
 * Summe der Netto-Stunden einer Shift-Liste.
 */
export function summeStunden(shifts: Shift[]): number {
  return shifts.reduce((s, sh) => s + shiftStunden(sh), 0);
}

/**
 * Lade Lohnabrechnung eines Users fuer einen Monat (oder null).
 */
export async function ladeLohnabrechnung(
  userId: string,
  monat: string,
): Promise<Lohnabrechnung | null> {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from("lohnabrechnungen")
      .select(`
        id, user_id, monat, pdf_path, brutto_cents, netto_cents,
        hochgeladen_von, hochgeladen_am,
        hochgeladen_von_profile:profiles!lohnabrechnungen_hochgeladen_von_fkey(full_name)
      `)
      .eq("user_id", userId)
      .eq("monat", monat)
      .maybeSingle();
    if (error || !data) return null;
    const profileJoin = data.hochgeladen_von_profile as unknown as
      | { full_name: string | null }
      | { full_name: string | null }[]
      | null;
    const profileName = Array.isArray(profileJoin)
      ? profileJoin[0]?.full_name ?? null
      : profileJoin?.full_name ?? null;
    return {
      id: data.id,
      user_id: data.user_id,
      monat: data.monat,
      pdf_path: data.pdf_path,
      brutto_cents: data.brutto_cents,
      netto_cents: data.netto_cents,
      hochgeladen_von: data.hochgeladen_von,
      hochgeladen_von_name: profileName,
      hochgeladen_am: data.hochgeladen_am,
    };
  } catch (e) {
    if (istNextJsControlFlow(e)) throw e;
    console.error("[ladeLohnabrechnung]", e);
    return null;
  }
}

/**
 * Lade alle Lohnabrechnungen eines Users (alle Monate, sortiert
 * neueste zuerst).
 */
export async function ladeAlleLohnabrechnungen(
  userId: string,
): Promise<Lohnabrechnung[]> {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from("lohnabrechnungen")
      .select(`
        id, user_id, monat, pdf_path, brutto_cents, netto_cents,
        hochgeladen_von, hochgeladen_am,
        hochgeladen_von_profile:profiles!lohnabrechnungen_hochgeladen_von_fkey(full_name)
      `)
      .eq("user_id", userId)
      .order("monat", { ascending: false });
    if (error) return [];
    return ((data ?? []) as unknown[]).map((r) => {
      const x = r as {
        id: string;
        user_id: string;
        monat: string;
        pdf_path: string;
        brutto_cents: number | null;
        netto_cents: number | null;
        hochgeladen_von: string | null;
        hochgeladen_am: string;
        hochgeladen_von_profile?:
          | { full_name: string | null }
          | { full_name: string | null }[]
          | null;
      };
      const join = x.hochgeladen_von_profile;
      const profileName = Array.isArray(join)
        ? join[0]?.full_name ?? null
        : join?.full_name ?? null;
      return {
        id: x.id,
        user_id: x.user_id,
        monat: x.monat,
        pdf_path: x.pdf_path,
        brutto_cents: x.brutto_cents,
        netto_cents: x.netto_cents,
        hochgeladen_von: x.hochgeladen_von,
        hochgeladen_von_name: profileName,
        hochgeladen_am: x.hochgeladen_am,
      };
    });
  } catch (e) {
    if (istNextJsControlFlow(e)) throw e;
    console.error("[ladeAlleLohnabrechnungen]", e);
    return [];
  }
}

/**
 * Erzeuge eine Signed-URL fuer einen Lohnabrechnung-PDF-Pfad.
 * Bucket ist privat — Signed-URLs laufen nach 1h ab. Server-Side
 * aufgerufen, RLS prueft Lese-Berechtigung.
 */
export async function lohnabrechnungSignedUrl(
  pdfPath: string,
): Promise<string | null> {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase.storage
      .from("lohnabrechnungen")
      .createSignedUrl(pdfPath, 60 * 60);
    if (error || !data) return null;
    return data.signedUrl;
  } catch (e) {
    if (istNextJsControlFlow(e)) throw e;
    console.error("[lohnabrechnungSignedUrl]", e);
    return null;
  }
}
