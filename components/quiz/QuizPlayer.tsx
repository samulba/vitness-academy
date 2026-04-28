"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Sparkles,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LetzterVersuch, Quiz } from "@/lib/quiz";
import { quizAuswerten, type QuizErgebnis } from "@/app/(app)/quiz/[id]/actions";

type Phase = "intro" | "spielen" | "ergebnis";

type Props = {
  quiz: Quiz;
  letzterVersuch: LetzterVersuch | null;
  zurueckPfad: string | null;
};

export function QuizPlayer({ quiz, letzterVersuch, zurueckPfad }: Props) {
  const [phase, setPhase] = useState<Phase>(letzterVersuch ? "intro" : "intro");
  const [antworten, setAntworten] = useState<Record<string, Set<string>>>({});
  const [pending, startTransition] = useTransition();
  const [ergebnis, setErgebnis] = useState<QuizErgebnis | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);

  function startNeu() {
    setAntworten({});
    setErgebnis(null);
    setFehler(null);
    setPhase("spielen");
  }

  function toggle(frageId: string, optionId: string, multiple: boolean) {
    setAntworten((prev) => {
      const aktuell = new Set(prev[frageId] ?? []);
      if (multiple) {
        if (aktuell.has(optionId)) aktuell.delete(optionId);
        else aktuell.add(optionId);
      } else {
        aktuell.clear();
        aktuell.add(optionId);
      }
      return { ...prev, [frageId]: aktuell };
    });
  }

  const allBeantwortet = quiz.questions.every(
    (q) => (antworten[q.id]?.size ?? 0) > 0,
  );

  function absenden() {
    setFehler(null);
    const payload: Record<string, string[]> = {};
    for (const [k, v] of Object.entries(antworten)) payload[k] = [...v];
    startTransition(async () => {
      const res = await quizAuswerten(quiz.id, payload);
      if (!res.ok) {
        setFehler(res.fehler);
        return;
      }
      setErgebnis(res.ergebnis);
      setPhase("ergebnis");
    });
  }

  return (
    <div className="space-y-6">
      {zurueckPfad ? (
        <Link
          href={zurueckPfad}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zur Lektion
        </Link>
      ) : null}

      <header className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="gap-1">
            <Sparkles className="h-3 w-3" />
            Quiz
          </Badge>
          <span>·</span>
          <span>Bestehen ab {quiz.passing_score}%</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">{quiz.title}</h1>
        {quiz.description ? (
          <p className="max-w-2xl text-muted-foreground">{quiz.description}</p>
        ) : null}
      </header>

      {phase === "intro" ? (
        <IntroPanel
          quiz={quiz}
          letzterVersuch={letzterVersuch}
          onStart={startNeu}
        />
      ) : null}

      {phase === "spielen" ? (
        <div className="space-y-4">
          {quiz.questions.map((frage, i) => (
            <Card key={frage.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    Frage {i + 1} von {quiz.questions.length}
                    {frage.question_type === "multiple"
                      ? " · Mehrfachauswahl"
                      : ""}
                  </div>
                </div>
                <CardTitle className="text-base font-medium leading-snug">
                  {frage.prompt}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {frage.options.map((opt) => {
                  const ausgewaehlt =
                    antworten[frage.id]?.has(opt.id) ?? false;
                  const multiple = frage.question_type === "multiple";
                  return (
                    <label
                      key={opt.id}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                        ausgewaehlt
                          ? "border-primary bg-primary/5"
                          : "hover:bg-accent/40",
                      )}
                    >
                      {multiple ? (
                        <Checkbox
                          checked={ausgewaehlt}
                          onCheckedChange={() =>
                            toggle(frage.id, opt.id, true)
                          }
                          className="mt-0.5"
                        />
                      ) : (
                        <input
                          type="radio"
                          name={frage.id}
                          checked={ausgewaehlt}
                          onChange={() => toggle(frage.id, opt.id, false)}
                          className="mt-1 h-4 w-4 accent-primary"
                        />
                      )}
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  );
                })}
              </CardContent>
            </Card>
          ))}

          {fehler ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {fehler}
            </p>
          ) : null}

          <Card>
            <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {allBeantwortet
                  ? "Alle Fragen beantwortet."
                  : "Bitte beantworte alle Fragen, bevor du absendest."}
              </p>
              <Button
                onClick={absenden}
                disabled={!allBeantwortet || pending}
                size="lg"
              >
                {pending ? "Werte aus …" : "Antworten absenden"}
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {phase === "ergebnis" && ergebnis ? (
        <ErgebnisPanel
          ergebnis={ergebnis}
          quiz={quiz}
          zurueckPfad={zurueckPfad}
          onErneut={startNeu}
        />
      ) : null}
    </div>
  );
}

function IntroPanel({
  quiz,
  letzterVersuch,
  onStart,
}: {
  quiz: Quiz;
  letzterVersuch: LetzterVersuch | null;
  onStart: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">So läuft das Quiz</CardTitle>
        <CardDescription>
          {quiz.questions.length} Fragen · Single & Multiple Choice · Bestehen
          ab {quiz.passing_score}%
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="list-disc pl-5 text-sm text-muted-foreground">
          <li>Du kannst das Quiz beliebig oft wiederholen.</li>
          <li>
            Wenn du bestehst, wird die zugehörige Lektion automatisch als
            abgeschlossen markiert.
          </li>
          <li>Bei Mehrfach-Auswahl müssen alle richtigen Optionen gewählt sein.</li>
        </ul>

        {letzterVersuch ? (
          <div className="rounded-lg border bg-muted/40 p-3 text-sm">
            <div className="mb-1 font-medium">Dein letzter Versuch</div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>{letzterVersuch.score}% erreicht</span>
              <span>·</span>
              {letzterVersuch.passed ? (
                <Badge variant="success" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Bestanden
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1">
                  <XCircle className="h-3 w-3" /> Nicht bestanden
                </Badge>
              )}
            </div>
          </div>
        ) : null}

        <Button onClick={onStart} size="lg">
          {letzterVersuch ? (
            <>
              <RotateCcw className="h-4 w-4" />
              Erneut versuchen
            </>
          ) : (
            <>
              <HelpCircle className="h-4 w-4" />
              Quiz starten
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

function ErgebnisPanel({
  ergebnis,
  quiz,
  zurueckPfad,
  onErneut,
}: {
  ergebnis: QuizErgebnis;
  quiz: Quiz;
  zurueckPfad: string | null;
  onErneut: () => void;
}) {
  return (
    <Card
      className={cn(
        "border-2",
        ergebnis.passed
          ? "border-success/40 bg-success/5"
          : "border-destructive/40 bg-destructive/5",
      )}
    >
      <CardHeader>
        <div className="flex items-center gap-3">
          {ergebnis.passed ? (
            <CheckCircle2 className="h-8 w-8 text-success" />
          ) : (
            <XCircle className="h-8 w-8 text-destructive" />
          )}
          <div>
            <CardTitle className="text-2xl">
              {ergebnis.passed ? "Bestanden!" : "Nicht bestanden"}
            </CardTitle>
            <CardDescription>
              {ergebnis.correct} von {ergebnis.total} Fragen richtig –{" "}
              {ergebnis.score}% (benötigt: {ergebnis.passing_score}%)
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={ergebnis.score} />

        <ul className="space-y-2">
          {quiz.questions.map((frage, i) => {
            const eintrag = ergebnis.per_question.find(
              (p) => p.question_id === frage.id,
            );
            const richtig = eintrag?.is_correct ?? false;
            return (
              <li
                key={frage.id}
                className="flex items-start gap-3 rounded-lg border bg-background p-3"
              >
                {richtig ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                ) : (
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                )}
                <div className="text-sm">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    Frage {i + 1}
                  </div>
                  <div className="font-medium">{frage.prompt}</div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-wrap gap-2 pt-2">
          {ergebnis.passed ? (
            <>
              {zurueckPfad ? (
                <Button asChild variant="success">
                  <Link href={zurueckPfad}>Weiter zur Lektion</Link>
                </Button>
              ) : null}
              <Button variant="outline" onClick={onErneut}>
                <RotateCcw className="h-4 w-4" />
                Nochmal versuchen
              </Button>
            </>
          ) : (
            <>
              <Button onClick={onErneut} variant="success">
                <RotateCcw className="h-4 w-4" />
                Erneut versuchen
              </Button>
              {zurueckPfad ? (
                <Button asChild variant="outline">
                  <Link href={zurueckPfad}>Zurück zur Lektion</Link>
                </Button>
              ) : null}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
