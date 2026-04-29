import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { ladeSubmissions, STATUS_LABEL } from "@/lib/formulare";
import { formatDatum } from "@/lib/format";

export default async function EingaengePage() {
  await requireRole(["fuehrungskraft", "admin", "superadmin"]);
  const offen = await ladeSubmissions({
    status: ["eingereicht", "in_bearbeitung"],
  });
  const erledigt = await ladeSubmissions({
    status: ["erledigt", "abgelehnt"],
  });

  return (
    <div className="space-y-10">
      <Link
        href="/admin/formulare"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zu allen Formularen
      </Link>

      <header>
        <h1 className="text-3xl font-semibold tracking-tight">
          Eingänge
        </h1>
        <p className="mt-1 text-muted-foreground">
          Eingereichte Formulare. Klick öffnet die Details mit Antwort-Optionen.
        </p>
      </header>

      <Section
        titel="Aktuell offen"
        anzahl={offen.length}
        liste={offen}
        leer="Keine offenen Einreichungen."
      />
      {erledigt.length > 0 && (
        <Section
          titel="Erledigt (letzte 30)"
          anzahl={erledigt.length}
          liste={erledigt.slice(0, 30)}
          leer=""
        />
      )}
    </div>
  );
}

type Eintrag = Awaited<ReturnType<typeof ladeSubmissions>>[number];

function Section({
  titel,
  anzahl,
  liste,
  leer,
}: {
  titel: string;
  anzahl: number;
  liste: Eintrag[];
  leer: string;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold tracking-tight">{titel}</h2>
        <span className="text-xs tabular-nums text-muted-foreground">
          {anzahl}
        </span>
      </div>
      {liste.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          {leer}
        </div>
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-border bg-card">
          {liste.map((s, i) => (
            <li key={s.id} className={i > 0 ? "border-t border-border" : ""}>
              <Link
                href={`/admin/formulare/eingaenge/${s.id}`}
                className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[hsl(var(--primary)/0.04)]"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <p className="truncate font-semibold leading-tight">
                      {s.template_title ?? "Formular"}
                    </p>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {STATUS_LABEL[s.status]}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {s.submitted_by_name ?? "—"} ·{" "}
                    {formatDatum(s.submitted_at)}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-[hsl(var(--primary))]" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
