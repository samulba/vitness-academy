import Link from "next/link";
import { Mail, Phone, Search, X } from "lucide-react";
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

  const istGefiltert = query.length > 0 || rolle.length > 0;

  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="space-y-6">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))]">
            Studio
          </p>
          <h1 className="mt-3 text-balance font-semibold leading-[1.1] tracking-[-0.025em] text-[clamp(1.875rem,3vw,2.75rem)]">
            Kontakte
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
            Wer macht was im Studio? Suche nach Name oder filter nach Rolle.
          </p>
        </div>

        {/* Suche + Filter */}
        <form action="/kontakte" className="space-y-3">
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              name="q"
              defaultValue={query}
              placeholder="Name, E-Mail, Telefon …"
              className="h-11 w-full rounded-full border border-border bg-background pl-11 pr-4 text-sm transition-colors focus:border-[hsl(var(--primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)]"
            />
            {rolle && <input type="hidden" name="rolle" value={rolle} />}
          </div>
          {rollen.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Rolle ·
              </span>
              <Link
                href={query ? `/kontakte?q=${encodeURIComponent(query)}` : "/kontakte"}
                className={
                  rolle === ""
                    ? "rounded-full border border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)] px-3 py-1 text-xs font-medium text-[hsl(var(--primary))]"
                    : "rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-[hsl(var(--primary))] hover:text-foreground"
                }
              >
                Alle
              </Link>
              {rollen.map((r) => {
                const aktiv = r === rolle;
                const params = new URLSearchParams();
                if (query) params.set("q", query);
                if (!aktiv) params.set("rolle", r);
                const href = `/kontakte${params.toString() ? "?" + params.toString() : ""}`;
                return (
                  <Link
                    key={r}
                    href={href}
                    className={
                      aktiv
                        ? "rounded-full border border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)] px-3 py-1 text-xs font-medium text-[hsl(var(--primary))]"
                        : "rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-[hsl(var(--primary))] hover:text-foreground"
                    }
                  >
                    {r}
                  </Link>
                );
              })}
              {istGefiltert && (
                <Link
                  href="/kontakte"
                  className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                  Filter zurücksetzen
                </Link>
              )}
            </div>
          )}
        </form>
      </header>

      {/* Liste */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold tracking-tight">
            {istGefiltert ? "Gefilterte Kontakte" : "Alle Kontakte"}
          </h2>
          <span className="text-sm tabular-nums text-muted-foreground">
            {gefiltert.length}{" "}
            {gefiltert.length === 1 ? "Kontakt" : "Kontakte"}
          </span>
        </div>

        {gefiltert.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            Keine Kontakte gefunden.
          </div>
        ) : (
          <ul className="overflow-hidden rounded-2xl border border-border bg-card">
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
      </section>
    </div>
  );
}

function KontaktZeile({ k }: { k: Kontakt }) {
  const initial = (
    (k.first_name?.[0] ?? "") + (k.last_name?.[0] ?? "")
  ).toUpperCase();
  return (
    <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.12)] text-sm font-semibold text-[hsl(var(--primary))]">
        {initial || "?"}
      </span>

      <div className="min-w-0 flex-1">
        <p className="font-semibold leading-tight">{vollerName(k)}</p>
        {k.role_tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {k.role_tags.map((r) => (
              <span
                key={r}
                className="rounded-full bg-[hsl(var(--brand-pink)/0.12)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--brand-pink))]"
              >
                {r}
              </span>
            ))}
          </div>
        )}
        {k.notes && (
          <p className="mt-1 text-xs text-muted-foreground">{k.notes}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm sm:flex-nowrap">
        {k.phone && (
          <a
            href={`tel:${k.phone.replace(/\s+/g, "")}`}
            className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Phone className="h-3.5 w-3.5" />
            <span className="tabular-nums">{k.phone}</span>
          </a>
        )}
        {k.email && (
          <a
            href={`mailto:${k.email}`}
            className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Mail className="h-3.5 w-3.5" />
            <span>{k.email}</span>
          </a>
        )}
      </div>
    </div>
  );
}
