import { ImageIcon, ShieldCheck, Wrench } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { fotoUrlFuerPfad, ladeMaengel, type Mangel } from "@/lib/maengel";
import { formatDatum } from "@/lib/format";
import { MangelStatusBadge } from "@/components/maengel/StatusBadge";
import { MangelForm } from "./MangelForm";

export default async function MaengelPage() {
  const profile = await requireProfile();
  const [meine, alle] = await Promise.all([
    ladeMaengel({ reportedBy: profile.id }),
    ladeMaengel({ status: ["offen", "in_bearbeitung"] }),
  ]);

  const meineIds = new Set(meine.map((m) => m.id));
  const team = alle.filter((m) => !meineIds.has(m.id)).slice(0, 8);
  const istLeer = meine.length === 0 && team.length === 0;

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-12 py-4">
      <header className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Studio
        </p>
        <div className="max-w-2xl space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            Mängel melden
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            Defekte Geräte, kaputte Sachen, Probleme — kurz erfassen und die
            Studioleitung kümmert sich.
          </p>
        </div>
      </header>

      {istLeer ? (
        <div className="mx-auto max-w-2xl space-y-8">
          <FormCard />
          <EmptyZustand />
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-12">
          <aside className="lg:col-span-5 xl:col-span-4">
            <div className="lg:sticky lg:top-20">
              <FormCard />
            </div>
          </aside>

          <section className="space-y-6 lg:col-span-7 xl:col-span-8">
            {meine.length > 0 && (
              <ListenCard
                title="Von dir gemeldet"
                items={meine.slice(0, 5)}
              />
            )}

            {team.length > 0 && (
              <ListenCard
                title="Aktuell offen im Studio"
                items={team}
              />
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function FormCard() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--brand-pink)/0.12)] text-[hsl(var(--brand-pink))]">
          <Wrench className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <div>
          <h2 className="text-base font-semibold tracking-tight">
            Neuen Mangel erfassen
          </h2>
          <p className="text-xs text-muted-foreground">
            Je präziser, desto schneller behoben.
          </p>
        </div>
      </div>
      <MangelForm />
    </div>
  );
}

function ListenCard({
  title,
  items,
}: {
  title: string;
  items: Mangel[];
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <header className="border-b border-border px-6 py-4">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      </header>
      <ul className="divide-y divide-border">
        {items.map((m) => (
          <li key={m.id}>
            <MangelZeile m={m} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function EmptyZustand() {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-8 py-16 text-center">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-background text-muted-foreground">
        <ShieldCheck className="h-6 w-6" strokeWidth={1.5} />
      </span>
      <h3 className="text-base font-semibold tracking-tight">
        Keine offenen Mängel. Stark.
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Sobald jemand etwas meldet, taucht es hier auf.
      </p>
    </div>
  );
}

function MangelZeile({ m }: { m: Mangel }) {
  const url = fotoUrlFuerPfad(m.photo_path);
  return (
    <div className="flex items-start gap-4 px-6 py-4">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted text-muted-foreground">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImageIcon className="h-4 w-4" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <p className="text-sm font-medium leading-tight">{m.title}</p>
          <MangelStatusBadge status={m.status} />
        </div>
        {m.description && (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {m.description}
          </p>
        )}
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          {formatDatum(m.created_at)}
          {m.reported_by_name && <> · {m.reported_by_name}</>}
        </p>
      </div>
    </div>
  );
}
