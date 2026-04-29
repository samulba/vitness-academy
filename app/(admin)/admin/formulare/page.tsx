import { FileText, Inbox, Plus, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { EmptyState, EmptyStateTablePreview } from "@/components/ui/empty-state";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusPill } from "@/components/admin/StatusPill";
import { requireRole } from "@/lib/auth";
import {
  ladeSubmissions,
  ladeTemplates,
  type Template,
} from "@/lib/formulare";

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

export default async function FormulareAdminPage() {
  await requireRole(["admin", "superadmin"]);
  const [templates, offen, alle] = await Promise.all([
    ladeTemplates(),
    ladeSubmissions({ status: ["eingereicht", "in_bearbeitung"] }),
    ladeSubmissions(),
  ]);
  const aktiv = templates.filter((t) => t.status === "aktiv").length;

  const columns: Column<Template>[] = [
    {
      key: "title",
      label: "Titel",
      sortable: true,
      render: (t) => (
        <span className="font-medium text-foreground">{t.title}</span>
      ),
    },
    {
      key: "slug",
      label: "Slug",
      sortable: true,
      render: (t) => (
        <span className="font-mono text-xs text-muted-foreground">
          /{t.slug}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (t) => <StatusBadge status={t.status} />,
    },
    {
      key: "fields",
      label: "Felder",
      align: "right",
      accessor: (t) => t.fields.length,
      render: (t) => (
        <span className="tabular-nums">{t.fields.length}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Studio-Daten"
        title="Formulare"
        description="Vorlagen pflegen, Einreichungen bearbeiten."
        primaryAction={{
          label: "Neues Formular",
          icon: <Plus />,
          href: "/admin/formulare/neu",
        }}
        secondaryActions={[
          {
            icon: <Inbox />,
            label: `Eingänge${offen.length > 0 ? ` (${offen.length})` : ""}`,
            href: "/admin/formulare/eingaenge",
          },
        ]}
      />

      <StatGrid cols={4}>
        <StatCard label="Formulare" value={templates.length} icon={<FileText />} />
        <StatCard label="Im Eingang" value={offen.length} icon={<Inbox />} />
        <StatCard
          label="Einreichungen gesamt"
          value={alle.length}
          icon={<Sparkles />}
        />
        <StatCard
          label="Felder gesamt"
          value={templates.reduce((s, t) => s + t.fields.length, 0)}
          icon={<FileText />}
        />
      </StatGrid>

      {templates.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            illustration={<EmptyStateTablePreview />}
            title="Noch keine Formulare"
            description="Bau dein erstes Formular per Drag & Drop. Krankmeldung, Urlaubsantrag, Schadensmeldung — was du brauchst."
            actions={[
              {
                icon: <Plus />,
                title: "Formular bauen",
                description: "Felder per Klick",
                href: "/admin/formulare/neu",
              },
              {
                icon: <Inbox />,
                title: "Eingänge",
                description: "Bereits eingegangen",
                href: "/admin/formulare/eingaenge",
              },
            ]}
          />
        </div>
      ) : (
        <DataTable<Template>
          data={templates}
          columns={columns}
          searchable={{
            placeholder: "Formular suchen…",
            keys: ["title", "slug"],
          }}
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
          rowHref={(t) => `/admin/formulare/${t.id}`}
          defaultSort={{ key: "title", direction: "asc" }}
        />
      )}

      <p className="text-[11px] text-muted-foreground">
        {aktiv} von {templates.length} Formular
        {templates.length === 1 ? "" : "en"} aktiv.
      </p>
    </div>
  );
}
