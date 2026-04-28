import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
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
import { ladeLektionFuerUser } from "@/lib/lektion";
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

  const bereitsFertig = lektion.status === "abgeschlossen";

  const quiz = await ladeQuizFuerLektion(lektion.id);
  const letzterVersuch = quiz
    ? await ladeLetztenVersuch(quiz.id, profile.id)
    : null;

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

      <Card>
        <CardContent className="space-y-6 py-6">
          {lektion.blocks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Diese Lektion enthält noch keine Inhalte.
            </p>
          ) : (
            lektion.blocks.map((block) => (
              <ContentBlockView key={block.id} block={block} />
            ))
          )}
        </CardContent>
      </Card>

      {quiz ? <QuizCard quiz={quiz} letzterVersuch={letzterVersuch} /> : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bist du fertig?</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {bereitsFertig
              ? "Du hast diese Lektion bereits abgeschlossen."
              : "Markiere die Lektion als abgeschlossen, sobald du den Inhalt verinnerlicht hast."}
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
            ) : (
              <form action={abschliessen}>
                <AbschliessenSubmit />
              </form>
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
