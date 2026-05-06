import { GraduationCap, ListChecks, Plus, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { EmptyState, EmptyStateTablePreview } from "@/components/ui/empty-state";
import { requireRole } from "@/lib/auth";
import { ladeTemplates } from "@/lib/onboarding-templates";
import { ladeChecklistItems } from "@/lib/onboarding-checklist";
import { OnboardingTemplatesTable } from "./OnboardingTemplatesTable";
import { ChecklistItemsListe } from "./ChecklistItemsListe";

export default async function OnboardingTemplatesPage() {
  await requireRole(["admin", "superadmin"]);
  const [templates, checklistItems] = await Promise.all([
    ladeTemplates(),
    ladeChecklistItems(null),
  ]);

  const totalPfade = templates.reduce((s, t) => s + t.lernpfad_count, 0);

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

      <StatGrid cols={3}>
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
        <StatCard
          label="Checklist-Items"
          value={checklistItems.length}
          icon={<ListChecks />}
        />
      </StatGrid>

      {/* Standard-Checklist (template_id = null) -- gilt fuer alle */}
      <ChecklistItemsListe
        templateId={null}
        items={checklistItems.map((i) => ({
          id: i.id,
          label: i.label,
          beschreibung: i.beschreibung,
          sort_order: i.sort_order,
        }))}
        titel="Standard-Checklist"
        beschreibung={`Items, die bei JEDEM neuen Mitarbeiter:innen-Eintritt angezeigt werden. „Schlüssel ausgehändigt", „Hygieneplan unterschrieben" usw. Reihenfolge per Drag-Handle.`}
      />

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
        <OnboardingTemplatesTable templates={templates} />
      )}
    </div>
  );
}
