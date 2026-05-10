import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  Sparkles,
  Target,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import {
  QuizBestehensquoteChart,
  QuizFragenChart,
} from "@/components/charts/QuizCharts";
import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  frageStats,
  letzteVersuche,
  quizStats,
} from "@/lib/quiz_stats";
import { formatDatum } from "@/lib/format";

async function ladeQuizMeta(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("quizzes")
    .select("id, title, passing_score")
    .eq("id", id)
    .maybeSingle();
  return data as { id: string; title: string; passing_score: number } | null;
}

export default async function QuizAuswertungPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("quizze", "view");
  const { id } = await params;
  const quiz = await ladeQuizMeta(id);
  if (!quiz) notFound();

  const [stats, fragen, versuche] = await Promise.all([
    quizStats(id),
    frageStats(id),
    letzteVersuche(id, 20),
  ]);

  const sortiert = [...fragen].sort((a, b) => a.korrektquote - b.korrektquote);
  const schwierigste = sortiert.slice(0, 3);

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Verwaltung", href: "/admin" },
          { label: "Quizze", href: "/admin/quizze" },
          { label: quiz.title, href: `/admin/quizze/${id}` },
          { label: "Auswertung" },
        ]}
        eyebrow="Quiz-Auswertung"
        title={quiz.title}
        description={`Bestehensgrenze ${quiz.passing_score} %. Versuche und Bestehensquote über alle Mitarbeiter.`}
      />

      <StatGrid cols={4}>
        <StatCard
          label="Versuche gesamt"
          value={stats.versuche}
          icon={<Sparkles />}
        />
        <StatCard
          label="Bestehensquote"
          value={`${stats.bestehensquote} %`}
          icon={<Target />}
        />
        <StatCard
          label="Durchschnitt"
          value={`${stats.durchschnitt} %`}
          icon={<CheckCircle2 />}
        />
        <StatCard
          label="Letzte Aktivität"
          value={
            stats.letzte_aktivitaet ? formatDatum(stats.letzte_aktivitaet) : "—"
          }
          icon={<Clock />}
        />
      </StatGrid>

      {/* Charts */}
      {stats.versuche > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-[14px] font-semibold tracking-tight">
                Bestehensquote
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {stats.bestandene} von {stats.versuche} Versuchen bestanden
              </p>
            </div>
            <div className="p-5">
              <QuizBestehensquoteChart
                bestanden={stats.bestandene}
                nichtBestanden={stats.versuche - stats.bestandene}
              />
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-[14px] font-semibold tracking-tight">
                Korrektquote pro Frage
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Schwierigste zuerst — wo Antworten am häufigsten falsch sind.
              </p>
            </div>
            <div className="p-3">
              <QuizFragenChart fragen={fragen} />
            </div>
          </div>
        </div>
      )}

      {/* Schwierigste Fragen */}
      {schwierigste.length > 0 && schwierigste.some((f) => f.versuche > 0) && (
        <section>
          <h2 className="text-lg font-semibold tracking-tight">
            Schwierigste Fragen
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Wo stolpern die meisten — Verbesserungspotential für Erklärung
            oder Antwortoptionen.
          </p>
          <ul className="mt-4 space-y-3">
            {schwierigste
              .filter((f) => f.versuche > 0)
              .map((f) => (
                <li
                  key={f.question_id}
                  className="rounded-2xl border border-border bg-card p-5"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <p className="font-medium leading-snug">{f.prompt}</p>
                    <span
                      className={
                        f.korrektquote < 50
                          ? "rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-bold text-destructive"
                          : "rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700"
                      }
                    >
                      {f.korrektquote} % korrekt
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-[hsl(var(--brand-pink))]"
                      style={{ width: `${f.korrektquote}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {f.korrekt} von {f.versuche} Antworten richtig
                  </p>
                </li>
              ))}
          </ul>
        </section>
      )}

      {/* Alle Fragen */}
      {fragen.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold tracking-tight">
            Alle Fragen im Detail
          </h2>
          <ul className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
            {fragen.map((f, i) => (
              <li
                key={f.question_id}
                className={
                  i > 0
                    ? "border-t border-border px-5 py-4"
                    : "px-5 py-4"
                }
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <p className="text-sm leading-snug">{f.prompt}</p>
                  <span className="text-xs text-muted-foreground">
                    {f.versuche === 0
                      ? "noch keine Antworten"
                      : `${f.korrektquote} % korrekt (${f.korrekt}/${f.versuche})`}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Letzte Versuche */}
      <section>
        <h2 className="text-lg font-semibold tracking-tight">
          Letzte Versuche
        </h2>
        {versuche.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
            Noch keine abgeschlossenen Versuche.
          </div>
        ) : (
          <ul className="mt-3 overflow-hidden rounded-2xl border border-border bg-card">
            {versuche.map((v, i) => (
              <li
                key={v.attempt_id}
                className={
                  i > 0
                    ? "flex items-center gap-3 border-t border-border px-5 py-3"
                    : "flex items-center gap-3 px-5 py-3"
                }
              >
                <span
                  className={
                    v.passed
                      ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]"
                      : "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive"
                  }
                >
                  {v.passed ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/benutzer/${v.user_id}`}
                    className="font-medium hover:underline"
                  >
                    {v.user_name ?? "Mitarbeiter"}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {v.completed_at
                      ? formatDatum(v.completed_at)
                      : formatDatum(v.started_at)}
                  </p>
                </div>
                <span className="text-sm font-semibold">{v.score} %</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

