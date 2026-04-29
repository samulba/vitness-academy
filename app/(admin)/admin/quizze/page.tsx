import {
  Award,
  ExternalLink,
  HelpCircle,
  Pencil,
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
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusPill } from "@/components/admin/StatusPill";
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
  bindung_typ: string | null;
  bindung_titel: string | null;
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
    const bindung_typ = q.lesson_id ? "Lektion" : q.module_id ? "Modul" : null;
    const bindung_titel = q.lesson_id
      ? q.lessons?.title ?? "—"
      : q.module_id
        ? q.modules?.title ?? "—"
        : null;
    return {
      id: q.id,
      title: q.title,
      status: q.status,
      passing_score: q.passing_score,
      fragen_anzahl: (q.quiz_questions ?? []).length,
      versuche_anzahl: versuche.length,
      bestanden_anzahl: bestanden,
      bindung_typ,
      bindung_titel,
      updated_at: q.updated_at,
    };
  });
}

function StatusBadge({ status }: { status: string }) {
  if (status === "aktiv")
    return (
      <StatusPill ton="success" dot>
        Aktiv
      </StatusPill>
    );
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

  const columns: Column<Zeile>[] = [
    {
      key: "title",
      label: "Titel",
      sortable: true,
      render: (q) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-foreground">{q.title}</span>
          {q.bindung_titel && (
            <span className="text-[11px] text-muted-foreground">
              {q.bindung_typ}: {q.bindung_titel}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (q) => <StatusBadge status={q.status} />,
    },
    {
      key: "fragen_anzahl",
      label: "Fragen",
      sortable: true,
      align: "right",
      render: (q) => <span className="tabular-nums">{q.fragen_anzahl}</span>,
    },
    {
      key: "passing_score",
      label: "Pass",
      sortable: true,
      align: "right",
      render: (q) => (
        <span className="tabular-nums text-xs text-muted-foreground">
          {q.passing_score}%
        </span>
      ),
    },
    {
      key: "versuche_anzahl",
      label: "Versuche",
      sortable: true,
      align: "right",
      render: (q) => <span className="tabular-nums">{q.versuche_anzahl}</span>,
    },
    {
      key: "bestanden_anzahl",
      label: "Bestanden",
      sortable: true,
      align: "right",
      render: (q) => (
        <span className="tabular-nums">{q.bestanden_anzahl}</span>
      ),
    },
    {
      key: "updated_at",
      label: "Aktualisiert",
      sortable: true,
      render: (q) => (
        <span className="text-xs text-muted-foreground">
          {formatDatum(q.updated_at)}
        </span>
      ),
    },
  ];

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
        <DataTable<Zeile>
          data={quizze}
          columns={columns}
          searchable={{ placeholder: "Quiz suchen…", keys: ["title"] }}
          filters={[
            {
              key: "status",
              label: "Status",
              options: [
                { value: "aktiv", label: "Aktiv" },
                { value: "entwurf", label: "Entwurf" },
                { value: "archiviert", label: "Archiviert" },
              ],
              multi: true,
            },
          ]}
          rowHref={(q) => `/admin/quizze/${q.id}`}
          rowActions={[
            {
              icon: <ExternalLink />,
              label: "Vorschau",
              href: (q) => `/quiz/${q.id}`,
            },
            {
              icon: <Pencil />,
              label: "Bearbeiten",
              href: (q) => `/admin/quizze/${q.id}`,
            },
          ]}
          defaultSort={{ key: "title", direction: "asc" }}
        />
      )}

      <p className="text-[11px] text-muted-foreground">
        {aktiv} von {quizze.length} Quiz{quizze.length === 1 ? "" : "ze"} aktiv.
      </p>
    </div>
  );
}
