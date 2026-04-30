import { Lock, Plus, ShieldCheck, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { EmptyState, EmptyStateTablePreview } from "@/components/ui/empty-state";
import { DataTable, type Column } from "@/components/ui/data-table";
import { requireRole } from "@/lib/auth";
import { ladeRollen, type RollenZeile } from "@/lib/rollen-admin";

const BASE_LEVEL_LABELS: Record<string, string> = {
  mitarbeiter: "Mitarbeiter",
  fuehrungskraft: "Führungskraft",
  admin: "Admin",
  superadmin: "Superadmin",
};

export default async function RollenAdminPage() {
  await requireRole(["superadmin"]);
  const rollen = await ladeRollen();
  const aktive = rollen.filter((r) => !r.archived_at);
  const customCount = aktive.filter((r) => !r.is_system).length;
  const mitarbeiterSumme = rollen.reduce((s, r) => s + r.mitarbeiter_count, 0);

  const columns: Column<RollenZeile>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-3">
          <span
            className={
              r.is_system
                ? "flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"
                : "flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[hsl(var(--brand-pink)/0.12)] text-[hsl(var(--brand-pink))]"
            }
          >
            {r.is_system ? (
              <Lock className="h-3.5 w-3.5" />
            ) : (
              <ShieldCheck className="h-3.5 w-3.5" />
            )}
          </span>
          <div className="flex flex-col">
            <span className="font-medium text-foreground">{r.name}</span>
            {r.beschreibung && (
              <span className="text-[11px] text-muted-foreground line-clamp-1">
                {r.beschreibung}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "base_level",
      label: "Basis",
      sortable: true,
      render: (r) => (
        <span className="text-xs text-muted-foreground">
          {BASE_LEVEL_LABELS[r.base_level] ?? r.base_level}
        </span>
      ),
    },
    {
      key: "is_system",
      label: "Typ",
      sortable: true,
      render: (r) =>
        r.is_system ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            <Lock className="h-2.5 w-2.5" />
            System
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--brand-pink)/0.12)] px-2 py-0.5 text-[11px] font-medium text-[hsl(var(--brand-pink))]">
            Custom
          </span>
        ),
    },
    {
      key: "permission_count",
      label: "Rechte",
      sortable: true,
      align: "right",
      render: (r) => (
        <span className="text-xs tabular-nums text-muted-foreground">
          {r.permission_count}
        </span>
      ),
    },
    {
      key: "mitarbeiter_count",
      label: "Mitarbeiter",
      sortable: true,
      align: "right",
      render: (r) => (
        <span className="inline-flex items-center gap-1 text-xs tabular-nums text-muted-foreground">
          <Users className="h-3 w-3" />
          {r.mitarbeiter_count}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Verwaltung"
        title="Rollen & Rechte"
        description="System-Rollen plus selbst angelegte Rollen mit feiner Permission-Matrix."
        primaryAction={{
          label: "Neue Rolle",
          icon: <Plus />,
          href: "/admin/rollen/neu",
        }}
      />

      <StatGrid cols={3}>
        <StatCard label="Rollen aktiv" value={aktive.length} icon={<ShieldCheck />} />
        <StatCard label="Custom Rollen" value={customCount} icon={<Plus />} />
        <StatCard
          label="Mitarbeiter zugeordnet"
          value={mitarbeiterSumme}
          icon={<Users />}
        />
      </StatGrid>

      {rollen.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            illustration={<EmptyStateTablePreview />}
            title="Noch keine Rollen"
            description="System-Rollen werden bei der Migration angelegt."
          />
        </div>
      ) : (
        <DataTable<RollenZeile>
          data={rollen}
          columns={columns}
          searchable={{ placeholder: "Rolle suchen…", keys: ["name"] }}
          rowHref={(r) => `/admin/rollen/${r.id}`}
          defaultSort={{ key: "name", direction: "asc" }}
        />
      )}
    </div>
  );
}
