import { EyeOff, Megaphone, Pin, Plus, Siren } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { EmptyState, EmptyStateTablePreview } from "@/components/ui/empty-state";
import { requirePermission } from "@/lib/auth";
import { ladeAnnouncements } from "@/lib/infos";
import { ladeStandorte } from "@/lib/standorte";
import { InfosTable } from "./InfosTable";

export default async function InfosAdminPage() {
  await requirePermission("infos", "view");
  // Admin sieht alle Infos aller Standorte.
  const [infos, standorte] = await Promise.all([
    ladeAnnouncements({ nurPublished: false, locationId: null }),
    ladeStandorte(),
  ]);
  const standortById: Record<string, string> = {};
  for (const s of standorte) standortById[s.id] = s.name;
  const veroeffentlicht = infos.filter((i) => i.published).length;
  const kritisch = infos.filter(
    (i) => i.importance === "critical" && i.published,
  ).length;
  const angepinnt = infos.filter((i) => i.pinned && i.published).length;

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
        <InfosTable infos={infos} standortById={standortById} />
      )}
    </div>
  );
}
