"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Mail,
  Phone,
  Search,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ColoredAvatar } from "@/components/admin/ColoredAvatar";
import { vollerName, type Kontakt } from "@/lib/kontakte-types";

/**
 * Tags die als "interne Mitarbeiter-Rolle" zaehlen. Alles andere wird
 * als "Externe" klassifiziert. Bei Mehrfach-Tags reicht EIN Match
 * mit dieser Liste, damit der Kontakt unter "Team" einsortiert wird.
 */
const TEAM_TAGS = new Set([
  "Service",
  "Trainer",
  "Vertrieb",
  "Geschaeftsleitung",
  "Geschäftsleitung",
  "Verwaltung",
  "Reha",
  "Physiotherapeut",
  "Kursleitung",
  "Service Leitung",
  "Marketing-Manager",
  "Social Media Manager",
]);

type Tab = "team" | "extern" | "alle";

function istTeam(k: Kontakt): boolean {
  const tags = Array.isArray(k.role_tags) ? k.role_tags : [];
  return tags.some((t) => TEAM_TAGS.has(t));
}

/**
 * Kontaktliste mit sticky Toolbar (Tabs · Suche · Filter-Pills) und
 * Card-basierter Liste. Wird sowohl von Admin- als auch User-Sicht
 * verwendet -- der Admin-Modus zeigt zusaetzlich einen ChevronRight
 * und ein klickbares Wrapper-Layer ueber die Card, das auf die
 * Detail-Page navigiert. Im Mitarbeiter-Modus ist die Card nicht
 * klickbar; nur Phone- und Email-Chips bleiben aktive Aktionen.
 */
export function KontakteListe({
  kontakte,
  detailHrefBuilder,
}: {
  kontakte: Kontakt[];
  /** Wenn gesetzt: Card-Klick navigiert zur Detail-Page. */
  detailHrefBuilder?: (k: Kontakt) => string;
}) {
  const [tab, setTab] = useState<Tab>("team");
  const [filter, setFilter] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  // Klassifizieren: Team / Extern / (beides "alle")
  const klassifiziert = useMemo(
    () =>
      kontakte.map((k) => ({
        ...k,
        kategorie: (istTeam(k) ? "team" : "extern") as Exclude<Tab, "alle">,
      })),
    [kontakte],
  );

  const teamCount = klassifiziert.filter((k) => k.kategorie === "team").length;
  const externCount = klassifiziert.filter((k) => k.kategorie === "extern")
    .length;

  // Welche Tags sind in der aktuellen Tab-Auswahl ueberhaupt vorhanden?
  // Sortiert nach Haeufigkeit absteigend, damit die wichtigsten Pills vorne.
  const verfuegbareTags = useMemo(() => {
    const basis =
      tab === "alle"
        ? klassifiziert
        : klassifiziert.filter((k) => k.kategorie === tab);
    const map = new Map<string, number>();
    for (const k of basis) {
      const tags = Array.isArray(k.role_tags) ? k.role_tags : [];
      for (const t of tags) map.set(t, (map.get(t) ?? 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [klassifiziert, tab]);

  // Wenn Tab gewechselt wird, Filter zuruecksetzen falls Tag nicht mehr da
  function tabWechseln(neu: Tab) {
    setTab(neu);
    if (filter) {
      const drin =
        neu === "alle"
          ? klassifiziert.some((k) => k.role_tags?.includes(filter))
          : klassifiziert
              .filter((k) => k.kategorie === neu)
              .some((k) => k.role_tags?.includes(filter));
      if (!drin) setFilter(null);
    }
  }

  // Endgueltige Liste
  const gefiltert = useMemo(() => {
    let rows = klassifiziert;
    if (tab !== "alle") rows = rows.filter((k) => k.kategorie === tab);
    if (filter) rows = rows.filter((k) => k.role_tags?.includes(filter));
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      rows = rows.filter((k) => {
        const text = [
          vollerName(k),
          k.email ?? "",
          k.phone ?? "",
          k.notes ?? "",
          ...(k.role_tags ?? []),
        ]
          .join(" ")
          .toLowerCase();
        return text.includes(q);
      });
    }
    // Stabil nach Name sortieren
    return [...rows].sort((a, b) =>
      vollerName(a).localeCompare(vollerName(b), "de", { sensitivity: "base" }),
    );
  }, [klassifiziert, tab, filter, query]);

  const filterAktiv = filter !== null || query.length > 0;

  return (
    <div className="space-y-4">
      {/* Sticky Toolbar: Tabs + Suche + Filter-Pills.
          Top-Offset beachtet die mobile Topbar (h-14). Auf Desktop
          reicht top-0, da kein Topbar in den Layouts. */}
      <div className="sticky top-14 z-20 -mx-4 border-b border-border bg-background/85 px-4 pb-3 pt-3 backdrop-blur supports-[backdrop-filter]:bg-background/70 lg:top-0 lg:-mx-8 lg:px-8">
        {/* Tabs */}
        <div className="inline-flex rounded-xl border border-border bg-muted/50 p-1">
          <TabButton
            aktiv={tab === "team"}
            onClick={() => tabWechseln("team")}
            count={teamCount}
            icon={<Users className="h-3.5 w-3.5" />}
          >
            Team
          </TabButton>
          <TabButton
            aktiv={tab === "extern"}
            onClick={() => tabWechseln("extern")}
            count={externCount}
            icon={<SlidersHorizontal className="h-3.5 w-3.5" />}
          >
            Externe
          </TabButton>
          <TabButton
            aktiv={tab === "alle"}
            onClick={() => tabWechseln("alle")}
            count={klassifiziert.length}
          >
            Alle
          </TabButton>
        </div>

        {/* Suche */}
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`In ${tab === "team" ? "Team" : tab === "extern" ? "Externe" : "allen Kontakten"} suchen…`}
            className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-9 text-sm placeholder:text-muted-foreground/60 focus-visible:border-[hsl(var(--ring))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Suche zurücksetzen"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Rolle-Pills (kontextuell, horizontal scrollbar auf Mobile) */}
        {verfuegbareTags.length > 0 && (
          <div className="-mx-1 mt-3 flex gap-1.5 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <FilterPill aktiv={filter === null} onClick={() => setFilter(null)}>
              Alle Rollen
            </FilterPill>
            {verfuegbareTags.map(([tag, count]) => (
              <FilterPill
                key={tag}
                aktiv={filter === tag}
                onClick={() => setFilter(filter === tag ? null : tag)}
              >
                {tag}
                <span
                  className={cn(
                    "ml-1.5 rounded-full px-1.5 text-[10px] font-semibold tabular-nums",
                    filter === tag
                      ? "bg-[hsl(var(--primary-foreground)/0.2)] text-[hsl(var(--primary-foreground))]"
                      : "bg-muted text-muted-foreground/80",
                  )}
                >
                  {count}
                </span>
              </FilterPill>
            ))}
          </div>
        )}
      </div>

      {/* Liste */}
      {gefiltert.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <p className="text-sm font-medium text-foreground">
            Keine Kontakte gefunden
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {filterAktiv
              ? "Probier eine andere Suche oder setz die Filter zurück."
              : tab === "team"
                ? "Noch keine internen Kontakte angelegt."
                : "Noch keine externen Partner angelegt."}
          </p>
          {filterAktiv && (
            <button
              type="button"
              onClick={() => {
                setFilter(null);
                setQuery("");
              }}
              className="mt-4 inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-xs font-medium transition-colors hover:bg-muted"
            >
              <X className="h-3.5 w-3.5" />
              Filter zurücksetzen
            </button>
          )}
        </div>
      ) : (
        <ul className="overflow-hidden rounded-xl border border-border bg-card">
          {gefiltert.map((k, i) => (
            <li
              key={k.id}
              className={cn(
                "transition-colors",
                i > 0 && "border-t border-border",
              )}
            >
              <KontaktZeile
                k={k}
                detailHref={detailHrefBuilder?.(k) ?? null}
              />
            </li>
          ))}
        </ul>
      )}

      {/* Footer-Count */}
      <p className="text-[11px] text-muted-foreground">
        {gefiltert.length}{" "}
        {gefiltert.length === 1 ? "Kontakt" : "Kontakte"}
        {kontakte.length !== gefiltert.length &&
          ` von ${kontakte.length}`}
      </p>
    </div>
  );
}

function TabButton({
  aktiv,
  onClick,
  count,
  icon,
  children,
}: {
  aktiv: boolean;
  onClick: () => void;
  count: number;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors",
        aktiv
          ? "bg-card text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {children}
      <span
        className={cn(
          "ml-0.5 rounded-full px-1.5 text-[10px] font-semibold tabular-nums",
          aktiv
            ? "bg-[hsl(var(--brand-pink)/0.12)] text-[hsl(var(--brand-pink))]"
            : "bg-muted text-muted-foreground/70",
        )}
      >
        {count}
      </span>
    </button>
  );
}

function FilterPill({
  aktiv,
  onClick,
  children,
}: {
  aktiv: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-3 py-1 text-[12px] font-medium transition-all active:scale-95",
        aktiv
          ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-[0_2px_8px_-2px_hsl(var(--primary)/0.4)]"
          : "border-border bg-card text-muted-foreground hover:border-[hsl(var(--brand-pink)/0.4)] hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function KontaktZeile({
  k,
  detailHref,
}: {
  k: Kontakt;
  detailHref: string | null;
}) {
  const tags = Array.isArray(k.role_tags) ? k.role_tags : [];
  const hatPhone = Boolean(k.phone);
  const hatEmail = Boolean(k.email);

  return (
    <div className="group relative flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[hsl(var(--brand-pink)/0.04)] sm:items-center sm:gap-4 sm:px-5 sm:py-4">
      {/* Optionaler Card-Klick-Layer (oeffnet Detail). Liegt UNTER
          den Phone/Mail-Links damit tel:/mailto: den Vorrang haben. */}
      {detailHref && (
        <Link
          href={detailHref}
          aria-label={`${vollerName(k)} bearbeiten`}
          className="absolute inset-0 z-0"
        />
      )}

      <ColoredAvatar name={vollerName(k)} size="md" />

      <div className="relative z-10 min-w-0 flex-1 pointer-events-none">
        {/* Name + Rolle-Pills */}
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <p className="text-[14px] font-semibold leading-tight text-foreground">
            {vollerName(k)}
          </p>
          {tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1">
              {tags.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center rounded-full bg-[hsl(var(--brand-pink)/0.1)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--brand-pink))]"
                >
                  {t}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="text-[10px] text-muted-foreground">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Phone + Email als clickable Chips */}
        {(hatPhone || hatEmail) && (
          <div className="pointer-events-auto mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs">
            {hatPhone && (
              <a
                href={`tel:${k.phone!.replace(/\s+/g, "")}`}
                onClick={(e) => e.stopPropagation()}
                className="relative z-20 inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-[hsl(var(--brand-pink))]"
              >
                <Phone className="h-3 w-3 shrink-0" />
                <span className="tabular-nums">{k.phone}</span>
              </a>
            )}
            {hatEmail && (
              <a
                href={`mailto:${k.email!}`}
                onClick={(e) => e.stopPropagation()}
                className="relative z-20 inline-flex min-w-0 max-w-full items-center gap-1.5 text-muted-foreground transition-colors hover:text-[hsl(var(--brand-pink))]"
              >
                <Mail className="h-3 w-3 shrink-0" />
                <span className="truncate">{k.email}</span>
              </a>
            )}
          </div>
        )}
      </div>

      {/* Chevron rechts: nur wenn Card klickbar ist (Admin) */}
      {detailHref && (
        <ChevronRight className="relative z-10 hidden h-4 w-4 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-[hsl(var(--brand-pink))] sm:block" />
      )}
    </div>
  );
}
