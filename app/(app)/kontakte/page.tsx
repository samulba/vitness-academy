import { Mail, Phone, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterPills } from "@/components/admin/FilterPills";
import { ColoredAvatar } from "@/components/admin/ColoredAvatar";
import { StatusPill } from "@/components/admin/StatusPill";
import {
  eindeutigeRollen,
  ladeKontakte,
  vollerName,
  type Kontakt,
} from "@/lib/kontakte";

export default async function KontaktePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; rolle?: string }>;
}) {
  const sp = await searchParams;
  const query = sp.q?.trim() ?? "";
  const rolle = sp.rolle?.trim() ?? "";

  const alle = await ladeKontakte();
  const rollen = eindeutigeRollen(alle);

  const gefiltert = alle.filter((k) => {
    if (rolle && !k.role_tags.includes(rolle)) return false;
    if (query.length > 0) {
      const text = [
        vollerName(k),
        k.email ?? "",
        k.phone ?? "",
        k.notes ?? "",
        ...k.role_tags,
      ]
        .join(" ")
        .toLowerCase();
      if (!text.includes(query.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Studio"
        title="Kontakte"
        description="Wer macht was im Studio? Suche nach Name oder filter nach Rolle."
      />

      {/* Suche */}
      <form action="/kontakte" className="space-y-3">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
          <input
            name="q"
            defaultValue={query}
            placeholder="Name, E-Mail, Telefon …"
            className="h-9 w-full rounded-md border border-border bg-background pl-8 pr-2.5 text-[13px] placeholder:text-muted-foreground/60 focus-visible:border-[hsl(var(--ring))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          {rolle && <input type="hidden" name="rolle" value={rolle} />}
        </div>
        {rollen.length > 0 && (
          <FilterPills
            items={[
              {
                href: query ? `/kontakte?q=${encodeURIComponent(query)}` : "/kontakte",
                label: "Alle",
                aktiv: rolle === "",
              },
              ...rollen.map((r) => {
                const params = new URLSearchParams();
                if (query) params.set("q", query);
                params.set("rolle", r);
                return {
                  href: `/kontakte?${params.toString()}`,
                  label: r,
                  aktiv: rolle === r,
                };
              }),
            ]}
          />
        )}
      </form>

      {/* Liste */}
      {gefiltert.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            title="Keine Kontakte gefunden"
            description="Ändere deine Suche oder setze die Filter zurück."
          />
        </div>
      ) : (
        <ul className="overflow-hidden rounded-xl border border-border bg-card">
          {gefiltert.map((k, i) => (
            <li
              key={k.id}
              className={i > 0 ? "border-t border-border" : ""}
            >
              <KontaktZeile k={k} />
            </li>
          ))}
        </ul>
      )}

      <p className="text-[11px] text-muted-foreground">
        {gefiltert.length} {gefiltert.length === 1 ? "Kontakt" : "Kontakte"}
        {alle.length !== gefiltert.length && ` von ${alle.length}`}
      </p>
    </div>
  );
}

function KontaktZeile({ k }: { k: Kontakt }) {
  return (
    <div className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-[hsl(var(--brand-pink)/0.04)] sm:flex-row sm:items-center sm:gap-5">
      <ColoredAvatar name={vollerName(k)} size="md" />

      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-medium leading-tight text-foreground">
          {vollerName(k)}
        </p>
        {k.role_tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {k.role_tags.map((r) => (
              <StatusPill key={r} ton="primary">
                {r}
              </StatusPill>
            ))}
          </div>
        )}
        {k.notes && (
          <p className="mt-1.5 text-xs text-muted-foreground">{k.notes}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs sm:flex-nowrap">
        {k.phone && (
          <a
            href={`tel:${k.phone.replace(/\s+/g, "")}`}
            className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Phone className="h-3 w-3" />
            <span className="tabular-nums">{k.phone}</span>
          </a>
        )}
        {k.email && (
          <a
            href={`mailto:${k.email}`}
            className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Mail className="h-3 w-3" />
            <span>{k.email}</span>
          </a>
        )}
      </div>
    </div>
  );
}
