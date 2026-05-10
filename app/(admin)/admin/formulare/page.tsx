import { FileText, Inbox, Plus, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { EmptyState, EmptyStateTablePreview } from "@/components/ui/empty-state";
import { requirePermission } from "@/lib/auth";
import { ladeSubmissions, ladeTemplates } from "@/lib/formulare";
import { FormulareTable } from "./FormulareTable";

export default async function FormulareAdminPage() {
  await requirePermission("formulare", "view");
  const [templates, offen, alle] = await Promise.all([
    ladeTemplates(),
    ladeSubmissions({ status: ["eingereicht", "in_bearbeitung"] }),
    ladeSubmissions(),
  ]);
  const aktiv = templates.filter((t) => t.status === "aktiv").length;

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
        <FormulareTable templates={templates} />
      )}

      <p className="text-[11px] text-muted-foreground">
        {aktiv} von {templates.length} Formular
        {templates.length === 1 ? "" : "en"} aktiv.
      </p>
    </div>
  );
}
