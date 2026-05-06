import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { StatusBadge } from "@/components/StatusBadge";
import type { ModulMitFortschritt } from "@/lib/lernpfade";
import { formatProzent } from "@/lib/format";

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
      className="rounded-xl border bg-card"
    >
      {moduleListe.map((modul) => {
        const prozent =
          modul.gesamt === 0 ? 0 : (modul.abgeschlossen / modul.gesamt) * 100;
        return (
          <AccordionItem
            key={modul.id}
            value={modul.id}
            className="px-4 first:rounded-t-xl last:rounded-b-xl"
          >
            <AccordionTrigger>
              <div className="flex w-full flex-col items-start gap-1">
                <div className="flex w-full flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                  <span className="break-words text-left font-medium">
                    {modul.title}
                  </span>
                  <span className="shrink-0 text-xs font-normal text-muted-foreground">
                    {modul.abgeschlossen}/{modul.gesamt} Lektionen ·{" "}
                    {formatProzent(prozent)}
                  </span>
                </div>
                {modul.description ? (
                  <span className="break-words text-left text-xs font-normal text-muted-foreground">
                    {modul.description}
                  </span>
                ) : null}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {modul.lessons.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Noch keine Lektionen in diesem Modul.
                </p>
              ) : (
                <ul className="divide-y rounded-lg border bg-background">
                  {modul.lessons.map((lektion) => (
                    <li
                      key={lektion.id}
                      className="flex flex-col items-stretch gap-2 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
                    >
                      <div className="flex min-w-0 items-start gap-3 sm:items-center">
                        <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground sm:mt-0" />
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/lektionen/${lektion.id}`}
                            className="block break-words font-medium hover:text-primary sm:truncate"
                          >
                            {lektion.title}
                          </Link>
                          {lektion.summary ? (
                            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground sm:line-clamp-1">
                              {lektion.summary}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center justify-between gap-3 pl-7 sm:justify-end sm:pl-0">
                        <StatusBadge status={lektion.status} />
                        <Link
                          href={`/lektionen/${lektion.id}`}
                          className="text-muted-foreground hover:text-primary"
                          aria-label="Lektion öffnen"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </li>
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
