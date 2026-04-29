import { ImageIcon } from "lucide-react";
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

  // alle ohne meine, max 8
  const meineIds = new Set(meine.map((m) => m.id));
  const team = alle.filter((m) => !meineIds.has(m.id)).slice(0, 8);

  return (
    <div className="space-y-12">
      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))]">
          Studio
        </p>
        <h1 className="mt-3 text-balance font-semibold leading-[1.1] tracking-[-0.025em] text-[clamp(1.875rem,3vw,2.75rem)]">
          Mängel melden
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
          Defekte Geräte, kaputte Sachen, Probleme — kurz erfassen und die
          Studioleitung kümmert sich.
        </p>
      </header>

      <section className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <h2 className="text-lg font-semibold tracking-tight">
            Neuen Mangel erfassen
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Je präziser, desto schneller behoben.
          </p>
          <div className="mt-5 rounded-2xl border border-border bg-card p-6">
            <MangelForm />
          </div>
        </div>

        <div className="space-y-8 lg:col-span-7">
          {meine.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Von dir gemeldet
              </h2>
              <ul className="mt-3 overflow-hidden rounded-2xl border border-border bg-card">
                {meine.slice(0, 5).map((m, i) => (
                  <li
                    key={m.id}
                    className={i > 0 ? "border-t border-border" : ""}
                  >
                    <MangelZeile m={m} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {team.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Aktuell offen im Studio
              </h2>
              <ul className="mt-3 overflow-hidden rounded-2xl border border-border bg-card">
                {team.map((m, i) => (
                  <li
                    key={m.id}
                    className={i > 0 ? "border-t border-border" : ""}
                  >
                    <MangelZeile m={m} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {meine.length === 0 && team.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
              Aktuell keine offenen Mängel. Stark.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function MangelZeile({ m }: { m: Mangel }) {
  const url = fotoUrlFuerPfad(m.photo_path);
  return (
    <div className="flex items-start gap-4 px-5 py-4">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-muted-foreground">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <ImageIcon className="h-5 w-5" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="font-semibold leading-tight">{m.title}</p>
          <MangelStatusBadge status={m.status} />
        </div>
        {m.description && (
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground sm:text-sm">
            {m.description}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          {formatDatum(m.created_at)}
          {m.reported_by_name && <> · {m.reported_by_name}</>}
        </p>
      </div>
    </div>
  );
}
