import { CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { requireProfile } from "@/lib/auth";
import { ladeMeineAufgaben, type Aufgabe } from "@/lib/aufgaben";
import { getAktiverStandort } from "@/lib/standort-context";
import { AufgabenZeile } from "@/components/aufgaben/AufgabenZeile";
import { PutzprotokollHeuteCard } from "@/components/putzprotokoll/PutzprotokollHeuteCard";

export default async function AufgabenPage() {
  const profile = await requireProfile();
  const aktiv = await getAktiverStandort();
  const { heute, dieseWoche, erledigt } = await ladeMeineAufgaben(
    profile.id,
    aktiv?.id ?? null,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Studio"
        title="Aufgaben"
        description="Was heute zu tun ist und was diese Woche ansteht."
      />

      {aktiv && (
        <PutzprotokollHeuteCard
          locationId={aktiv.id}
          locationName={aktiv.name}
        />
      )}

      <Section
        titel="Heute"
        anzahl={heute.length}
        leer="Heute steht nichts mehr an."
        liste={heute}
      />

      <Section
        titel="Diese Woche"
        anzahl={dieseWoche.length}
        leer="Diese Woche keine weiteren Aufgaben."
        liste={dieseWoche}
      />

      {erledigt.length > 0 && (
        <Section
          titel="Zuletzt erledigt"
          anzahl={erledigt.length}
          leer=""
          liste={erledigt}
        />
      )}
    </div>
  );
}

function Section({
  titel,
  anzahl,
  leer,
  liste,
}: {
  titel: string;
  anzahl: number;
  leer: string;
  liste: Aufgabe[];
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-baseline justify-between">
        <h2 className="text-[14px] font-semibold tracking-tight">{titel}</h2>
        <span className="text-xs tabular-nums text-muted-foreground">
          {anzahl}
        </span>
      </div>
      {liste.length === 0 ? (
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-card p-5 text-sm text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-[hsl(var(--success))]" />
          {leer}
        </div>
      ) : (
        <ul className="overflow-hidden rounded-xl border border-border bg-card">
          {liste.map((a, i) => (
            <li key={a.id} className={i > 0 ? "border-t border-border" : ""}>
              <AufgabenZeile a={a} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
