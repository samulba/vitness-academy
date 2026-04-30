import { CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { requireProfile } from "@/lib/auth";
import { ladeAnnouncements, ladeReadIds } from "@/lib/infos";
import { InfoCard } from "@/components/infos/InfoCard";
import { alleInfosAlsGelesen } from "./actions";

export default async function InfosPage() {
  const profile = await requireProfile();
  const [infos, gelesen] = await Promise.all([
    ladeAnnouncements({ nurPublished: true }),
    ladeReadIds(profile.id),
  ]);
  const ungelesenAnzahl = infos.filter((i) => !gelesen.has(i.id)).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex-1">
          <PageHeader
            eyebrow="Studio"
            title="Wichtige Infos"
            description="Mitteilungen der Studioleitung. Angeheftete und dringende Infos stehen oben."
          />
        </div>
        {ungelesenAnzahl > 0 && (
          <form action={alleInfosAlsGelesen}>
            <Button type="submit" variant="secondary">
              <CheckCheck />
              Alle als gelesen ({ungelesenAnzahl})
            </Button>
          </form>
        )}
      </div>

      {infos.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            title="Aktuell keine Infos"
            description="Wenn die Studioleitung etwas postet, erscheint es hier."
          />
        </div>
      ) : (
        <ul className="space-y-3">
          {infos.map((i) => (
            <li key={i.id}>
              <InfoCard info={i} istGelesen={gelesen.has(i.id)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
