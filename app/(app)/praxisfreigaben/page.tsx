import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PraxisStatusBadge } from "@/components/praxis/PraxisStatusBadge";
import { BereitMeldenForm } from "@/components/praxis/BereitMeldenForm";
import { requireProfile } from "@/lib/auth";
import { ladeMeinePraxisaufgaben } from "@/lib/praxis";
import { formatDatum } from "@/lib/format";
import {
  praxisBereitMelden,
  praxisZurueckziehen,
} from "./actions";

export default async function PraxisfreigabenPage() {
  const profile = await requireProfile();
  const aufgaben = await ladeMeinePraxisaufgaben(profile.id);

  const offen = aufgaben.filter((a) => a.status === "offen");
  const bereit = aufgaben.filter((a) => a.status === "bereit");
  const freigegeben = aufgaben.filter((a) => a.status === "freigegeben");
  const abgelehnt = aufgaben.filter((a) => a.status === "abgelehnt");

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">
          Meine Praxisfreigaben
        </h1>
        <p className="mt-1 text-muted-foreground">
          Diese Aufgaben musst du in der Praxis zeigen. Wenn du dich bereit
          fühlst, melde dich für die Freigabe.
        </p>
      </header>

      {aufgaben.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Aktuell sind keine Praxisaufgaben für dich aktiv.
          </CardContent>
        </Card>
      ) : (
        <>
          <Sektion
            titel="Offen"
            beschreibung="Sobald du dich sicher fühlst, melde die Aufgabe für die Freigabe."
            eintraege={offen}
            renderAktion={(eintrag) => (
              <BereitMeldenForm
                action={praxisBereitMelden.bind(null, eintrag.id)}
                modus="melden"
              />
            )}
          />

          <Sektion
            titel="Wartet auf Freigabe"
            beschreibung="Eine Führungskraft schaut sich das in Kürze an."
            eintraege={bereit}
            renderAktion={(eintrag) => (
              <BereitMeldenForm
                action={praxisZurueckziehen.bind(null, eintrag.id)}
                modus="zurueckziehen"
              />
            )}
          />

          <Sektion
            titel="Freigegeben"
            beschreibung="Diese Aufgaben hast du erfolgreich gezeigt."
            eintraege={freigegeben}
          />

          <Sektion
            titel="Abgelehnt"
            beschreibung="Schau dir die Notiz der Führungskraft an und melde dich erneut, wenn du bereit bist."
            eintraege={abgelehnt}
            renderAktion={(eintrag) => (
              <BereitMeldenForm
                action={praxisBereitMelden.bind(null, eintrag.id)}
                modus="melden"
              />
            )}
          />
        </>
      )}
    </div>
  );
}

type Eintrag = Awaited<ReturnType<typeof ladeMeinePraxisaufgaben>>[number];

function Sektion({
  titel,
  beschreibung,
  eintraege,
  renderAktion,
}: {
  titel: string;
  beschreibung: string;
  eintraege: Eintrag[];
  renderAktion?: (eintrag: Eintrag) => React.ReactNode;
}) {
  if (eintraege.length === 0) return null;

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-xl font-semibold">
          {titel}{" "}
          <span className="text-base font-normal text-muted-foreground">
            ({eintraege.length})
          </span>
        </h2>
        <p className="text-sm text-muted-foreground">{beschreibung}</p>
      </div>

      <div className="space-y-3">
        {eintraege.map((e) => (
          <Card key={e.id}>
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{e.title}</CardTitle>
                  <div className="text-xs text-muted-foreground">
                    {[e.learning_path_title, e.lesson_title]
                      .filter(Boolean)
                      .join(" · ") || ""}
                  </div>
                </div>
                <PraxisStatusBadge status={e.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {e.description ? (
                <p className="text-sm text-muted-foreground">{e.description}</p>
              ) : null}

              {e.user_note ? (
                <div className="rounded-md border bg-muted/40 p-3 text-sm">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    Deine Notiz
                  </div>
                  <p className="whitespace-pre-wrap">{e.user_note}</p>
                </div>
              ) : null}

              {e.reviewer_note ? (
                <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    Notiz von {e.approved_by_name ?? "Führungskraft"}
                    {e.approved_at
                      ? ` · ${formatDatum(e.approved_at)}`
                      : ""}
                  </div>
                  <p className="whitespace-pre-wrap">{e.reviewer_note}</p>
                </div>
              ) : null}

              {renderAktion ? (
                <div className="pt-1">{renderAktion(e)}</div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
