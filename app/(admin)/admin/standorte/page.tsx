import { MapPin, Plus, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { EmptyState, EmptyStateTablePreview } from "@/components/ui/empty-state";
import { requireRole } from "@/lib/auth";
import { ladeStandorte } from "@/lib/standorte";
import { StandorteTable } from "./StandorteTable";

export default async function StandorteAdminPage() {
  await requireRole(["fuehrungskraft", "admin", "superadmin"]);
  const standorte = await ladeStandorte();
  const mitarbeiterSumme = standorte.reduce(
    (s, x) => s + x.mitarbeiter_count,
    0,
  );
  const leerStehend = standorte.filter((s) => s.mitarbeiter_count === 0).length;

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
        <StandorteTable standorte={standorte} />
      )}
    </div>
  );
}
