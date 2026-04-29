import { CheckCheck } from "lucide-react";
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
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))]">
            Studio
          </p>
          <h1 className="mt-3 text-balance font-semibold leading-[1.1] tracking-[-0.025em] text-[clamp(1.875rem,3vw,2.75rem)]">
            Wichtige Infos
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
            Mitteilungen der Studioleitung. Angeheftete und dringende Infos
            stehen oben.
          </p>
        </div>
        {ungelesenAnzahl > 0 && (
          <form action={alleInfosAlsGelesen}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <CheckCheck className="h-4 w-4" />
              Alle als gelesen ({ungelesenAnzahl})
            </button>
          </form>
        )}
      </header>

      {infos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
          Aktuell keine Infos. Wenn die Studioleitung etwas postet, erscheint
          es hier.
        </div>
      ) : (
        <ul className="space-y-4">
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
