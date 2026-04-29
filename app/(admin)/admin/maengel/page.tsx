import Link from "next/link";
import { ArrowRight, ImageIcon } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { fotoUrlFuerPfad, ladeMaengel, type Mangel } from "@/lib/maengel";
import { formatDatum } from "@/lib/format";
import { MangelStatusBadge } from "@/components/maengel/StatusBadge";

export default async function MaengelAdminPage() {
  await requireRole(["fuehrungskraft", "admin", "superadmin"]);
  const offen = await ladeMaengel({ status: ["offen", "in_bearbeitung"] });
  const erledigt = await ladeMaengel({ status: ["behoben", "verworfen"] });

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">
          Mängel im Studio
        </h1>
        <p className="mt-1 text-muted-foreground">
          Inbox aller gemeldeten Probleme. Klick öffnet die Details mit
          Status-Setzung.
        </p>
      </header>

      <Section
        titel="Aktuell offen"
        anzahl={offen.length}
        liste={offen}
        leer="Keine offenen Mängel — top!"
      />
      {erledigt.length > 0 && (
        <Section
          titel="Erledigt (letzte)"
          anzahl={erledigt.length}
          liste={erledigt.slice(0, 20)}
          leer=""
        />
      )}
    </div>
  );
}

function Section({
  titel,
  anzahl,
  liste,
  leer,
}: {
  titel: string;
  anzahl: number;
  liste: Mangel[];
  leer: string;
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
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          {leer}
        </div>
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-border bg-card">
          {liste.map((m, i) => (
            <li key={m.id} className={i > 0 ? "border-t border-border" : ""}>
              <MangelLink m={m} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function MangelLink({ m }: { m: Mangel }) {
  const url = fotoUrlFuerPfad(m.photo_path);
  return (
    <Link
      href={`/admin/maengel/${m.id}`}
      className="group flex items-start gap-4 px-5 py-4 transition-colors hover:bg-[hsl(var(--primary)/0.04)]"
    >
      <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-muted-foreground">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImageIcon className="h-5 w-5" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="font-semibold leading-tight">{m.title}</p>
          <MangelStatusBadge status={m.status} />
          {m.severity === "kritisch" && (
            <span className="rounded-full bg-[hsl(var(--destructive)/0.15)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--destructive))]">
              Kritisch
            </span>
          )}
        </div>
        {m.description && (
          <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
            {m.description}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          {formatDatum(m.created_at)}
          {m.reported_by_name && <> · gemeldet von {m.reported_by_name}</>}
        </p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 self-center text-muted-foreground transition-colors group-hover:text-[hsl(var(--primary))]" />
    </Link>
  );
}
