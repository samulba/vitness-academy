import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Lock, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContentBlockView } from "@/components/lektion/ContentBlock";
import {
  AbschliessenSubmit,
  ZurueckSetzenSubmit,
} from "@/components/lektion/AbschliessenButton";
import { QuizCard } from "@/components/lektion/QuizCard";
import { StatusBadge } from "@/components/StatusBadge";
import { requireProfile } from "@/lib/auth";
import {
  ladeBestandeneQuizIds,
  ladeLektionFuerUser,
  lektionAlsGesehenMarkieren,
} from "@/lib/lektion";
import { ladeLetztenVersuch, ladeQuizFuerLektion } from "@/lib/quiz";
import {
  lektionAbschliessen,
  lektionZurueckSetzen,
} from "./actions";

export default async function LektionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireProfile();
  const lektion = await ladeLektionFuerUser(profile.id, id);
  if (!lektion) notFound();

  // Lernzeit-Tracking: started_at + last_seen_at pflegen.
  await lektionAlsGesehenMarkieren(profile.id, id);

  const bereitsFertig = lektion.status === "abgeschlossen";

  const quiz = await ladeQuizFuerLektion(lektion.id);
  const letzterVersuch = quiz
    ? await ladeLetztenVersuch(quiz.id, profile.id)
    : null;

  // Bloecke trennen: Lehrtext oben, Wissens-Check (inline_quiz) unten.
  const lehrBloecke = lektion.blocks.filter(
    (b) => b.block_type !== "inline_quiz",
  );
  const quizBloecke = lektion.blocks.filter(
    (b) => b.block_type === "inline_quiz",
  );
  const bestandene = await ladeBestandeneQuizIds(profile.id, lektion.id);
  const offeneQuizze = quizBloecke.filter((b) => !bestandene.has(b.id));
  const alleQuizzesBestanden = quizBloecke.length === 0 || offeneQuizze.length === 0;
  const abschliessbar = alleQuizzesBestanden;

  const abschliessen = lektionAbschliessen.bind(null, lektion.id);
  const zuruecksetzen = lektionZurueckSetzen.bind(null, lektion.id);

  return (
    <div className="space-y-6">
      <Link
        href={`/lernpfade/${lektion.path_id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zum Lernpfad
      </Link>

      {lektion.hero_image_path && (
        <div className="overflow-hidden rounded-2xl border border-border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/lesson-images/${lektion.hero_image_path}`}
            alt=""
            className="aspect-[16/9] w-full object-cover"
          />
        </div>
      )}

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {lektion.path_title ? (
            <Badge variant="outline">{lektion.path_title}</Badge>
          ) : null}
          <span>·</span>
          <span>{lektion.module_title}</span>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              {lektion.title}
            </h1>
            {lektion.summary ? (
              <p className="max-w-2xl text-muted-foreground">
                {lektion.summary}
              </p>
            ) : null}
          </div>
          <StatusBadge status={lektion.status} />
        </div>
      </header>

      {/* === Lehrtext-Bloecke (alles ausser inline_quiz) === */}
      <Card>
        <CardContent className="space-y-6 py-6">
          {lehrBloecke.length === 0 && quizBloecke.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Diese Lektion enthält noch keine Inhalte.
            </p>
          ) : lehrBloecke.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Diese Lektion besteht ausschließlich aus dem Wissens-Check unten.
            </p>
          ) : (
            lehrBloecke.map((block) => (
              <ContentBlockView
                key={block.id}
                block={block}
                lessonId={lektion.id}
                bestandeneQuizIds={bestandene}
              />
            ))
          )}
        </CardContent>
      </Card>

      {/* === Wissens-Check (inline_quiz) — räumlich getrennt === */}
      {quizBloecke.length > 0 && (
        <section className="space-y-5 border-t-2 border-dashed border-border pt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[hsl(var(--brand-pink))]">
                <Sparkles className="h-3 w-3" />
                Wissens-Check
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                Bevor du abschließt
              </h2>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Hak die Fragen ab, dann kannst du diese Lektion fertigmachen.
                Bei falschen Antworten gibt&apos;s eine Erklärung — kein Druck,
                versuch&apos;s nochmal.
              </p>
            </div>
            <span
              className={
                alleQuizzesBestanden
                  ? "inline-flex items-center gap-2 rounded-full bg-[hsl(var(--success)/0.15)] px-3 py-1 text-xs font-bold text-[hsl(var(--success))]"
                  : "inline-flex items-center gap-2 rounded-full bg-[hsl(var(--brand-pink)/0.12)] px-3 py-1 text-xs font-bold text-[hsl(var(--brand-pink))]"
              }
            >
              {bestandene.size} / {quizBloecke.length} bestanden
            </span>
          </div>
          <div className="space-y-4">
            {quizBloecke.map((block) => (
              <ContentBlockView
                key={block.id}
                block={block}
                lessonId={lektion.id}
                bestandeneQuizIds={bestandene}
              />
            ))}
          </div>
        </section>
      )}

      {quiz ? <QuizCard quiz={quiz} letzterVersuch={letzterVersuch} /> : null}

      {/* === Abschluss-Card mit Gating === */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {bereitsFertig
              ? "Lektion abgeschlossen"
              : abschliessbar
              ? "Bist du fertig?"
              : "Wissens-Check fehlt noch"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {bereitsFertig
              ? "Du hast diese Lektion bereits abgeschlossen."
              : abschliessbar
              ? "Markiere die Lektion als abgeschlossen, sobald du den Inhalt verinnerlicht hast."
              : `Beantworte zuerst die ${offeneQuizze.length} ${
                  offeneQuizze.length === 1
                    ? "offene Frage"
                    : "offenen Fragen"
                } im Wissens-Check oben — danach kannst du abschließen.`}
          </p>
          <div className="flex gap-2">
            {bereitsFertig ? (
              <>
                <span className="inline-flex items-center gap-1 text-sm text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  Abgeschlossen
                </span>
                <form action={zuruecksetzen}>
                  <ZurueckSetzenSubmit />
                </form>
              </>
            ) : abschliessbar ? (
              <form action={abschliessen}>
                <AbschliessenSubmit />
              </form>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-4 py-2 text-sm font-medium text-muted-foreground">
                <Lock className="h-3.5 w-3.5" />
                Erst Wissens-Check abschließen
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <nav className="flex items-center justify-between gap-3 pt-2">
        {lektion.vorherige ? (
          <Link
            href={`/lektionen/${lektion.vorherige.id}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Vorherige:</span>
            <span className="line-clamp-1">{lektion.vorherige.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {lektion.naechste ? (
          <Link
            href={`/lektionen/${lektion.naechste.id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <span className="hidden sm:inline">Nächste:</span>
            <span className="line-clamp-1">{lektion.naechste.title}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
      </nav>
    </div>
  );
}
