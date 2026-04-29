import { createClient } from "@/lib/supabase/server";

export type QaAntwort = {
  id: string;
  question_id: string;
  body: string;
  is_official: boolean;
  answered_by: string;
  answered_by_name: string | null;
  answered_by_role: string | null;
  created_at: string;
};

export type QaFrage = {
  id: string;
  lesson_id: string;
  body: string;
  resolved: boolean;
  asked_by: string;
  asked_by_name: string | null;
  created_at: string;
  antworten: QaAntwort[];
};

type FrageRoh = {
  id: string;
  lesson_id: string;
  body: string;
  resolved: boolean;
  asked_by: string;
  created_at: string;
  asker: { full_name: string | null } | null;
};

type AntwortRoh = {
  id: string;
  question_id: string;
  body: string;
  is_official: boolean;
  answered_by: string;
  created_at: string;
  answerer: { full_name: string | null; role: string | null } | null;
};

export async function ladeFragen(lessonId: string): Promise<QaFrage[]> {
  const supabase = await createClient();

  const { data: fragenData } = await supabase
    .from("lesson_questions")
    .select(
      `id, lesson_id, body, resolved, asked_by, created_at,
       asker:asked_by ( full_name )`,
    )
    .eq("lesson_id", lessonId)
    .order("created_at", { ascending: false });

  const fragen = (fragenData ?? []) as unknown as FrageRoh[];
  if (fragen.length === 0) return [];

  const ids = fragen.map((f) => f.id);
  const { data: antwortenData } = await supabase
    .from("lesson_answers")
    .select(
      `id, question_id, body, is_official, answered_by, created_at,
       answerer:answered_by ( full_name, role )`,
    )
    .in("question_id", ids)
    .order("created_at", { ascending: true });

  const antworten = (antwortenData ?? []) as unknown as AntwortRoh[];
  const byQuestion = new Map<string, QaAntwort[]>();
  for (const a of antworten) {
    const arr = byQuestion.get(a.question_id) ?? [];
    arr.push({
      id: a.id,
      question_id: a.question_id,
      body: a.body,
      is_official: a.is_official,
      answered_by: a.answered_by,
      answered_by_name: a.answerer?.full_name ?? null,
      answered_by_role: a.answerer?.role ?? null,
      created_at: a.created_at,
    });
    byQuestion.set(a.question_id, arr);
  }

  return fragen.map((f) => ({
    id: f.id,
    lesson_id: f.lesson_id,
    body: f.body,
    resolved: f.resolved,
    asked_by: f.asked_by,
    asked_by_name: f.asker?.full_name ?? null,
    created_at: f.created_at,
    antworten: byQuestion.get(f.id) ?? [],
  }));
}

export function antwortZeitDelta(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60_000);
  if (min < 1) return "gerade eben";
  if (min < 60) return `vor ${min} Min`;
  const std = Math.floor(min / 60);
  if (std < 24) return `vor ${std} Std`;
  const tage = Math.floor(std / 24);
  if (tage < 7) return `vor ${tage} Tagen`;
  return new Date(iso).toLocaleDateString("de-DE");
}
