"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";

const COOKIE_NAME = "vitness_active_location";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 Jahr

export type StandortMembership = {
  id: string;
  name: string;
  is_primary: boolean;
};

/**
 * Liste der Studios, in denen der aktuelle User Mitglied ist.
 * Sortiert: primary zuerst, dann alphabetisch.
 */
export async function ladeMeineStandorte(
  userId: string,
): Promise<StandortMembership[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_locations")
    .select(
      `is_primary,
       locations:location_id ( id, name )`,
    )
    .eq("user_id", userId);

  type Roh = {
    is_primary: boolean;
    locations: { id: string; name: string } | null;
  };
  const rows = ((data ?? []) as unknown as Roh[]).filter((r) => r.locations);
  return rows
    .map((r) => ({
      id: r.locations!.id,
      name: r.locations!.name,
      is_primary: r.is_primary,
    }))
    .sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return a.name.localeCompare(b.name, "de");
    });
}

/**
 * Aktiver Standort fuer den aktuellen Request.
 * Reihenfolge:
 *   1. Cookie-Wert wenn der User Mitglied dort ist (sonst ungueltig)
 *   2. Primary-Location aus user_locations
 *   3. profiles.location_id (Legacy-Fallback)
 *   4. null wenn der User in keinem Studio Mitglied ist
 *
 * Optional: bereits geladene Standorte mitgeben, um Doppel-Query
 * im Layout zu vermeiden (Layout laedt sie ohnehin fuer den Switcher).
 */
export async function getAktiverStandort(
  vorgeladen?: StandortMembership[],
): Promise<StandortMembership | null> {
  const verfuegbar =
    vorgeladen ?? (await ladeMeineStandorte((await requireProfile()).id));
  if (verfuegbar.length === 0) return null;

  const jar = await cookies();
  const cookieValue = jar.get(COOKIE_NAME)?.value;
  if (cookieValue) {
    const treffer = verfuegbar.find((s) => s.id === cookieValue);
    if (treffer) return treffer;
  }

  const primary = verfuegbar.find((s) => s.is_primary);
  return primary ?? verfuegbar[0];
}

/**
 * Server-Action: setzt den aktiven Standort als Cookie.
 * Validiert dass der User in dem Standort wirklich Mitglied ist.
 * Wird vom Topbar-Switcher aufgerufen, danach revalidate("/", "layout")
 * damit alle Seiten frisch laden.
 */
export async function setAktiverStandort(locationId: string): Promise<void> {
  const profile = await requireProfile();
  const verfuegbar = await ladeMeineStandorte(profile.id);
  const erlaubt = verfuegbar.some((s) => s.id === locationId);
  if (!erlaubt) return;

  const jar = await cookies();
  jar.set(COOKIE_NAME, locationId, {
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
}

/**
 * Reset-Helper -- setzt zurueck auf primary. Wird z.B. bei
 * Logout aufgerufen oder beim Wechsel zur "Alle Standorte"-Sicht
 * (sobald die irgendwo gebraucht wird).
 */
export async function clearAktiverStandort(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
  revalidatePath("/", "layout");
}
