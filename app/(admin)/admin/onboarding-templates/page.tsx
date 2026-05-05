import { GraduationCap, Plus, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { EmptyState, EmptyStateTablePreview } from "@/components/ui/empty-state";
import { requireRole } from "@/lib/auth";
import { ladeTemplates } from "@/lib/onboarding-templates";
import { OnboardingTemplatesTable } from "./OnboardingTemplatesTable";

export default async function OnboardingTemplatesPage() {
  await requireRole(["admin", "superadmin"]);
  const templates = await ladeTemplates();

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
        <OnboardingTemplatesTable templates={templates} />
      )}
    </div>
  );
}
