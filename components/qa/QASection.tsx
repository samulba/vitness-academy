import { MessageCircle, ShieldCheck } from "lucide-react";
import { ladeFragen, antwortZeitDelta, type QaFrage } from "@/lib/qa";
import { rolleLabel } from "@/lib/format";
import { istFuehrungskraftOderHoeher, type Rolle } from "@/lib/rollen";
import { QaFrageStellen } from "./QaFrageStellen";
import { QaAntwortGeben } from "./QaAntwortGeben";
import { QaFrageMenu } from "./QaFrageMenu";
import { QaAntwortMenu } from "./QaAntwortMenu";

export async function QASection({
  lessonId,
  currentUserId,
  currentRole,
}: {
  lessonId: string;
  currentUserId: string;
  currentRole: Rolle;
}) {
  const fragen = await ladeFragen(lessonId);
  const istFuehrung = istFuehrungskraftOderHoeher(currentRole);
  const offene = fragen.filter((f) => !f.resolved).length;

  return (
    <section className="space-y-5 border-t-2 border-dashed border-border pt-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[hsl(var(--brand-pink))]">
            <MessageCircle className="h-3 w-3" />
            Fragen & Antworten
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Was ist unklar?
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Wenn du etwas nicht verstehst — frag. Andere Mitarbeiter und die
            Studioleitung antworten dir hier.
          </p>
        </div>
        {fragen.length > 0 && (
          <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
            {offene === 0
              ? `${fragen.length} ${
                  fragen.length === 1 ? "Frage" : "Fragen"
                } · alle beantwortet`
              : `${offene} offen${offene === 1 ? "e Frage" : "e Fragen"}`}
          </span>
        )}
      </div>

      <QaFrageStellen lessonId={lessonId} />

      {fragen.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Stell die erste Frage zu dieser Lektion.
        </div>
      ) : (
        <ul className="space-y-4">
          {fragen.map((f) => (
            <FrageItem
              key={f.id}
              frage={f}
              lessonId={lessonId}
              currentUserId={currentUserId}
              istFuehrung={istFuehrung}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function FrageItem({
  frage,
  lessonId,
  currentUserId,
  istFuehrung,
}: {
  frage: QaFrage;
  lessonId: string;
  currentUserId: string;
  istFuehrung: boolean;
}) {
  const eigene = frage.asked_by === currentUserId;
  const darfBearbeiten = eigene || istFuehrung;

  return (
    <li className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="px-5 pt-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-sm font-semibold">
              {frage.asked_by_name ?? "Mitarbeiter"}
            </span>
            <span className="text-xs text-muted-foreground">
              · {antwortZeitDelta(frage.created_at)}
            </span>
            {frage.resolved && (
              <span className="rounded-full bg-[hsl(var(--success)/0.15)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--success))]">
                Geloest
              </span>
            )}
          </div>
          {darfBearbeiten && (
            <QaFrageMenu
              lessonId={lessonId}
              questionId={frage.id}
              resolved={frage.resolved}
              istFuehrung={istFuehrung}
            />
          )}
        </div>
        <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed">
          {frage.body}
        </p>
      </div>

      {frage.antworten.length > 0 && (
        <ul className="mt-4 space-y-3 border-t border-border bg-muted/30 px-5 py-4">
          {frage.antworten.map((a) => {
            const eigeneAntwort = a.answered_by === currentUserId;
            const darfAntwortLoeschen = eigeneAntwort || istFuehrung;
            return (
              <li
                key={a.id}
                className={`rounded-lg ${
                  a.is_official
                    ? "border border-[hsl(var(--brand-pink)/0.3)] bg-[hsl(var(--brand-pink)/0.04)] p-4"
                    : "p-4"
                }`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-sm font-semibold">
                      {a.answered_by_name ?? "Mitarbeiter"}
                    </span>
                    {a.is_official && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--brand-pink)/0.12)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--brand-pink))]">
                        <ShieldCheck className="h-3 w-3" />
                        {rolleLabel(a.answered_by_role)}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      · {antwortZeitDelta(a.created_at)}
                    </span>
                  </div>
                  {darfAntwortLoeschen && (
                    <QaAntwortMenu
                      lessonId={lessonId}
                      answerId={a.id}
                    />
                  )}
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                  {a.body}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      <div className="border-t border-border bg-muted/20 px-5 py-4">
        <QaAntwortGeben lessonId={lessonId} questionId={frage.id} />
      </div>
    </li>
  );
}
