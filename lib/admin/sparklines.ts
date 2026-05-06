import { createClient } from "@/lib/supabase/server";
import { istNextJsControlFlow } from "@/lib/admin/safe-loader";

// Generischer Filter-Callback. Wir nutzen any-Typen, weil PostgREST-
// Builder unzaehlige Generics tragen die hier nicht ausgedrueckt werden
// muessen -- der Caller bekommt den FilterBuilder und kann frei .eq()
// .in() etc. aufrufen.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FilterFn = (q: any) => any;

/**
 * Liefert ein Number-Array mit den Counts der letzten N Tage.
 * Index 0 = aeltester Tag, Index N-1 = heute.
 *
 * Bei Fehler: ein Array mit lauter 0 (StatCard rendert dann eine
 * flache Linie -- besser als die Page komplett zu crashen).
 *
 * @param tabelle  Public-Schema-Tabelle (z.B. 'studio_issues')
 * @param dateField Spalte mit Timestamp (z.B. 'created_at')
 * @param tage      Anzahl Tage (default 7)
 * @param filter    Optional: zusaetzliche Filter via FilterBuilder-Callback
 */
export async function tagesCounts(
  tabelle: string,
  dateField: string,
  tage = 7,
  filter?: FilterFn,
): Promise<number[]> {
  try {
    const supabase = await createClient();
    const heute = new Date();
    heute.setHours(0, 0, 0, 0);
    const von = new Date(heute);
    von.setDate(von.getDate() - (tage - 1));

    let q = supabase
      .from(tabelle)
      .select(dateField)
      .gte(dateField, von.toISOString())
      .lte(dateField, new Date(heute.getTime() + 86_400_000 - 1).toISOString());
    if (filter) q = filter(q);
    const { data, error } = await q;
    if (error) {
      console.warn(`[tagesCounts] ${tabelle}.${dateField}:`, error.message);
      return new Array(tage).fill(0);
    }

    const counts = new Array(tage).fill(0);
    for (const row of (data ?? []) as unknown as Record<string, unknown>[]) {
      const raw = row[dateField];
      if (typeof raw !== "string") continue;
      const d = new Date(raw);
      d.setHours(0, 0, 0, 0);
      const diff = Math.floor((d.getTime() - von.getTime()) / 86_400_000);
      if (diff >= 0 && diff < tage) counts[diff] += 1;
    }
    return counts;
  } catch (e) {
    if (istNextJsControlFlow(e)) throw e;
    console.warn(`[tagesCounts] ${tabelle}.${dateField} unexpected:`, e);
    return new Array(tage).fill(0);
  }
}

/**
 * Errechnet einen einfachen Trend-Wert (Prozent) zwischen
 * der ersten und der zweiten Haelfte des Verlaufs. Praktisch fuer
 * StatCard-Trend-Badges.
 */
export function trendAusVerlauf(verlauf: number[]): {
  value: number;
  direction: "up" | "down";
} {
  if (verlauf.length < 4) return { value: 0, direction: "up" };
  const mitte = Math.floor(verlauf.length / 2);
  const ersteHaelfte = verlauf.slice(0, mitte).reduce((a, b) => a + b, 0);
  const zweiteHaelfte = verlauf.slice(mitte).reduce((a, b) => a + b, 0);
  if (ersteHaelfte === 0) {
    return {
      value: zweiteHaelfte > 0 ? 100 : 0,
      direction: zweiteHaelfte >= 0 ? "up" : "down",
    };
  }
  const change = ((zweiteHaelfte - ersteHaelfte) / ersteHaelfte) * 100;
  return {
    value: Math.round(Math.abs(change)),
    direction: change >= 0 ? "up" : "down",
  };
}
