import {
  Award,
  HelpCircle,
  Plus,
  Sparkles,
  Target,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import {
  EmptyState,
  EmptyStateTablePreview,
} from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/server";
import { alsArray, istNextJsControlFlow, joinTitel } from "@/lib/admin/safe-loader";
import { QuizzeTable, type Zeile } from "./QuizzeTable";

async function ladeQuizze(): Promise<Zeile[]> {
  try {
    const supabase = await createClient();

    const { data: quizze, error } = await supabase
      .from("quizzes")
      .select(
        `id, title, status, passing_score, lesson_id, module_id, updated_at, sort_order,
         quiz_questions (id),
         quiz_attempts (id, passed),
         lessons:lesson_id ( title ),
         modules:module_id ( title )`,
      )
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("[ladeQuizze] supabase error:", error);
      return [];
    }

    type Roh = {
      id?: string;
      title?: string;
      status?: string;
      passing_score?: number;
      lesson_id?: string | null;
      module_id?: string | null;
      updated_at?: string;
      quiz_questions?: unknown;
      quiz_attempts?: unknown;
      lessons?: unknown;
      modules?: unknown;
    };

    return ((quizze ?? []) as unknown as Roh[])
      .filter((q) => typeof q.id === "string" && typeof q.title === "string")
      .map((q) => {
        const versuche = alsArray<{ id: string; passed?: boolean }>(
          q.quiz_attempts,
        );
        const bestanden = versuche.filter((v) => v?.passed === true).length;
        const bindung_typ = q.lesson_id
          ? "Lektion"
          : q.module_id
            ? "Modul"
            : null;
        const bindung_titel = q.lesson_id
          ? joinTitel(q.lessons) ?? "—"
          : q.module_id
            ? joinTitel(q.modules) ?? "—"
            : null;
        return {
          id: q.id as string,
          title: q.title as string,
          status: typeof q.status === "string" ? q.status : "aktiv",
          passing_score:
            typeof q.passing_score === "number" ? q.passing_score : 80,
          fragen_anzahl: alsArray(q.quiz_questions).length,
          versuche_anzahl: versuche.length,
          bestanden_anzahl: bestanden,
          bindung_typ,
          bindung_titel,
          updated_at:
            typeof q.updated_at === "string"
              ? q.updated_at
              : new Date().toISOString(),
        };
      });
  } catch (e) {
    if (istNextJsControlFlow(e)) throw e;
    console.error("[ladeQuizze] unexpected error:", e);
    return [];
  }
}

export default async function AdminQuizzePage() {
  const quizze = await ladeQuizze();
  const aktiv = quizze.filter((q) => q.status === "aktiv").length;
  const fragenSumme = quizze.reduce((s, q) => s + q.fragen_anzahl, 0);
  const versucheSumme = quizze.reduce((s, q) => s + q.versuche_anzahl, 0);
  const bestandenSumme = quizze.reduce((s, q) => s + q.bestanden_anzahl, 0);
  const passQuote =
    versucheSumme === 0
      ? null
      : Math.round((bestandenSumme / versucheSumme) * 100);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inhalte"
        title="Quizze"
        description="Quizze inkl. Fragen und Antworten verwalten. Sortiert nach Reihenfolge."
        primaryAction={{
          label: "Neues Quiz",
          icon: <Plus />,
          href: "/admin/quizze/neu",
        }}
      />

      <StatGrid cols={4}>
        <StatCard
          label="Quizze gesamt"
          value={quizze.length}
          icon={<HelpCircle />}
        />
        <StatCard label="Fragen gesamt" value={fragenSumme} icon={<Sparkles />} />
        <StatCard label="Versuche" value={versucheSumme} icon={<Target />} />
        <StatCard
          label="Bestehensquote"
          value={passQuote === null ? "—" : `${passQuote}%`}
          icon={<Award />}
          trend={
            passQuote !== null
              ? {
                  value: Math.abs(passQuote - 80),
                  direction: passQuote >= 80 ? "up" : "down",
                  hint: "Ziel: 80%",
                }
              : undefined
          }
        />
      </StatGrid>

      {quizze.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            illustration={<EmptyStateTablePreview />}
            title="Noch keine Quizze"
            description="Lege ein Quiz an und verknüpfe es mit einer Lektion oder einem Modul."
            actions={[
              {
                icon: <Plus />,
                title: "Quiz anlegen",
                description: "Single oder Multiple Choice",
                href: "/admin/quizze/neu",
              },
              {
                icon: <Sparkles />,
                title: "Inline-Quiz",
                description: "Direkt in Lektionen einbetten",
                href: "/admin/lernpfade",
              },
            ]}
          />
        </div>
      ) : (
        <QuizzeTable quizze={quizze} />
      )}

      <p className="text-[11px] text-muted-foreground">
        {aktiv} von {quizze.length} Quiz{quizze.length === 1 ? "" : "ze"} aktiv.
      </p>
    </div>
  );
}
