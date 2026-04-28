import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { ladeLetztenVersuch, ladeQuiz } from "@/lib/quiz";
import { QuizPlayer } from "@/components/quiz/QuizPlayer";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireProfile();

  const quiz = await ladeQuiz(id);
  if (!quiz) notFound();

  const letzter = await ladeLetztenVersuch(id, profile.id);

  const zurueckPfad = quiz.lesson_id ? `/lektionen/${quiz.lesson_id}` : null;

  return (
    <QuizPlayer
      quiz={quiz}
      letzterVersuch={letzter}
      zurueckPfad={zurueckPfad}
    />
  );
}
