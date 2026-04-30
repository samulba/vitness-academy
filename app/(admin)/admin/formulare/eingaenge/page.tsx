import { CheckCircle2, Inbox, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { EmptyState, EmptyStateTablePreview } from "@/components/ui/empty-state";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusPill } from "@/components/admin/StatusPill";
import { ColoredAvatar } from "@/components/admin/ColoredAvatar";
import { requireRole } from "@/lib/auth";
import {
  ladeSubmissions,
  STATUS_LABEL,
  type Submission,
  type SubmissionStatus,
} from "@/lib/formulare";
import { formatDatum } from "@/lib/format";

function StatusBadge({ status }: { status: SubmissionStatus }) {
  if (status === "eingereicht")
    return (
      <StatusPill ton="primary" dot>
        {STATUS_LABEL[status]}
      </StatusPill>
    );
  if (status === "in_bearbeitung")
    return <StatusPill ton="warn">{STATUS_LABEL[status]}</StatusPill>;
  if (status === "erledigt")
    return <StatusPill ton="success">{STATUS_LABEL[status]}</StatusPill>;
  return <StatusPill ton="neutral">{STATUS_LABEL[status]}</StatusPill>;
}

const columns: Column<Submission>[] = [
  {
    key: "template_title",
    label: "Formular",
    sortable: true,
    render: (s) => (
      <span className="font-medium text-foreground">
        {s.template_title ?? "Formular"}
      </span>
    ),
  },
  {
    key: "submitted_by_name",
    label: "Eingereicht von",
    render: (s) => (
      <div className="flex items-center gap-2.5">
        <ColoredAvatar name={s.submitted_by_name} size="sm" />
        <span className="text-[13px]">{s.submitted_by_name ?? "—"}</span>
      </div>
    ),
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (s) => <StatusBadge status={s.status} />,
  },
  {
    key: "submitted_at",
    label: "Datum",
    sortable: true,
    render: (s) => (
      <span className="text-xs text-muted-foreground">
        {formatDatum(s.submitted_at)}
      </span>
    ),
  },
];

export default async function EingaengePage() {
  await requireRole(["fuehrungskraft", "admin", "superadmin"]);
  const offen = await ladeSubmissions({
    status: ["eingereicht", "in_bearbeitung"],
  });
  const erledigt = await ladeSubmissions({
    status: ["erledigt", "abgelehnt"],
  });
  const erledigtAnzahl = erledigt.filter((e) => e.status === "erledigt").length;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Verwaltung", href: "/admin" },
          { label: "Formulare", href: "/admin/formulare" },
          { label: "Eingänge" },
        ]}
        eyebrow="Eingänge"
        title="Formular-Eingänge"
        description="Eingereichte Formulare. Klick öffnet die Details mit Status-Setzung."
      />

      <StatGrid cols={3}>
        <StatCard label="Aktuell offen" value={offen.length} icon={<Inbox />} />
        <StatCard
          label="Erledigt"
          value={erledigtAnzahl}
          icon={<CheckCircle2 />}
        />
        <StatCard
          label="Gesamt"
          value={offen.length + erledigt.length}
          icon={<Sparkles />}
        />
      </StatGrid>

      <section className="space-y-2">
        <header>
          <h2 className="text-[14px] font-semibold tracking-tight">
            Aktuell offen ({offen.length})
          </h2>
        </header>
        {offen.length === 0 ? (
          <div className="rounded-xl border border-border bg-card">
            <EmptyState
              illustration={<EmptyStateTablePreview />}
              title="Keine offenen Einreichungen"
              description="Alles bearbeitet — neue Eingänge tauchen hier auf."
            />
          </div>
        ) : (
          <DataTable<Submission>
            data={offen}
            columns={columns}
            rowHref={(s) => `/admin/formulare/eingaenge/${s.id}`}
            defaultSort={{ key: "submitted_at", direction: "desc" }}
          />
        )}
      </section>

      {erledigt.length > 0 && (
        <section className="space-y-2">
          <header>
            <h2 className="text-[14px] font-semibold tracking-tight">
              Erledigt ({Math.min(30, erledigt.length)})
            </h2>
            <p className="text-[12px] text-muted-foreground">
              Letzte 30 abgeschlossene Einreichungen.
            </p>
          </header>
          <DataTable<Submission>
            data={erledigt.slice(0, 30)}
            columns={columns}
            rowHref={(s) => `/admin/formulare/eingaenge/${s.id}`}
            defaultSort={{ key: "submitted_at", direction: "desc" }}
          />
        </section>
      )}
    </div>
  );
}
