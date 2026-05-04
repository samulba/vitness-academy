import { Heart } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ColoredAvatar } from "@/components/admin/ColoredAvatar";
import { requireProfile } from "@/lib/auth";
import { ladeEmpfaengerOptionen, ladeKudos } from "@/lib/kudos";
import { getAktiverStandort } from "@/lib/standort-context";
import { formatDatum } from "@/lib/format";
import { KudosForm } from "./KudosForm";

export default async function KudosPage() {
  const profile = await requireProfile();
  const aktiv = await getAktiverStandort();
  const [kudosFeed, empfaenger] = await Promise.all([
    ladeKudos({ limit: 50, locationId: aktiv?.id ?? null }),
    ladeEmpfaengerOptionen(profile.id),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Studio"
        title="Kudos"
        description="Kollegin oder Kollege gut gemacht? Hier ein Lob loswerden — sie bekommen direkt eine Benachrichtigung."
      />

      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <KudosForm
          empfaenger={empfaenger.map((e) => ({ id: e.id, name: e.name }))}
        />
      </section>

      <section>
        <h2 className="text-[11px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--brand-pink))]">
          Aktuelle Lobs
        </h2>
        {kudosFeed.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
            <Heart className="mx-auto h-10 w-10 text-zinc-300 dark:text-zinc-600" />
            <p className="mt-3 text-sm font-medium">
              Noch kein Lob geteilt — sei der Erste.
            </p>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {kudosFeed.map((k) => (
              <li
                key={k.id}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <div className="flex items-center gap-3">
                  <ColoredAvatar
                    name={k.from_name}
                    avatarPath={k.from_avatar}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-semibold">
                        {k.from_name ?? "Jemand"}
                      </span>
                      <span className="text-muted-foreground"> lobt </span>
                      <span className="font-semibold">
                        {k.to_name ?? "Kollegen"}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDatum(k.created_at)}
                    </p>
                  </div>
                  <ColoredAvatar
                    name={k.to_name}
                    avatarPath={k.to_avatar}
                    size="md"
                  />
                </div>
                <p className="mt-3 whitespace-pre-wrap rounded-xl bg-[hsl(var(--brand-pink)/0.06)] px-4 py-3 text-sm leading-relaxed">
                  „{k.message}&ldquo;
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
