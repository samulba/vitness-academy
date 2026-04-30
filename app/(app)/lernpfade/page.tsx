import { GraduationCap, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { PfadCard } from "@/components/lernpfad/PfadCard";
import { requireProfile } from "@/lib/auth";
import { ladeMeineLernpfade } from "@/lib/lernpfade";

export default async function LernpfadeUebersichtPage() {
  const profile = await requireProfile();
  const pfade = await ladeMeineLernpfade(profile.id);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Lernen"
        title="Meine Lernpfade"
        description="Diese Lernpfade wurden dir zugewiesen — strukturiert lernen, Lektion für Lektion."
      />

      {pfade.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            title="Noch keine Lernpfade zugewiesen"
            description="Sprich kurz dein Studio-Team an — sie weisen dir die passenden Inhalte zu."
            actions={[
              {
                icon: <Plus />,
                title: "Mit Studioleitung sprechen",
                description: "Lernpfade werden zugewiesen",
              },
              {
                icon: <GraduationCap />,
                title: "Im Handbuch nachschlagen",
                description: "Schnelle Antworten",
                href: "/wissen",
              },
            ]}
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pfade.map((pfad) => (
            <PfadCard
              key={pfad.id}
              id={pfad.id}
              title={pfad.title}
              description={pfad.description}
              modulAnzahl={pfad.modules.length}
              abgeschlossen={pfad.abgeschlossen}
              gesamt={pfad.gesamt}
              prozent={pfad.prozent}
              heroImagePath={pfad.hero_image_path}
            />
          ))}
        </div>
      )}
    </div>
  );
}
