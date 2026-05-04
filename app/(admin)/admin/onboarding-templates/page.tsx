import { GraduationCap, Plus, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { EmptyState, EmptyStateTablePreview } from "@/components/ui/empty-state";
import { DataTable, type Column } from "@/components/ui/data-table";
import { requireRole } from "@/lib/auth";
import { rolleLabel } from "@/lib/format";
import { ladeTemplates, type TemplateMitMeta } from "@/lib/onboarding-templates";

export default async function OnboardingTemplatesPage() {
  await requireRole(["admin", "superadmin"]);
  const templates = await ladeTemplates();

  const totalPfade = templates.reduce((s, t) => s + t.lernpfad_count, 0);

  const columns: Column<TemplateMitMeta>[] = [
    {
      key: "name",
      label: "Template",
      sortable: true,
      render: (t) => (
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[hsl(var(--brand-pink)/0.12)] text-[hsl(var(--brand-pink))]">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <div className="flex flex-col">
            <span className="font-medium text-foreground">{t.name}</span>
            {t.beschreibung && (
              <span className="text-[11px] text-muted-foreground line-clamp-1">
                {t.beschreibung}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Rolle",
      sortable: true,
      render: (t) => (
        <span className="text-xs text-muted-foreground">
          {rolleLabel(t.role)}
        </span>
      ),
    },
    {
      key: "lernpfad_count",
      label: "Lernpfade",
      sortable: true,
      align: "right",
      render: (t) => (
        <span className="inline-flex items-center gap-1 text-xs tabular-nums text-muted-foreground">
          <GraduationCap className="h-3 w-3" />
          {t.lernpfad_count}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Mitarbeiter"
        title="Onboarding-Templates"
        description="Vordefinierte Sets aus Rolle + Lernpfaden — beim Anlegen neuer Mitarbeiter:innen wählst du das passende Template aus und alles ist vor-konfiguriert."
        primaryAction={{
          label: "Neues Template",
          icon: <Plus />,
          href: "/admin/onboarding-templates/neu",
        }}
      />

      <StatGrid cols={2}>
        <StatCard
          label="Templates"
          value={templates.length}
          icon={<Sparkles />}
        />
        <StatCard
          label="Lernpfade vorgesehen"
          value={totalPfade}
          icon={<GraduationCap />}
        />
      </StatGrid>

      {templates.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            illustration={<EmptyStateTablePreview />}
            title="Noch keine Templates"
            description='Lege ein erstes Template an — z.B. „Trainer-Onboarding" mit den 4 wichtigsten Lernpfaden.'
            actions={[
              {
                icon: <Plus />,
                title: "Erstes Template anlegen",
                description: "Name, Rolle, Lernpfade auswählen",
                href: "/admin/onboarding-templates/neu",
              },
            ]}
          />
        </div>
      ) : (
        <DataTable<TemplateMitMeta>
          data={templates}
          columns={columns}
          searchable={{ placeholder: "Template suchen…", keys: ["name"] }}
          rowHref={(t) => `/admin/onboarding-templates/${t.id}`}
          defaultSort={{ key: "name", direction: "asc" }}
        />
      )}
    </div>
  );
}
