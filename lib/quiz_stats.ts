import { createClient } from "@/lib/supabase/server";

export type QuizStats = {
  versuche: number;
  bestandene: number;
  bestehensquote: number; // 0..100
  durchschnitt: number; // 0..100
  letzte_aktivitaet: string | null;
};

export type FrageStat = {
  question_id: string;
  prompt: string;
  versuche: number;
  korrekt: number;
  korrektquote: number; // 0..100
};

export type LetzterVersuch = {
  attempt_id: string;
  user_id: string;
  user_name: string | null;
  score: number;
  passed: boolean;
  completed_at: string | null;
  started_at: string;
};

export async function quizStats(quizId: string): Promise<QuizStats> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("quiz_attempts")
    .select("score, passed, completed_at")
    .eq("quiz_id", quizId)
    .not("completed_at", "is", null);

  type Roh = { score: number; passed: boolean; completed_at: string | null };
  const rows = (data ?? []) as Roh[];
  const versuche = rows.length;
  const bestandene = rows.filter((r) => r.passed).length;
  const summe = rows.reduce((acc, r) => acc + (r.score ?? 0), 0);
  const letzte = rows
    .map((r) => r.completed_at)
    .filter((x): x is string => Boolean(x))
    .sort()
    .pop() ?? null;
  return {
    versuche,
    bestandene,
    bestehensquote: versuche > 0 ? Math.round((bestandene / versuche) * 100) : 0,
    durchschnitt: versuche > 0 ? Math.round(summe / versuche) : 0,
    letzte_aktivitaet: letzte,
  };
}

export async function frageStats(quizId: string): Promise<FrageStat[]> {
  const supabase = await createClient();
  // Alle Fragen des Quiz
  const { data: fragen } = await supabase
    .from("quiz_questions")
    .select("id, prompt, sort_order")
    .eq("quiz_id", quizId)
    .order("sort_order");

  const fragenList = (fragen ?? []) as { id: string; prompt: string; sort_order: number }[];
  if (fragenList.length === 0) return [];

  const fragenIds = fragenList.map((f) => f.id);
  const { data: antwortenRaw } = await supabase
    .from("quiz_attempt_answers")
    .select("question_id, is_correct")
    .in("question_id", fragenIds);

  type Antw = { question_id: string; is_correct: boolean };
  const antworten = (antwortenRaw ?? []) as Antw[];
  const counts = new Map<string, { versuche: number; korrekt: number }>();
  for (const a of antworten) {
    const c = counts.get(a.question_id) ?? { versuche: 0, korrekt: 0 };
    c.versuche += 1;
    if (a.is_correct) c.korrekt += 1;
    counts.set(a.question_id, c);
  }

  return fragenList.map((f) => {
    const c = counts.get(f.id) ?? { versuche: 0, korrekt: 0 };
    return {
      question_id: f.id,
      prompt: f.prompt,
      versuche: c.versuche,
      korrekt: c.korrekt,
      korrektquote: c.versuche > 0 ? Math.round((c.korrekt / c.versuche) * 100) : 0,
    };
  });
}

export async function letzteVersuche(
  quizId: string,
  limit = 20,
): Promise<LetzterVersuch[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("quiz_attempts")
    .select(
      `id, user_id, score, passed, started_at, completed_at,
       user:user_id ( full_name )`,
    )
    .eq("quiz_id", quizId)
    .order("completed_at", { ascending: false, nullsFirst: false })
    .limit(limit);

  type Roh = {
    id: string;
    user_id: string;
    score: number;
    passed: boolean;
    started_at: string;
    completed_at: string | null;
    user: { full_name: string | null } | null;
  };
  return ((data ?? []) as unknown as Roh[]).map((r) => ({
    attempt_id: r.id,
    user_id: r.user_id,
    user_name: r.user?.full_name ?? null,
    score: r.score,
    passed: r.passed,
    started_at: r.started_at,
    completed_at: r.completed_at,
  }));
}

export async function mitarbeiterQuizVerlauf(
  userId: string,
  limit = 10,
): Promise<
  {
    attempt_id: string;
    quiz_id: string;
    quiz_title: string | null;
    score: number;
    passed: boolean;
    completed_at: string | null;
  }[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("quiz_attempts")
    .select(
      `id, quiz_id, score, passed, completed_at,
       quiz:quiz_id ( title )`,
    )
    .eq("user_id", userId)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false })
    .limit(limit);

  type Roh = {
    id: string;
    quiz_id: string;
    score: number;
    passed: boolean;
    completed_at: string | null;
    quiz: { title: string | null } | null;
  };
  return ((data ?? []) as unknown as Roh[]).map((r) => ({
    attempt_id: r.id,
    quiz_id: r.quiz_id,
    quiz_title: r.quiz?.title ?? null,
    score: r.score,
    passed: r.passed,
    completed_at: r.completed_at,
  }));
}
