import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
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
  const wochentag = new Date(datum + "T00:00:00").toLocaleDateString("de-DE", {
    weekday: "long",
  });

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

  const erledigt = !!heutigesProtokoll;

  return (
    <div className="space-y-5">
      {/* Status-Hero (immer sichtbar, kommuniziert klar den Zustand) */}
      <header
        className={
          erledigt
            ? "relative overflow-hidden rounded-2xl border border-[hsl(var(--success)/0.4)] bg-[hsl(var(--success)/0.06)] p-5 sm:p-7"
            : "relative overflow-hidden rounded-2xl border border-[hsl(var(--brand-pink)/0.4)] bg-[hsl(var(--brand-pink)/0.06)] p-5 sm:p-7"
        }
      >
        {/* Akzent-Streifen links */}
        <span
          aria-hidden
          className={
            erledigt
              ? "absolute inset-y-0 left-0 w-1.5 bg-[hsl(var(--success))]"
              : "absolute inset-y-0 left-0 w-1.5 bg-[hsl(var(--primary))]"
          }
        />

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <span
              className={
                erledigt
                  ? "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--success))] text-white shadow-md"
                  : "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-md"
              }
            >
              {erledigt ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : (
                <Sparkles className="h-6 w-6" />
              )}
            </span>
            <div>
              <p
                className={
                  erledigt
                    ? "text-[10px] font-bold uppercase tracking-[0.18em] text-[hsl(var(--success))]"
                    : "text-[10px] font-bold uppercase tracking-[0.18em] text-[hsl(var(--primary))]"
                }
              >
                {erledigt ? "Heute erledigt" : "Heute noch nicht erledigt"}
              </p>
              <h1 className="mt-1 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                Putzprotokoll
              </h1>
              <p className="mt-1.5 inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground sm:text-sm">
                <CalendarDays className="h-3.5 w-3.5" />
                <span className="font-medium text-foreground">
                  {wochentag}, {datumDeutsch}
                </span>
                <span>·</span>
                <span>{aktiv.name}</span>
                {erledigt && heutigesProtokoll && (
                  <>
                    <span>·</span>
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {new Date(heutigesProtokoll.submitted_at).toLocaleTimeString(
                        "de-DE",
                        { hour: "2-digit", minute: "2-digit" },
                      )}{" "}
                      Uhr
                    </span>
                    <span>·</span>
                    <span>
                      {heutigesProtokoll.submitted_by_name ?? "Mitarbeiter:in"}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {!erledigt && (
          <p className="mt-4 max-w-2xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {tplBundle.sections.length} Bereiche · pro Bereich Aufgaben
            abhaken, Mängel notieren und beliebig viele Fotos hochladen.
            Die Studioleitung sieht das Protokoll danach in der Inbox.
          </p>
        )}
      </header>

      {/* Inhalt */}
      {erledigt && heutigesProtokoll ? (
        <>
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
        </>
      ) : (
        <Composer
          sections={tplBundle.sections}
          locationId={aktiv.id}
          locationName={aktiv.name}
          datum={datum}
          datumDeutsch={datumDeutsch}
          supabasePublicUrl={process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}
        />
      )}
    </div>
  );
}
