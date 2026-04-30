import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
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
    <div className="space-y-6">
      <PageHeader
        eyebrow="Lernen"
        title="Meine Praxisfreigaben"
        description="Diese Aufgaben musst du in der Praxis zeigen. Wenn du dich bereit fühlst, melde dich für die Freigabe."
      />

      {aufgaben.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            title="Keine Praxisaufgaben aktiv"
            description="Sobald dir Praxisaufgaben zugewiesen werden, tauchen sie hier auf."
          />
        </div>
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
    <section className="space-y-2">
      <header>
        <h2 className="text-[14px] font-semibold tracking-tight">
          {titel}
          <span className="ml-1.5 font-normal text-muted-foreground">
            ({eintraege.length})
          </span>
        </h2>
        <p className="text-[12px] text-muted-foreground">{beschreibung}</p>
      </header>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="divide-y divide-border">
          {eintraege.map((e) => (
            <div key={e.id} className="px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[14px] font-medium leading-tight">
                    {e.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {[e.learning_path_title, e.lesson_title]
                      .filter(Boolean)
                      .join(" · ") || ""}
                  </p>
                </div>
                <PraxisStatusBadge status={e.status} />
              </div>

              <div className="mt-3 space-y-3">
                {e.description && (
                  <p className="text-sm text-muted-foreground">
                    {e.description}
                  </p>
                )}
                {e.user_note && (
                  <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Deine Notiz
                    </p>
                    <p className="mt-1 whitespace-pre-wrap">{e.user_note}</p>
                  </div>
                )}
                {e.reviewer_note && (
                  <div className="rounded-md border border-[hsl(var(--brand-pink)/0.3)] bg-[hsl(var(--brand-pink)/0.04)] p-3 text-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Notiz von {e.approved_by_name ?? "Führungskraft"}
                      {e.approved_at ? ` · ${formatDatum(e.approved_at)}` : ""}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap">{e.reviewer_note}</p>
                  </div>
                )}
                {renderAktion && <div className="pt-1">{renderAktion(e)}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
