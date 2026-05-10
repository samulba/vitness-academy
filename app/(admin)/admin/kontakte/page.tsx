import { Plus, Settings2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState, EmptyStateTablePreview } from "@/components/ui/empty-state";
import { requirePermission } from "@/lib/auth";
import { ladeKontakte } from "@/lib/kontakte";
import { KontakteListe } from "@/components/kontakte/KontakteListe";

export default async function KontakteAdminPage() {
  await requirePermission("kontakte", "view");
  // Admin sieht alle Kontakte über alle Standorte.
  const kontakte = await ladeKontakte(null);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Studio-Daten"
        title="Kontakte"
        description="Internes Team und externe Partner — alles, was im Studio-Alltag erreichbar sein muss."
        primaryAction={{
          label: "Neuer Kontakt",
          icon: <Plus />,
          href: "/admin/kontakte/neu",
        }}
        secondaryActions={[
          {
            label: "Rollen verwalten",
            icon: <Settings2 />,
            href: "/admin/kontakte/rollen",
          },
        ]}
      />

      {kontakte.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            illustration={<EmptyStateTablePreview />}
            title="Noch keine Kontakte"
            description="Lege Mitarbeiter, externe Trainer oder Lieferanten an, die das Team braucht."
            actions={[
              {
                icon: <Plus />,
                title: "Kontakt anlegen",
                description: "Mit Rollen-Tags",
                href: "/admin/kontakte/neu",
              },
            ]}
          />
        </div>
      ) : (
        <KontakteListe kontakte={kontakte} detailBasePath="/admin/kontakte" />
      )}
    </div>
  );
}
