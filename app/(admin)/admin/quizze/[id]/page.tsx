import { notFound } from "next/navigation";
import { BarChart3 } from "lucide-react";
import { VorschauButton } from "@/components/admin/VorschauButton";
import { PageHeader } from "@/components/ui/page-header";
import { LoeschenButton } from "@/components/admin/LoeschenButton";
import { QuizFormular } from "@/components/admin/QuizFormular";
import { createClient } from "@/lib/supabase/server";
import { ladeLektionOptionen, ladeModulOptionen } from "@/lib/admin/optionen";
import { quizAktualisieren, quizLoeschen } from "../actions";
import { FragenListe, type Frage } from "./FragenListe";

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
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((q) => ({
      id: q.id,
      prompt: q.prompt,
      question_type: q.question_type,
      options: (q.quiz_options ?? [])
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((o) => ({
          id: o.id,
          label: o.label,
          is_correct: o.is_correct,
        })),
    }));

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
      <PageHeader
        breadcrumbs={[
          { label: "Verwaltung", href: "/admin" },
          { label: "Quizze", href: "/admin/quizze" },
          { label: quiz.title },
        ]}
        eyebrow="Quiz"
        title={quiz.title}
        description="Stammdaten, Fragen und Antwort-Optionen pflegen."
        secondaryActions={[
          {
            icon: <BarChart3 />,
            label: "Auswertung",
            href: `/admin/quizze/${quiz.id}/auswertung`,
          },
        ]}
        extras={<VorschauButton url={`/quiz/${quiz.id}`} />}
      />

      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <header className="mb-5">
          <h2 className="text-base font-semibold tracking-tight">Stammdaten</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Titel, Beschreibung, Pass-Score und Bindung an Lektion oder Modul.
          </p>
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
      </section>

      <FragenListe quizId={quiz.id} fragen={quiz.fragen} />

      <section className="rounded-2xl border border-destructive/25 bg-destructive/[0.03] p-6 sm:p-8">
        <header className="mb-4">
          <h2 className="text-base font-semibold tracking-tight text-destructive">
            Quiz löschen
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Inklusive aller Fragen, Antworten und bestehender Versuche.
          </p>
        </header>
        <LoeschenButton
          action={quizLoeschen.bind(null, quiz.id)}
          label="Quiz endgültig löschen"
          bestaetigung="Quiz inkl. aller Fragen, Antworten und Versuche wirklich löschen?"
        />
      </section>
    </div>
  );
}
