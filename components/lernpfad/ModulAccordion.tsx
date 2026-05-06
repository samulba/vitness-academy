import Link from "next/link";
import { ArrowRight, Check, Circle, Loader2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { ModulMitFortschritt } from "@/lib/lernpfade";
import { cn } from "@/lib/utils";

type LektionStatus =
  | "nicht_gestartet"
  | "in_bearbeitung"
  | "abgeschlossen"
  | null
  | undefined;

export function ModulAccordion({
  module: moduleListe,
}: {
  module: ModulMitFortschritt[];
}) {
  if (moduleListe.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Dieser Lernpfad enthält noch keine Module.
      </p>
    );
  }

  return (
    <Accordion
      type="multiple"
      defaultValue={moduleListe.map((m) => m.id)}
      className="space-y-3"
    >
      {moduleListe.map((modul) => {
        const prozent =
          modul.gesamt === 0
            ? 0
            : Math.round((modul.abgeschlossen / modul.gesamt) * 100);
        const fertig = modul.gesamt > 0 && modul.abgeschlossen === modul.gesamt;
        return (
          <AccordionItem
            key={modul.id}
            value={modul.id}
            className="overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-[hsl(var(--brand-pink)/0.3)]"
          >
            <AccordionTrigger className="px-4 py-4 hover:no-underline">
              <div className="flex w-full items-center gap-4">
                <ProgressRing prozent={prozent} fertig={fertig} />
                <div className="min-w-0 flex-1 text-left">
                  <p className="break-words text-[15px] font-semibold leading-tight">
                    {modul.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {modul.abgeschlossen} / {modul.gesamt} Lektionen
                    {fertig && (
                      <span className="ml-1.5 inline-flex items-center gap-0.5 font-medium text-[hsl(var(--brand-pink))]">
                        · fertig
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="border-t border-border/60 bg-muted/20">
              {modul.lessons.length === 0 ? (
                <p className="px-4 py-4 text-sm text-muted-foreground">
                  Noch keine Lektionen in diesem Modul.
                </p>
              ) : (
                <ul className="divide-y divide-border/50">
                  {modul.lessons.map((lektion, idx) => (
                    <LektionZeile
                      key={lektion.id}
                      lektion={lektion}
                      nummer={idx + 1}
                    />
                  ))}
                </ul>
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

function LektionZeile({
  lektion,
  nummer,
}: {
  lektion: ModulMitFortschritt["lessons"][number];
  nummer: number;
}) {
  const status = lektion.status as LektionStatus;
  return (
    <li>
      <Link
        href={`/lektionen/${lektion.id}`}
        className="group flex items-center gap-3 px-4 py-3 transition-colors active:bg-[hsl(var(--primary)/0.04)] [@media(hover:hover)]:hover:bg-[hsl(var(--primary)/0.04)]"
      >
        <StatusIndicator status={status} nummer={nummer} />
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "break-words text-[14px] font-medium leading-snug",
              status === "abgeschlossen" && "text-muted-foreground",
            )}
          >
            {lektion.title}
          </p>
          {lektion.summary && (
            <p className="mt-0.5 line-clamp-2 text-[12px] text-muted-foreground">
              {lektion.summary}
            </p>
          )}
        </div>
        <ArrowRight
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform [@media(hover:hover)]:group-hover:translate-x-0.5 [@media(hover:hover)]:group-hover:text-[hsl(var(--brand-pink))]",
          )}
        />
      </Link>
    </li>
  );
}

/**
 * Kleiner kreisförmiger Status-Indicator links der Lektion.
 * - nicht_gestartet: nur Border, leer
 * - in_bearbeitung: Magenta-Pulse-Border
 * - abgeschlossen: Magenta-gefüllt mit Check
 */
function StatusIndicator({
  status,
  nummer,
}: {
  status: LektionStatus;
  nummer: number;
}) {
  if (status === "abgeschlossen") {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </span>
    );
  }
  if (status === "in_bearbeitung") {
    return (
      <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[hsl(var(--brand-pink))] text-[10px] font-semibold text-[hsl(var(--brand-pink))]">
        <Loader2 className="absolute h-3.5 w-3.5 animate-spin opacity-40" />
        <span className="relative">{nummer}</span>
      </span>
    );
  }
  // nicht gestartet
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-background text-[11px] font-medium text-muted-foreground">
      {nummer}
    </span>
  );
}

/**
 * 40x40 SVG-Donut der den Modul-Fortschritt zeigt. Magenta-Akzent
 * mit subtilem Track. Bei 100% gefuellt + Check-Symbol.
 */
function ProgressRing({
  prozent,
  fertig,
}: {
  prozent: number;
  fertig: boolean;
}) {
  const size = 44;
  const strokeWidth = 3.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (prozent / 100) * circumference;

  if (fertig) {
    return (
      <span
        className="flex shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
        style={{ width: size, height: size }}
      >
        <Check className="h-5 w-5" strokeWidth={3} />
      </span>
    );
  }

  return (
    <span
      className="relative shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--brand-pink))"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold tabular-nums">
        {prozent === 0 ? (
          <Circle
            className="h-3 w-3 text-muted-foreground/40"
            strokeWidth={2.5}
          />
        ) : (
          `${prozent}`
        )}
      </span>
    </span>
  );
}
