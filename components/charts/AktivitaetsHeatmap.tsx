"use client";

import { useMemo } from "react";

/**
 * GitHub-Style Activity-Heatmap. 53 Wochen Spalten × 7 Tage Zeilen.
 * Zellen-Sättigung in Magenta von 0 (transparent) bis Max-Wert.
 *
 * Input: Map<isoDate, count> -- z.B. lessonen-pro-tag aus
 * lib/lektion.aktivitaetsStats() oder eine eigene Aggregation.
 */
export function AktivitaetsHeatmap({
  data,
  bisDatum,
  beschriftung = "Lektionen pro Tag",
}: {
  /** Map<YYYY-MM-DD, count> der letzten ~365 Tage */
  data: Record<string, number>;
  /** Letzter Tag (default: heute). Format: YYYY-MM-DD */
  bisDatum?: string;
  beschriftung?: string;
}) {
  const { wochen, max, gesamtAktiv, summe } = useMemo(() => {
    const ende = bisDatum
      ? new Date(bisDatum + "T00:00:00")
      : new Date(new Date().setHours(0, 0, 0, 0));

    // Gehe 52 Wochen zurueck und finde den Sonntag, an dem die
    // erste Spalte beginnt
    const start = new Date(ende);
    start.setDate(ende.getDate() - 52 * 7);
    // Auf Montag der ersten Woche
    const startDay = (start.getDay() + 6) % 7; // Mo=0
    start.setDate(start.getDate() - startDay);

    const tage: { date: string; count: number; weekday: number }[] = [];
    const cur = new Date(start);
    let max = 0;
    let aktiv = 0;
    let summe = 0;
    while (cur <= ende) {
      const iso = cur.toISOString().slice(0, 10);
      const c = data[iso] ?? 0;
      const wd = (cur.getDay() + 6) % 7;
      tage.push({ date: iso, count: c, weekday: wd });
      if (c > max) max = c;
      if (c > 0) aktiv++;
      summe += c;
      cur.setDate(cur.getDate() + 1);
    }

    // In Wochen aufteilen (Spalten)
    const wochen: { date: string; count: number; weekday: number }[][] = [];
    let aktuelleWoche: typeof tage = [];
    for (const t of tage) {
      if (t.weekday === 0 && aktuelleWoche.length > 0) {
        wochen.push(aktuelleWoche);
        aktuelleWoche = [];
      }
      aktuelleWoche.push(t);
    }
    if (aktuelleWoche.length > 0) wochen.push(aktuelleWoche);

    return { wochen, max, gesamtAktiv: aktiv, summe };
  }, [data, bisDatum]);

  function intensity(count: number): string {
    if (count === 0) return "bg-muted/50";
    if (max === 0) return "bg-muted/50";
    const ratio = count / max;
    if (ratio < 0.25) return "bg-[hsl(var(--brand-pink)/0.25)]";
    if (ratio < 0.5) return "bg-[hsl(var(--brand-pink)/0.5)]";
    if (ratio < 0.75) return "bg-[hsl(var(--brand-pink)/0.75)]";
    return "bg-[hsl(var(--brand-pink))]";
  }

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <p className="text-[12px] text-muted-foreground">
          {gesamtAktiv} aktive Tage · {summe} {beschriftung}
        </p>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span>Weniger</span>
          <span className="h-2.5 w-2.5 rounded-sm bg-muted/50" />
          <span className="h-2.5 w-2.5 rounded-sm bg-[hsl(var(--brand-pink)/0.25)]" />
          <span className="h-2.5 w-2.5 rounded-sm bg-[hsl(var(--brand-pink)/0.5)]" />
          <span className="h-2.5 w-2.5 rounded-sm bg-[hsl(var(--brand-pink)/0.75)]" />
          <span className="h-2.5 w-2.5 rounded-sm bg-[hsl(var(--brand-pink))]" />
          <span>Mehr</span>
        </div>
      </div>
      <div className="overflow-x-auto pb-1">
        <div className="flex gap-[3px]">
          {wochen.map((woche, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {Array.from({ length: 7 }).map((_, di) => {
                const tag = woche.find((t) => t.weekday === di);
                if (!tag) {
                  return (
                    <div
                      key={di}
                      className="h-[11px] w-[11px] rounded-sm bg-transparent"
                    />
                  );
                }
                return (
                  <div
                    key={di}
                    className={`h-[11px] w-[11px] rounded-sm ${intensity(tag.count)} transition-colors hover:ring-1 hover:ring-[hsl(var(--brand-pink))]`}
                    title={`${tag.date}: ${tag.count} ${beschriftung}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
