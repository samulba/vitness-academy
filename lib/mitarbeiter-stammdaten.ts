import { createClient } from "@/lib/supabase/server";
import { istNextJsControlFlow } from "@/lib/admin/safe-loader";

export type GeburtstagsKandidat = {
  id: string;
  full_name: string | null;
  geburtsdatum: string;
  // Datum dieses Jahres ('YYYY-MM-DD' im aktuellen oder kommenden Jahr)
  naechster_geburtstag: string;
  // Alter, das die Person an diesem Tag wird
  alter_neu: number;
  // Tage bis dahin (0 = heute, 1 = morgen, ...)
  tage_bis: number;
};

/**
 * Findet Mitarbeiter:innen mit Geburtstag in den nächsten N Tagen.
 * Defensiv: bei fehlender Spalte (Migration 0044) leeres Array.
 */
export async function ladeGeburtstageNaechste(
  tage = 14,
): Promise<GeburtstagsKandidat[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, geburtsdatum")
      .not("geburtsdatum", "is", null)
      .is("archived_at", null);
    if (error) {
      console.error("[ladeGeburtstage] error:", error);
      return [];
    }

    const heute = new Date();
    heute.setHours(0, 0, 0, 0);
    const grenze = new Date(heute);
    grenze.setDate(grenze.getDate() + tage);

    const out: GeburtstagsKandidat[] = [];
    type R = { id: string; full_name: string | null; geburtsdatum: string };
    for (const row of (data ?? []) as R[]) {
      const gb = new Date(row.geburtsdatum + "T00:00:00");
      if (Number.isNaN(gb.getTime())) continue;
      // Nächstes Vorkommen finden: dieses Jahr oder nächstes Jahr
      let naechster = new Date(
        heute.getFullYear(),
        gb.getMonth(),
        gb.getDate(),
      );
      if (naechster < heute) {
        naechster = new Date(
          heute.getFullYear() + 1,
          gb.getMonth(),
          gb.getDate(),
        );
      }
      if (naechster > grenze) continue;
      const tage_bis = Math.round(
        (naechster.getTime() - heute.getTime()) / 86_400_000,
      );
      const alter_neu = naechster.getFullYear() - gb.getFullYear();
      out.push({
        id: row.id,
        full_name: row.full_name,
        geburtsdatum: row.geburtsdatum,
        naechster_geburtstag: `${naechster.getFullYear()}-${String(
          naechster.getMonth() + 1,
        ).padStart(2, "0")}-${String(naechster.getDate()).padStart(2, "0")}`,
        alter_neu,
        tage_bis,
      });
    }
    return out.sort((a, b) => a.tage_bis - b.tage_bis);
  } catch (e) {
    if (istNextJsControlFlow(e)) throw e;
    console.error("[ladeGeburtstage] unexpected:", e);
    return [];
  }
}
