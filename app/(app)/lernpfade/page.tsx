import { Card, CardContent } from "@/components/ui/card";
import { PfadCard } from "@/components/lernpfad/PfadCard";
import { requireProfile } from "@/lib/auth";
import { ladeMeineLernpfade } from "@/lib/lernpfade";

export default async function LernpfadeUebersichtPage() {
  const profile = await requireProfile();
  const pfade = await ladeMeineLernpfade(profile.id);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">
          Meine Lernpfade
        </h1>
        <p className="mt-1 text-muted-foreground">
          Diese Lernpfade wurden dir zugewiesen.
        </p>
      </header>

      {pfade.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Dir wurden noch keine Lernpfade zugewiesen.
          </CardContent>
        </Card>
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
