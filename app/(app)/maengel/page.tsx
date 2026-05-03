import {
  CheckCircle2,
  Clock,
  Inbox,
  ShieldCheck,
  User,
  Wrench,
} from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { ladeMaengel, maengelStats, type Mangel, type Status } from "@/lib/maengel";
import { Composer } from "./Composer";
import { FilterSidebar } from "./FilterSidebar";
import { StatsSidebar } from "./StatsSidebar";
import { MangelCard } from "@/components/maengel/MangelCard";

type FilterValue = Status | "meine" | "alle";

function istValidFilter(v: string | undefined): v is FilterValue {
  return (
    v === "offen" ||
    v === "in_bearbeitung" ||
    v === "behoben" ||
    v === "verworfen" ||
    v === "meine" ||
    v === "alle"
  );
}

export default async function MaengelPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const profile = await requireProfile();
  const sp = await searchParams;
  const filter: FilterValue = istValidFilter(sp.filter) ? sp.filter : "alle";

  const [alle, meine, stats] = await Promise.all([
    ladeMaengel(),
    ladeMaengel({ reportedBy: profile.id }),
    maengelStats(),
  ]);

  // Counts pro Filter-Eintrag (auf alle Daten)
  const offenCount = alle.filter((m) => m.status === "offen").length;
  const inBearbeitungCount = alle.filter(
    (m) => m.status === "in_bearbeitung",
  ).length;
  const behobenCount = alle.filter((m) => m.status === "behoben").length;
  const meineCount = meine.length;

  let sichtbar: Mangel[];
  if (filter === "meine") sichtbar = meine;
  else if (filter === "alle") sichtbar = alle;
  else sichtbar = alle.filter((m) => m.status === filter);

  const eintraege = [
    { value: null, label: "Alle", count: alle.length, icon: Inbox },
    { value: "offen" as const, label: "Offen", count: offenCount, icon: Clock },
    {
      value: "in_bearbeitung" as const,
      label: "In Bearbeitung",
      count: inBearbeitungCount,
      icon: Wrench,
    },
    {
      value: "behoben" as const,
      label: "Behoben",
      count: behobenCount,
      icon: CheckCircle2,
    },
    { value: "meine" as const, label: "Von mir", count: meineCount, icon: User },
  ];

  const aktivKey = filter === "alle" ? null : filter;
  const vorname = profile.first_name ?? profile.full_name?.split(" ")[0] ?? null;
  const istLeer = sichtbar.length === 0;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)_300px] md:grid-cols-[minmax(0,1fr)_300px]">
        {/* Linke Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <FilterSidebar eintraege={eintraege} aktiv={aktivKey} />
          </div>
        </aside>

        {/* Mitte */}
        <main className="min-w-0">
          <header className="mb-6">
            <h1 className="text-3xl font-semibold tracking-tight">
              Mängel melden
            </h1>
            <p className="mt-2 max-w-xl text-base leading-relaxed text-muted-foreground">
              Defekte Geräte, kaputte Sachen, Probleme — kurz erfassen, die
              Studioleitung kümmert sich.
            </p>
          </header>

          {/* Mobile-Filter */}
          <div className="mb-5 -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 lg:hidden">
            {eintraege.map((e) => {
              const istAktiv = aktivKey === e.value;
              const href =
                e.value === null ? "/maengel" : `/maengel?filter=${e.value}`;
              return (
                <a
                  key={e.value ?? "alle"}
                  href={href}
                  className={
                    istAktiv
                      ? "shrink-0 rounded-full border border-[hsl(var(--primary))] bg-[hsl(var(--primary))] px-3 py-1 text-sm font-medium text-[hsl(var(--primary-foreground))]"
                      : "shrink-0 rounded-full border border-border bg-card px-3 py-1 text-sm font-medium text-muted-foreground"
                  }
                >
                  {e.label} ({e.count})
                </a>
              );
            })}
          </div>

          <div className="space-y-4">
            <Composer
              fullName={profile.full_name}
              avatarPath={profile.avatar_path}
              vorname={vorname}
            />

            {istLeer ? (
              <EmptyZustand filter={filter} />
            ) : (
              sichtbar.map((m) => (
                <MangelCard
                  key={m.id}
                  mangel={m}
                  istEigener={m.reported_by === profile.id}
                />
              ))
            )}
          </div>
        </main>

        {/* Rechte Sidebar */}
        <aside className="hidden md:block">
          <div className="sticky top-24">
            <StatsSidebar stats={stats} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function EmptyZustand({ filter }: { filter: FilterValue }) {
  const { titel, sub } =
    filter === "behoben"
      ? {
          titel: "Noch nichts behoben",
          sub: "Sobald Mängel behoben sind, erscheinen sie hier.",
        }
      : filter === "meine"
        ? {
            titel: "Du hast noch nichts gemeldet",
            sub: "Wenn dir was auffällt, nutze den Composer oben.",
          }
        : filter === "offen" || filter === "in_bearbeitung"
          ? {
              titel: "Keine offenen Mängel. Stark.",
              sub: "Sobald jemand etwas meldet, taucht es hier auf.",
            }
          : {
              titel: "Aktuell keine Meldungen",
              sub: "Wenn dir was auffällt, der Composer oben wartet.",
            };
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 px-8 py-16 text-center">
      <ShieldCheck
        className="mb-4 h-12 w-12 text-zinc-300 dark:text-zinc-600"
        strokeWidth={1.5}
      />
      <h3 className="text-base font-semibold tracking-tight">{titel}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{sub}</p>
    </div>
  );
}
