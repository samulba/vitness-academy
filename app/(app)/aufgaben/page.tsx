import { CheckCircle2 } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { ladeMeineAufgaben, type Aufgabe } from "@/lib/aufgaben";
import { AufgabenZeile } from "@/components/aufgaben/AufgabenZeile";

export default async function AufgabenPage() {
  const profile = await requireProfile();
  const { heute, dieseWoche, erledigt } = await ladeMeineAufgaben(profile.id);

  return (
    <div className="space-y-12">
      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))]">
          Studio
        </p>
        <h1 className="mt-3 text-balance font-semibold leading-[1.1] tracking-[-0.025em] text-[clamp(1.875rem,3vw,2.75rem)]">
          Aufgaben
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
          Was heute zu tun ist und was diese Woche ansteht.
        </p>
      </header>

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
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold tracking-tight">{titel}</h2>
        <span className="text-xs tabular-nums text-muted-foreground">
          {anzahl}
        </span>
      </div>
      {liste.length === 0 ? (
        <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
          <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" />
          {leer}
        </div>
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-border bg-card">
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
