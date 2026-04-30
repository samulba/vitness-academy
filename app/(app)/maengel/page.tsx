import { ImageIcon } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
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

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Studio"
        title="Mängel melden"
        description="Defekte Geräte, kaputte Sachen, Probleme — kurz erfassen und die Studioleitung kümmert sich."
      />

      <section className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-[14px] font-semibold tracking-tight">
                Neuen Mangel erfassen
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Je präziser, desto schneller behoben.
              </p>
            </div>
            <div className="p-5">
              <MangelForm />
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-7">
          {meine.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-[14px] font-semibold tracking-tight">
                  Von dir gemeldet
                </h2>
              </div>
              <ul className="divide-y divide-border">
                {meine.slice(0, 5).map((m) => (
                  <li key={m.id}>
                    <MangelZeile m={m} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {team.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-[14px] font-semibold tracking-tight">
                  Aktuell offen im Studio
                </h2>
              </div>
              <ul className="divide-y divide-border">
                {team.map((m) => (
                  <li key={m.id}>
                    <MangelZeile m={m} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {meine.length === 0 && team.length === 0 && (
            <div className="rounded-xl border border-border bg-card">
              <EmptyState
                title="Keine offenen Mängel. Stark."
                description="Sobald jemand etwas meldet, taucht es hier auf."
              />
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
      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-muted-foreground">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImageIcon className="h-4 w-4" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <p className="text-[13px] font-medium leading-tight">{m.title}</p>
          <MangelStatusBadge status={m.status} />
        </div>
        {m.description && (
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
            {m.description}
          </p>
        )}
        <p className="mt-1 text-[11px] text-muted-foreground">
          {formatDatum(m.created_at)}
          {m.reported_by_name && <> · {m.reported_by_name}</>}
        </p>
      </div>
    </div>
  );
}
