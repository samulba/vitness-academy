import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import {
  heuteISO,
  ladeProtokollFuerDatum,
  ladeTemplateMitSections,
} from "@/lib/putzprotokoll";

/**
 * Virtuelle "Heute noch offen"-Aufgabe für das Putzprotokoll.
 * Rendert NUR dann eine Card, wenn:
 *   - der Standort ein aktives Template hat
 *   - heute noch kein Protokoll eingereicht wurde
 * Sonst null (= verschwindet automatisch wenn die Fruehschicht
 * eingereicht hat).
 *
 * Wird auf Dashboard und /aufgaben oben über die normalen Tasks
 * gerendert.
 */
export async function PutzprotokollHeuteCard({
  locationId,
  locationName,
}: {
  locationId: string;
  locationName?: string | null;
}) {
  const tpl = await ladeTemplateMitSections(locationId);
  if (!tpl || tpl.sections.length === 0) return null;

  const heute = heuteISO();
  const protokoll = await ladeProtokollFuerDatum(locationId, heute);
  if (protokoll) return null;

  return (
    <Link
      href="/putzprotokoll"
      className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-[hsl(var(--brand-pink)/0.4)] bg-[hsl(var(--brand-pink)/0.06)] p-4 transition-all hover:-translate-y-0.5 hover:border-[hsl(var(--primary))] hover:shadow-[0_16px_40px_-20px_hsl(var(--primary)/0.4)] sm:p-5"
    >
      {/* Magenta-Akzent-Streifen links */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1 bg-[hsl(var(--primary))]"
      />

      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] sm:h-12 sm:w-12">
        <Sparkles className="h-5 w-5" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[hsl(var(--primary))]">
          Heute noch offen
        </p>
        <h3 className="mt-0.5 text-base font-semibold leading-tight tracking-tight">
          Putzprotokoll ausfüllen
        </h3>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {locationName ?? "Studio"} · Frühschicht-Aufgabe
        </p>
      </div>

      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-[hsl(var(--primary))]" />
    </Link>
  );
}
