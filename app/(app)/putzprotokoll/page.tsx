import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getAktiverStandort } from "@/lib/standort-context";
import {
  heuteISO,
  ladeProtokollFuerDatum,
  ladeTemplateMitSections,
} from "@/lib/putzprotokoll";
import { formatDatum } from "@/lib/format";
import { Composer } from "./Composer";
import { ProtokollDetail } from "./ProtokollDetail";

export const dynamic = "force-dynamic";

export default async function PutzprotokollPage() {
  await requireProfile();
  const aktiv = await getAktiverStandort();

  if (!aktiv) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Kein aktiver Standort gewählt — bitte oben rechts einen wählen.
      </div>
    );
  }

  const datum = heuteISO();
  const datumDeutsch = formatDatum(datum);
  const [tplBundle, heutigesProtokoll] = await Promise.all([
    ladeTemplateMitSections(aktiv.id),
    ladeProtokollFuerDatum(aktiv.id, datum),
  ]);

  if (!tplBundle || tplBundle.sections.length === 0) {
    return (
      <div className="space-y-3 rounded-2xl border border-dashed border-border bg-card p-8 text-center">
        <Sparkles className="mx-auto h-8 w-8 text-[hsl(var(--brand-pink))]" />
        <p className="text-sm font-semibold">
          Noch kein Putzprotokoll-Template für {aktiv.name}
        </p>
        <p className="text-xs text-muted-foreground">
          Studioleitung muss erst die Bereiche + Aufgaben anlegen.
        </p>
      </div>
    );
  }

  // Schon eingereicht heute → Detail-Anzeige
  if (heutigesProtokoll) {
    return (
      <div className="space-y-5">
        <header className="rounded-2xl border border-[hsl(var(--success)/0.4)] bg-[hsl(var(--success)/0.06)] p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--success))] text-white">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--success))]">
                Heute erledigt
              </p>
              <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
                Putzprotokoll · {datumDeutsch}
              </h1>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                <span className="font-medium text-foreground">
                  {heutigesProtokoll.submitted_by_name ?? "Mitarbeiter:in"}
                </span>{" "}
                · <Clock className="-mt-0.5 inline h-3 w-3" />{" "}
                {new Date(heutigesProtokoll.submitted_at).toLocaleTimeString(
                  "de-DE",
                  { hour: "2-digit", minute: "2-digit" },
                )}{" "}
                Uhr · {aktiv.name}
              </p>
            </div>
          </div>
        </header>

        <ProtokollDetail protokoll={heutigesProtokoll} />

        <div className="flex justify-start">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück zum Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Composer
      sections={tplBundle.sections}
      locationName={aktiv.name}
      datumDeutsch={datumDeutsch}
    />
  );
}
