import {
  AlertTriangle,
  EyeOff,
  Megaphone,
  Pin,
  Plus,
  Siren,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { EmptyState, EmptyStateTablePreview } from "@/components/ui/empty-state";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusPill } from "@/components/admin/StatusPill";
import { requireRole } from "@/lib/auth";
import {
  INFO_KATEGORIEN,
  kategorieLabel,
  ladeAnnouncements,
  type Announcement,
} from "@/lib/infos";
import { ladeStandorte } from "@/lib/standorte";
import { formatDatum } from "@/lib/format";

export default async function InfosAdminPage() {
  await requireRole(["admin", "superadmin"]);
  const [infos, standorte] = await Promise.all([
    ladeAnnouncements({ nurPublished: false }),
    ladeStandorte(),
  ]);
  const standortById = new Map(standorte.map((s) => [s.id, s.name]));
  const veroeffentlicht = infos.filter((i) => i.published).length;
  const kritisch = infos.filter(
    (i) => i.importance === "critical" && i.published,
  ).length;
  const angepinnt = infos.filter((i) => i.pinned && i.published).length;

  const columns: Column<Announcement>[] = [
    {
      key: "title",
      label: "Titel",
      sortable: true,
      render: (i) => (
        <div className="flex items-center gap-2">
          {i.pinned && <Pin className="h-3 w-3 text-[hsl(var(--brand-pink))]" />}
          <span className="font-medium text-foreground">{i.title}</span>
        </div>
      ),
    },
    {
      key: "importance",
      label: "Wichtigkeit",
      sortable: true,
      render: (i) =>
        i.importance === "critical" ? (
          <StatusPill ton="danger" dot>
            <Siren className="h-3 w-3" />
            Kritisch
          </StatusPill>
        ) : i.importance === "warning" ? (
          <StatusPill ton="warn">
            <AlertTriangle className="h-3 w-3" />
            Warnung
          </StatusPill>
        ) : (
          <StatusPill ton="info">Info</StatusPill>
        ),
    },
    {
      key: "published",
      label: "Status",
      sortable: true,
      render: (i) =>
        i.published ? (
          <StatusPill ton="success" dot>
            Veröffentlicht
          </StatusPill>
        ) : (
          <StatusPill ton="neutral">
            <EyeOff className="h-3 w-3" />
            Entwurf
          </StatusPill>
        ),
    },
    {
      key: "category",
      label: "Kategorie",
      sortable: true,
      render: (i) => (
        <span className="text-xs text-muted-foreground">
          {kategorieLabel(i.category)}
        </span>
      ),
    },
    {
      key: "location_id",
      label: "Standort",
      render: (i) => (
        <span className="text-xs text-muted-foreground">
          {i.location_id ? standortById.get(i.location_id) ?? "—" : "Alle"}
        </span>
      ),
    },
    {
      key: "author_name",
      label: "Autor",
      render: (i) => (
        <span className="text-xs text-muted-foreground">
          {i.author_name ?? "—"}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Datum",
      sortable: true,
      render: (i) => (
        <span className="text-xs text-muted-foreground">
          {formatDatum(i.created_at)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Studio-Daten"
        title="Wichtige Infos"
        description="Mitteilungen, die Mitarbeiter:innen unter Studio · Wichtige Infos sehen."
        primaryAction={{
          label: "Neue Info",
          icon: <Plus />,
          href: "/admin/infos/neu",
        }}
      />

      <StatGrid cols={4}>
        <StatCard
          label="Veröffentlicht"
          value={veroeffentlicht}
          icon={<Megaphone />}
        />
        <StatCard label="Kritisch live" value={kritisch} icon={<Siren />} />
        <StatCard label="Angepinnt" value={angepinnt} icon={<Pin />} />
        <StatCard
          label="Entwürfe"
          value={infos.length - veroeffentlicht}
          icon={<EyeOff />}
        />
      </StatGrid>

      {infos.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            illustration={<EmptyStateTablePreview />}
            title="Noch keine Infos"
            description="Schreibe die erste Mitteilung an dein Team. Markdown-Body, Wichtigkeit setzen, an-pinnen."
            actions={[
              {
                icon: <Plus />,
                title: "Info anlegen",
                description: "Erste Mitteilung",
                href: "/admin/infos/neu",
              },
            ]}
          />
        </div>
      ) : (
        <DataTable<Announcement>
          data={infos}
          columns={columns}
          searchable={{
            placeholder: "Info suchen…",
            keys: ["title"],
          }}
          filters={[
            {
              key: "importance",
              label: "Wichtigkeit",
              options: [
                { value: "info", label: "Info" },
                { value: "warning", label: "Warnung" },
                { value: "critical", label: "Kritisch" },
              ],
              multi: true,
            },
            {
              key: "category",
              label: "Kategorie",
              options: INFO_KATEGORIEN.map((k) => ({
                value: k.value,
                label: k.label,
              })),
              multi: true,
            },
          ]}
          rowHref={(i) => `/admin/infos/${i.id}`}
          defaultSort={{ key: "created_at", direction: "desc" }}
        />
      )}
    </div>
  );
}
