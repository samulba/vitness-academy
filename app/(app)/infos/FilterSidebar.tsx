"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  CalendarClock,
  Megaphone,
  MoreHorizontal,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type InfoKategorie } from "@/lib/infos-types";

type Standort = { id: string; name: string };

const KATEGORIE_ICONS: Record<InfoKategorie, typeof Sparkles> = {
  allgemein: Megaphone,
  geraete: Wrench,
  schicht: CalendarClock,
  mitglieder: Users,
  sonstiges: MoreHorizontal,
};

type KategorieEintrag = {
  value: InfoKategorie | null;
  label: string;
  count: number;
};

export function FilterSidebar({
  kategorien,
  gesamt,
  aktiveKategorie,
  standorte,
  aktiverStandort,
}: {
  kategorien: KategorieEintrag[];
  gesamt: number;
  aktiveKategorie: InfoKategorie | null;
  standorte: Standort[];
  aktiverStandort: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string | null) {
    const sp = new URLSearchParams(searchParams.toString());
    if (value === null) sp.delete(key);
    else sp.set(key, value);
    const qs = sp.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`);
  }

  return (
    <div className="space-y-8">
      {/* Filter — Kategorien */}
      <section>
        <p className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Filter
        </p>
        <ul className="space-y-0.5">
          <li>
            <FilterButton
              aktiv={aktiveKategorie === null}
              onClick={() => setParam("kategorie", null)}
              icon={<Sparkles className="h-4 w-4" strokeWidth={1.75} />}
              label="Alle Infos"
              count={gesamt}
            />
          </li>
          {kategorien.map((k) => {
            if (!k.value) return null;
            const Icon = KATEGORIE_ICONS[k.value];
            return (
              <li key={k.value}>
                <FilterButton
                  aktiv={aktiveKategorie === k.value}
                  onClick={() => setParam("kategorie", k.value)}
                  icon={<Icon className="h-4 w-4" strokeWidth={1.75} />}
                  label={k.label}
                  count={k.count}
                />
              </li>
            );
          })}
        </ul>
      </section>

      {/* Standort-Pills */}
      {standorte.length > 1 && (
        <section>
          <p className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Standort
          </p>
          <div className="rounded-xl bg-muted/60 p-1">
            <StandortPill
              aktiv={aktiverStandort === null}
              onClick={() => setParam("standort", null)}
              label="Alle"
            />
            {standorte.map((s) => (
              <StandortPill
                key={s.id}
                aktiv={aktiverStandort === s.id}
                onClick={() => setParam("standort", s.id)}
                label={s.name}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function FilterButton({
  aktiv,
  onClick,
  icon,
  label,
  count,
}: {
  aktiv: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
        aktiv
          ? "bg-[hsl(var(--primary)/0.1)] font-medium text-[hsl(var(--primary))]"
          : "text-foreground hover:bg-muted/60",
      )}
    >
      <span
        className={cn(
          "shrink-0",
          aktiv ? "text-[hsl(var(--primary))]" : "text-muted-foreground",
        )}
      >
        {icon}
      </span>
      <span className="flex-1 truncate">{label}</span>
      <span
        className={cn(
          "tabular-nums text-xs",
          aktiv ? "text-[hsl(var(--primary))]" : "text-muted-foreground",
        )}
      >
        {count}
      </span>
    </button>
  );
}

function StandortPill({
  aktiv,
  onClick,
  label,
}: {
  aktiv: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
        aktiv
          ? "bg-card text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
