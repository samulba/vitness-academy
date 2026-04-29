import { MapPin, Plus, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { EmptyState, EmptyStateTablePreview } from "@/components/ui/empty-state";
import { DataTable, type Column } from "@/components/ui/data-table";
import { requireRole } from "@/lib/auth";
import { ladeStandorte, type Standort } from "@/lib/standorte";

export default async function StandorteAdminPage() {
  await requireRole(["admin", "superadmin"]);
  const standorte = await ladeStandorte();
  const mitarbeiterSumme = standorte.reduce(
    (s, x) => s + x.mitarbeiter_count,
    0,
  );
  const leerStehend = standorte.filter((s) => s.mitarbeiter_count === 0).length;

  const columns: Column<Standort>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (s) => (
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[hsl(var(--brand-pink)/0.12)] text-[hsl(var(--brand-pink))]">
            <MapPin className="h-3.5 w-3.5" />
          </span>
          <span className="font-medium text-foreground">{s.name}</span>
        </div>
      ),
    },
    {
      key: "mitarbeiter_count",
      label: "Mitarbeiter",
      sortable: true,
      align: "right",
      render: (s) => (
        <span className="inline-flex items-center gap-1 text-xs tabular-nums text-muted-foreground">
          <Users className="h-3 w-3" />
          {s.mitarbeiter_count}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Mitarbeiter"
        title="Standorte"
        description="Studios, denen Mitarbeiter zugeordnet werden können."
        primaryAction={{
          label: "Neuer Standort",
          icon: <Plus />,
          href: "/admin/standorte/neu",
        }}
      />

      <StatGrid cols={3}>
        <StatCard label="Standorte" value={standorte.length} icon={<MapPin />} />
        <StatCard
          label="Mitarbeiter zugeordnet"
          value={mitarbeiterSumme}
          icon={<Users />}
        />
        <StatCard
          label="Ohne Mitarbeiter"
          value={leerStehend}
          icon={<MapPin />}
        />
      </StatGrid>

      {standorte.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            illustration={<EmptyStateTablePreview />}
            title="Noch keine Standorte"
            description="Mehrstandort-Setup vorbereiten — auch wenn ihr (noch) nur ein Studio habt."
            actions={[
              {
                icon: <Plus />,
                title: "Ersten Standort anlegen",
                description: "z.B. Studio Mitte",
                href: "/admin/standorte/neu",
              },
            ]}
          />
        </div>
      ) : (
        <DataTable<Standort>
          data={standorte}
          columns={columns}
          searchable={{ placeholder: "Standort suchen…", keys: ["name"] }}
          rowHref={(s) => `/admin/standorte/${s.id}`}
          defaultSort={{ key: "name", direction: "asc" }}
        />
      )}
    </div>
  );
}
