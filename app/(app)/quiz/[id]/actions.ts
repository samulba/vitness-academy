"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type QuizErgebnis = {
  attempt_id: string;
  score: number;
  passed: boolean;
  passing_score: number;
  total: number;
  correct: number;
  per_question: { question_id: string; is_correct: boolean }[];
};

/**
 * Wertet einen Quiz-Versuch aus, speichert Versuch + Antworten und schliesst
 * ggf. die zugehoerige Lektion ab (wenn bestanden und Lesson-Quiz).
 *
 * antworten: { [question_id]: option_id[] }
 */
export async function quizAuswerten(
  quizId: string,
  antworten: Record<string, string[]>,
): Promise<{ ok: true; ergebnis: QuizErgebnis } | { ok: false; fehler: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, fehler: "Nicht angemeldet." };

  // Quiz inkl. richtigen Optionen laden (RLS-Lesezugriff ist erlaubt)
  const { data: quizData, error } = await supabase
    .from("quizzes")
    .select(
      `id, passing_score, lesson_id,
       quiz_questions (
         id,
         quiz_options ( id, is_correct )
       )`,
    )
    .eq("id", quizId)
    .single();

  if (error || !quizData) {
    return { ok: false, fehler: "Quiz nicht gefunden." };
  }

  type RohFrage = {
    id: string;
    quiz_options: { id: string; is_correct: boolean }[];
  };

  const fragen = (quizData.quiz_questions ?? []) as RohFrage[];
  const total = fragen.length;
  let richtig = 0;

  const answersToInsert: {
    question_id: string;
    selected_option_ids: string[];
    is_correct: boolean;
  }[] = [];
  const perQuestion: { question_id: string; is_correct: boolean }[] = [];

  for (const frage of fragen) {
    const ausgewaehlt = new Set(antworten[frage.id] ?? []);
    const korrekt = new Set(
      (frage.quiz_options ?? [])
        .filter((o) => o.is_correct)
        .map((o) => o.id),
    );
    const istKorrekt =
      ausgewaehlt.size === korrekt.size &&
      [...ausgewaehlt].every((id) => korrekt.has(id));
    if (istKorrekt) richtig++;

    answersToInsert.push({
      question_id: frage.id,
      selected_option_ids: [...ausgewaehlt],
      is_correct: istKorrekt,
    });
    perQuestion.push({ question_id: frage.id, is_correct: istKorrekt });
  }

  const score = total > 0 ? Math.round((richtig / total) * 100) : 0;
  const passingScore = (quizData.passing_score as number) ?? 80;
  const passed = score >= passingScore;

  // Versuch anlegen
  const { data: attempt, error: attErr } = await supabase
    .from("quiz_attempts")
    .insert({
      quiz_id: quizId,
      user_id: user.id,
      score,
      passed,
      completed_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (attErr || !attempt) {
    return { ok: false, fehler: "Versuch konnte nicht gespeichert werden." };
  }

  // Antworten anhaengen
  if (answersToInsert.length > 0) {
    await supabase.from("quiz_attempt_answers").insert(
      answersToInsert.map((a) => ({
        attempt_id: attempt.id as string,
        question_id: a.question_id,
        selected_option_ids: a.selected_option_ids,
        is_correct: a.is_correct,
      })),
    );
  }

  // Wenn bestanden und Lektion verbunden: Lektion als abgeschlossen markieren
  const lessonId = quizData.lesson_id as string | null;
  if (passed && lessonId) {
    await supabase.from("user_lesson_progress").upsert(
      {
        user_id: user.id,
        lesson_id: lessonId,
        status: "abgeschlossen",
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_id" },
    );
  }

  revalidatePath(`/quiz/${quizId}`);
  revalidatePath("/dashboard");
  if (lessonId) revalidatePath(`/lektionen/${lessonId}`);

  return {
    ok: true,
    ergebnis: {
      attempt_id: attempt.id as string,
      score,
      passed,
      passing_score: passingScore,
      total,
      correct: richtig,
      per_question: perQuestion,
    },
  };
}
