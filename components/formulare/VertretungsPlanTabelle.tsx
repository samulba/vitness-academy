import { CalendarRange } from "lucide-react";
import { formatDatum } from "@/lib/format";
import { wochentagKurz } from "@/lib/datum";
import type { VertretungsTag } from "@/lib/formulare-types";

/**
 * Render eines VertretungsPlan-Arrays in der Admin-Submission-Detail.
 * - Pauschal-Mode: Array mit einem Eintrag {tag:"", person:"…"} →
 *   einzelne Pille mit "Pauschal".
 * - Tagesweise: Array mit n Eintraegen → Tabelle (Desktop) oder
 *   Card-Stack (Mobile).
 */
export function VertretungsPlanTabelle({
  eintraege,
}: {
  eintraege: VertretungsTag[];
}) {
  if (!eintraege || eintraege.length === 0) {
    return (
      <p className="text-sm italic text-muted-foreground">
        Keine Vertretung eingetragen.
      </p>
    );
  }

  // Pauschal-Eintrag: ein Item mit leerem tag.
  if (eintraege.length === 1 && eintraege[0].tag === "") {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-[hsl(var(--brand-pink)/0.3)] bg-[hsl(var(--brand-pink)/0.06)] p-3">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--brand-pink)/0.15)] text-[hsl(var(--brand-pink))]">
          <CalendarRange className="h-3.5 w-3.5" />
        </span>
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--brand-pink))]">
            Pauschal
          </p>
          <p className="mt-0.5 text-sm font-medium">{eintraege[0].person}</p>
        </div>
      </div>
    );
  }

  const abgedeckt = eintraege.filter((e) => e.person.trim().length > 0).length;
  const total = eintraege.length;

  return (
    <div className="space-y-2">
      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {eintraege.map((e) => (
          <li
            key={e.tag}
            className="flex flex-col gap-1 px-3 py-2.5 sm:flex-row sm:items-center sm:gap-4"
          >
            <div className="flex items-center gap-2 sm:w-32 sm:shrink-0">
              <span className="rounded-full bg-[hsl(var(--brand-pink)/0.12)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--brand-pink))]">
                {wochentagKurz(e.tag)}
              </span>
              <span className="text-sm font-medium tabular-nums">
                {formatDatum(e.tag)}
              </span>
            </div>
            <div className="flex-1">
              {e.person.trim().length > 0 ? (
                <span className="text-sm font-medium">{e.person}</span>
              ) : (
                <span className="text-sm italic text-muted-foreground">
                  — offen —
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-muted-foreground">
        <span
          className={
            abgedeckt === total
              ? "font-semibold text-[hsl(var(--success))]"
              : "font-semibold text-[hsl(var(--brand-pink))]"
          }
        >
          {abgedeckt} / {total}
        </span>{" "}
        {total === 1 ? "Tag" : "Tage"} mit Vertretung abgedeckt
      </p>
    </div>
  );
}
