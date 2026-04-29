import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  ExternalLink,
  Plus,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReihenfolgeButtons } from "@/components/admin/ReihenfolgeButtons";
import { LoeschenButton } from "@/components/admin/LoeschenButton";
import { QuizFormular } from "@/components/admin/QuizFormular";
import { FrageBearbeitenInline } from "@/components/admin/FrageBearbeitenInline";
import { OptionBearbeitenInline } from "@/components/admin/OptionBearbeitenInline";
import { createClient } from "@/lib/supabase/server";
import { ladeLektionOptionen, ladeModulOptionen } from "@/lib/admin/optionen";
import {
  frageAktualisieren,
  frageAnlegen,
  frageLoeschen,
  frageReihenfolge,
  optionAktualisieren,
  optionAnlegen,
  optionLoeschen,
  optionReihenfolge,
  quizAktualisieren,
  quizLoeschen,
} from "../actions";

type Option = {
  id: string;
  label: string;
  is_correct: boolean;
  sort_order: number;
};
type Frage = {
  id: string;
  prompt: string;
  question_type: "single" | "multiple";
  sort_order: number;
  options: Option[];
};
type QuizDetail = {
  id: string;
  title: string;
  description: string | null;
  passing_score: number;
  status: string;
  lesson_id: string | null;
  module_id: string | null;
  fragen: Frage[];
};

async function ladeQuiz(id: string): Promise<QuizDetail | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("quizzes")
    .select(
      `id, title, description, passing_score, status, lesson_id, module_id,
       quiz_questions (
         id, prompt, question_type, sort_order,
         quiz_options ( id, label, is_correct, sort_order )
       )`,
    )
    .eq("id", id)
    .maybeSingle();

  if (!data) return null;

  type RohFrage = {
    id: string;
    prompt: string;
    question_type: "single" | "multiple";
    sort_order: number;
    quiz_options:
      | { id: string; label: string; is_correct: boolean; sort_order: number }[]
      | null;
  };

  const fragen: Frage[] = ((data.quiz_questions ?? []) as unknown as RohFrage[])
    .map((q) => ({
      id: q.id,
      prompt: q.prompt,
      question_type: q.question_type,
      sort_order: q.sort_order,
      options: (q.quiz_options ?? [])
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order),
    }))
    .sort((a, b) => a.sort_order - b.sort_order);

  return {
    id: data.id as string,
    title: data.title as string,
    description: data.description as string | null,
    passing_score: data.passing_score as number,
    status: data.status as string,
    lesson_id: data.lesson_id as string | null,
    module_id: data.module_id as string | null,
    fragen,
  };
}

export default async function QuizBearbeitenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [quiz, lektionen, module] = await Promise.all([
    ladeQuiz(id),
    ladeLektionOptionen(),
    ladeModulOptionen(),
  ]);
  if (!quiz) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/admin/quizze"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zu Quizzen
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{quiz.title}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={`/admin/quizze/${quiz.id}/auswertung`}>
              <BarChart3 className="h-4 w-4" />
              Auswertung
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/quiz/${quiz.id}`}>
              <ExternalLink className="h-4 w-4" />
              Vorschau
            </Link>
          </Button>
        </div>
      </header>

      <QuizFormular
        modus="bearbeiten"
        action={quizAktualisieren.bind(null, quiz.id)}
        lektionen={lektionen}
        module={module}
        werte={{
          title: quiz.title,
          description: quiz.description,
          passing_score: quiz.passing_score,
          status: quiz.status,
          lesson_id: quiz.lesson_id,
          module_id: quiz.module_id,
        }}
      />

      <Card>
        <CardContent className="flex justify-end py-4">
          <LoeschenButton
            action={quizLoeschen.bind(null, quiz.id)}
            label="Quiz löschen"
            bestaetigung="Quiz inkl. aller Fragen, Antworten und Versuche wirklich löschen?"
          />
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Fragen ({quiz.fragen.length})</h2>

        {quiz.fragen.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center text-sm text-muted-foreground">
              Noch keine Fragen – leg unten die erste an.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {quiz.fragen.map((frage, i) => (
              <Card key={frage.id}>
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <ReihenfolgeButtons
                        hoch={frageReihenfolge.bind(
                          null,
                          quiz.id,
                          frage.id,
                          "hoch",
                        )}
                        runter={frageReihenfolge.bind(
                          null,
                          quiz.id,
                          frage.id,
                          "runter",
                        )}
                        hochDeaktiviert={i === 0}
                        runterDeaktiviert={i === quiz.fragen.length - 1}
                      />
                      <div>
                        <div className="text-xs uppercase tracking-wider text-muted-foreground">
                          Frage {i + 1}
                          {frage.question_type === "multiple"
                            ? " · Multiple Choice"
                            : " · Single Choice"}
                        </div>
                        <CardTitle className="text-base font-medium leading-snug">
                          {frage.prompt}
                        </CardTitle>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <FrageBearbeitenInline
                        action={frageAktualisieren.bind(
                          null,
                          quiz.id,
                          frage.id,
                        )}
                        prompt={frage.prompt}
                        question_type={frage.question_type}
                      />
                      <LoeschenButton
                        action={frageLoeschen.bind(null, quiz.id, frage.id)}
                        label="Frage löschen"
                        bestaetigung="Frage inkl. Antworten wirklich löschen?"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {frage.options.length === 0 ? (
                    <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                      Noch keine Antwortoptionen.
                    </p>
                  ) : (
                    <ul className="space-y-1">
                      {frage.options.map((opt, j) => (
                        <li
                          key={opt.id}
                          className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/30 px-3 py-2"
                        >
                          <ReihenfolgeButtons
                            hoch={optionReihenfolge.bind(
                              null,
                              quiz.id,
                              frage.id,
                              opt.id,
                              "hoch",
                            )}
                            runter={optionReihenfolge.bind(
                              null,
                              quiz.id,
                              frage.id,
                              opt.id,
                              "runter",
                            )}
                            hochDeaktiviert={j === 0}
                            runterDeaktiviert={j === frage.options.length - 1}
                          />
                          {opt.is_correct ? (
                            <Badge variant="success" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Richtig
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1">
                              <XCircle className="h-3 w-3" />
                              Falsch
                            </Badge>
                          )}
                          <span className="flex-1 text-sm">{opt.label}</span>
                          <OptionBearbeitenInline
                            action={optionAktualisieren.bind(
                              null,
                              quiz.id,
                              opt.id,
                            )}
                            label={opt.label}
                            is_correct={opt.is_correct}
                          />
                          <LoeschenButton
                            action={optionLoeschen.bind(null, quiz.id, opt.id)}
                            label="Löschen"
                            bestaetigung="Antwort wirklich löschen?"
                          />
                        </li>
                      ))}
                    </ul>
                  )}

                  <form
                    action={optionAnlegen.bind(null, quiz.id, frage.id)}
                    className="flex flex-wrap items-center gap-2 pt-2"
                  >
                    <Input
                      name="label"
                      placeholder="Antworttext eingeben …"
                      required
                      className="flex-1 min-w-[200px]"
                    />
                    <label className="flex items-center gap-1 text-xs">
                      <input
                        type="checkbox"
                        name="is_correct"
                        className="h-4 w-4 accent-success"
                      />
                      Richtig
                    </label>
                    <Button type="submit" size="sm">
                      <Plus className="h-3.5 w-3.5" />
                      Antwort hinzufügen
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Neue Frage</CardTitle>
            <CardDescription>
              Antworten ergänzt du nach dem Anlegen direkt unter der Frage.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              action={frageAnlegen.bind(null, quiz.id)}
              className="space-y-3"
            >
              <div className="space-y-1">
                <Label htmlFor="prompt">Frage</Label>
                <Input
                  id="prompt"
                  name="prompt"
                  required
                  placeholder="z.B. Was ist bei der Begrüßung besonders wichtig?"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="question_type">Typ</Label>
                <select
                  id="question_type"
                  name="question_type"
                  defaultValue="single"
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="single">Single Choice (eine Antwort)</option>
                  <option value="multiple">
                    Multiple Choice (mehrere Antworten)
                  </option>
                </select>
              </div>
              <div className="flex justify-end">
                <Button type="submit" size="sm">
                  <Plus className="h-4 w-4" />
                  Frage hinzufügen
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
