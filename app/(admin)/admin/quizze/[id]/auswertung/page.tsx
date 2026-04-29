import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Sparkles,
  Target,
  XCircle,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
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
  await requireRole(["fuehrungskraft", "admin", "superadmin"]);
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
    <div className="space-y-12">
      <Link
        href={`/admin/quizze/${id}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zum Quiz
      </Link>

      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))]">
          Verwaltung · Quiz-Auswertung
        </p>
        <h1 className="mt-3 text-balance font-semibold leading-[1.1] tracking-[-0.025em] text-[clamp(1.875rem,3vw,2.75rem)]">
          {quiz.title}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Bestehensgrenze {quiz.passing_score} %.
        </p>
      </header>

      {/* KPI-Kacheln */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiKachel
          icon={<Sparkles className="h-4 w-4" />}
          label="Versuche gesamt"
          wert={stats.versuche.toString()}
        />
        <KpiKachel
          icon={<Target className="h-4 w-4" />}
          label="Bestehensquote"
          wert={`${stats.bestehensquote} %`}
          akzent
        />
        <KpiKachel
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Durchschnitt"
          wert={`${stats.durchschnitt} %`}
        />
        <KpiKachel
          icon={<Clock className="h-4 w-4" />}
          label="Letzte Aktivität"
          wert={
            stats.letzte_aktivitaet
              ? formatDatum(stats.letzte_aktivitaet)
              : "—"
          }
        />
      </section>

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

function KpiKachel({
  icon,
  label,
  wert,
  akzent,
}: {
  icon: React.ReactNode;
  label: string;
  wert: string;
  akzent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border bg-card p-5 ${
        akzent
          ? "border-[hsl(var(--brand-pink)/0.4)]"
          : "border-border"
      }`}
    >
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
          akzent
            ? "bg-[hsl(var(--brand-pink)/0.12)] text-[hsl(var(--brand-pink))]"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {icon}
      </span>
      <p className="mt-3 text-2xl font-semibold tracking-tight">{wert}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
