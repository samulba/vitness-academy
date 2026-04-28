import { createClient } from "@/lib/supabase/server";

export type QuizFrageTyp = "single" | "multiple";

export type QuizOption = {
  id: string;
  label: string;
  sort_order: number;
};

export type QuizFrage = {
  id: string;
  prompt: string;
  question_type: QuizFrageTyp;
  sort_order: number;
  options: QuizOption[];
};

export type Quiz = {
  id: string;
  title: string;
  description: string | null;
  passing_score: number;
  lesson_id: string | null;
  module_id: string | null;
  questions: QuizFrage[];
};

export type LetzterVersuch = {
  id: string;
  score: number;
  passed: boolean;
  completed_at: string | null;
};

export type QuizKurz = {
  id: string;
  title: string;
  passing_score: number;
};

/**
 * Quiz inkl. Fragen und Optionen, OHNE is_correct zu leaken.
 */
export async function ladeQuiz(id: string): Promise<Quiz | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quizzes")
    .select(
      `id, title, description, passing_score, lesson_id, module_id,
       quiz_questions (
         id, prompt, question_type, sort_order,
         quiz_options ( id, label, sort_order )
       )`,
    )
    .eq("id", id)
    .eq("status", "aktiv")
    .single();

  if (error || !data) return null;

  type RohFrage = {
    id: string;
    prompt: string;
    question_type: QuizFrageTyp;
    sort_order: number;
    quiz_options: { id: string; label: string; sort_order: number }[];
  };

  const fragen: QuizFrage[] = ((data.quiz_questions ?? []) as RohFrage[])
    .map((q) => ({
      id: q.id,
      prompt: q.prompt,
      question_type: q.question_type,
      sort_order: q.sort_order,
      options: (q.quiz_options ?? [])
        .map((o) => ({ id: o.id, label: o.label, sort_order: o.sort_order }))
        .sort((a, b) => a.sort_order - b.sort_order),
    }))
    .sort((a, b) => a.sort_order - b.sort_order);

  return {
    id: data.id as string,
    title: data.title as string,
    description: data.description as string | null,
    passing_score: data.passing_score as number,
    lesson_id: data.lesson_id as string | null,
    module_id: data.module_id as string | null,
    questions: fragen,
  };
}

/**
 * Aktives Quiz, das einer Lektion zugeordnet ist (oder null).
 */
export async function ladeQuizFuerLektion(
  lessonId: string,
): Promise<QuizKurz | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("quizzes")
    .select("id, title, passing_score")
    .eq("lesson_id", lessonId)
    .eq("status", "aktiv")
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();
  return (data as QuizKurz | null) ?? null;
}

/**
 * Letzter abgeschlossener Versuch eines Nutzers fuer ein Quiz.
 */
export async function ladeLetztenVersuch(
  quizId: string,
  userId: string,
): Promise<LetzterVersuch | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("quiz_attempts")
    .select("id, score, passed, completed_at")
    .eq("quiz_id", quizId)
    .eq("user_id", userId)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as LetzterVersuch | null) ?? null;
}
