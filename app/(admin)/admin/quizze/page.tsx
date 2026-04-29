import Link from "next/link";
import {
  Award,
  ExternalLink,
  HelpCircle,
  Plus,
  Sparkles,
  Target,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminCard } from "@/components/admin/AdminCard";
import { StatusPill } from "@/components/admin/StatusPill";
import { StatsStrip } from "@/components/admin/StatsStrip";
import { EmptyState } from "@/components/admin/EmptyState";
import {
  AdminActionCell,
  AdminTable,
  AdminTableHead,
  AdminTd,
  AdminTh,
  AdminTitleCell,
  AdminTr,
} from "@/components/admin/AdminTable";
import { createClient } from "@/lib/supabase/server";
import { formatDatum } from "@/lib/format";

type Zeile = {
  id: string;
  title: string;
  status: string;
  passing_score: number;
  fragen_anzahl: number;
  versuche_anzahl: number;
  bestanden_anzahl: number;
  bindung: { typ: "Lektion" | "Modul"; titel: string } | null;
  updated_at: string;
};

async function ladeQuizze(): Promise<Zeile[]> {
  const supabase = await createClient();

  const { data: quizze } = await supabase
    .from("quizzes")
    .select(
      `id, title, status, passing_score, lesson_id, module_id, updated_at,
       quiz_questions (id),
       quiz_attempts (id, passed),
       lessons:lesson_id ( title ),
       modules:module_id ( title )`,
    )
    .order("sort_order", { ascending: true });

  type Roh = {
    id: string;
    title: string;
    status: string;
    passing_score: number;
    lesson_id: string | null;
    module_id: string | null;
    updated_at: string;
    quiz_questions: { id: string }[] | null;
    quiz_attempts: { id: string; passed: boolean }[] | null;
    lessons: { title: string } | null;
    modules: { title: string } | null;
  };

  return ((quizze ?? []) as unknown as Roh[]).map((q) => {
    const versuche = q.quiz_attempts ?? [];
    const bestanden = versuche.filter((v) => v.passed).length;
    const bindung: Zeile["bindung"] = q.lesson_id
      ? { typ: "Lektion", titel: q.lessons?.title ?? "—" }
      : q.module_id
        ? { typ: "Modul", titel: q.modules?.title ?? "—" }
        : null;
    return {
      id: q.id,
      title: q.title,
      status: q.status,
      passing_score: q.passing_score,
      fragen_anzahl: (q.quiz_questions ?? []).length,
      versuche_anzahl: versuche.length,
      bestanden_anzahl: bestanden,
      bindung,
      updated_at: q.updated_at,
    };
  });
}

function StatusBadge({ status }: { status: string }) {
  if (status === "aktiv") return <StatusPill ton="success">Aktiv</StatusPill>;
  if (status === "entwurf") return <StatusPill ton="warn">Entwurf</StatusPill>;
  return <StatusPill ton="neutral">Archiviert</StatusPill>;
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
      <AdminPageHeader
        title="Quizze"
        description="Quizze inkl. Fragen und Antworten verwalten. Sortiert nach Reihenfolge."
        badge={
          aktiv > 0 ? (
            <StatusPill ton="success" dot>
              {aktiv} aktiv
            </StatusPill>
          ) : null
        }
        actions={
          <AdminButton href="/admin/quizze/neu">
            <Plus className="h-3.5 w-3.5" />
            Neues Quiz
          </AdminButton>
        }
      />

      <StatsStrip
        items={[
          {
            icon: <HelpCircle className="h-4 w-4" />,
            label: "Quizze gesamt",
            wert: quizze.length,
            akzent: true,
            hint: aktiv === quizze.length ? "alle aktiv" : `${aktiv} aktiv`,
          },
          {
            icon: <Sparkles className="h-4 w-4" />,
            label: "Fragen gesamt",
            wert: fragenSumme,
          },
          {
            icon: <Target className="h-4 w-4" />,
            label: "Versuche",
            wert: versucheSumme,
            hint: "über alle Mitarbeiter",
          },
          {
            icon: <Award className="h-4 w-4" />,
            label: "Bestehensquote",
            wert: passQuote === null ? "—" : `${passQuote}%`,
            delta:
              passQuote !== null && passQuote >= 80
                ? `${bestandenSumme}/${versucheSumme}`
                : undefined,
          },
        ]}
      />

      <AdminCard>
        {quizze.length === 0 ? (
          <EmptyState
            icon={<HelpCircle className="h-6 w-6" />}
            title="Noch keine Quizze"
            description="Lege ein Quiz an und verknüpfe es mit einer Lektion oder einem Modul."
            ctaLabel="Quiz anlegen"
            ctaHref="/admin/quizze/neu"
          />
        ) : (
          <AdminTable>
          <AdminTableHead>
            <AdminTh>Titel</AdminTh>
            <AdminTh>Bindung</AdminTh>
            <AdminTh>Status</AdminTh>
            <AdminTh align="right">Fragen</AdminTh>
            <AdminTh align="right">Pass</AdminTh>
            <AdminTh align="right">Versuche</AdminTh>
            <AdminTh align="right">Bestanden</AdminTh>
            <AdminTh>Aktualisiert</AdminTh>
            <AdminTh align="right">Vorschau</AdminTh>
            <AdminTh align="right" />
          </AdminTableHead>
          <tbody>
            {quizze.map((q) => (
                <AdminTr key={q.id}>
                  <AdminTitleCell
                    href={`/admin/quizze/${q.id}`}
                    title={q.title}
                    subtitle={
                      q.bindung
                        ? `${q.bindung.typ}: ${q.bindung.titel}`
                        : undefined
                    }
                  />
                  <AdminTd className="text-xs text-muted-foreground">
                    {q.bindung ? q.bindung.typ : "—"}
                  </AdminTd>
                  <AdminTd>
                    <StatusBadge status={q.status} />
                  </AdminTd>
                  <AdminTd align="right" className="tabular-nums">
                    {q.fragen_anzahl}
                  </AdminTd>
                  <AdminTd
                    align="right"
                    className="tabular-nums text-xs text-muted-foreground"
                  >
                    {q.passing_score}%
                  </AdminTd>
                  <AdminTd align="right" className="tabular-nums">
                    {q.versuche_anzahl}
                  </AdminTd>
                  <AdminTd align="right" className="tabular-nums">
                    {q.bestanden_anzahl}
                  </AdminTd>
                  <AdminTd className="text-xs text-muted-foreground">
                    {formatDatum(q.updated_at)}
                  </AdminTd>
                  <AdminTd align="right">
                    <Link
                      href={`/quiz/${q.id}`}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
                      title="Vorschau"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </AdminTd>
                  <AdminActionCell href={`/admin/quizze/${q.id}`} />
                </AdminTr>
              ))}
          </tbody>
        </AdminTable>
        )}
      </AdminCard>
    </div>
  );
}
