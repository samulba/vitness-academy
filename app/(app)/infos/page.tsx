import { CheckCheck, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requireProfile } from "@/lib/auth";
import {
  INFO_KATEGORIEN,
  type InfoKategorie,
  istValideKategorie,
  ladeAnnouncements,
  ladeReadCounts,
  ladeReadIds,
  infoStatsDieseWoche,
} from "@/lib/infos";
import { ladeStandorte } from "@/lib/standorte";
import { InfoCard } from "@/components/infos/InfoCard";
import { Composer } from "./Composer";
import { FilterSidebar } from "./FilterSidebar";
import { StatsSidebar } from "./StatsSidebar";
import { alleInfosAlsGelesen } from "./actions";

export default async function InfosPage({
  searchParams,
}: {
  searchParams: Promise<{ kategorie?: string; standort?: string }>;
}) {
  const profile = await requireProfile();
  const sp = await searchParams;
  const aktiveKategorie = istValideKategorie(sp.kategorie ?? "")
    ? (sp.kategorie as InfoKategorie)
    : null;
  const aktiverStandort = sp.standort ?? null;

  const [infos, gelesen, standorte, stats] = await Promise.all([
    ladeAnnouncements({ nurPublished: true }),
    ladeReadIds(profile.id),
    ladeStandorte(),
    infoStatsDieseWoche(),
  ]);

  // Standorte filtern (nur die, die existieren — name als Lookup)
  const standortById = new Map(standorte.map((s) => [s.id, s.name]));

  // Kategorien-Counts (auf Standort-Filter berücksichtigt)
  const standortGefiltert = aktiverStandort
    ? infos.filter(
        (i) => i.location_id === aktiverStandort || i.location_id === null,
      )
    : infos;

  const kategorienListe = INFO_KATEGORIEN.map((k) => ({
    value: k.value,
    label: k.label,
    count: standortGefiltert.filter((i) => i.category === k.value).length,
  }));

  // Sichtbar = Standort + Kategorie gefiltert
  const sichtbar = standortGefiltert.filter(
    (i) => !aktiveKategorie || i.category === aktiveKategorie,
  );

  // Read-Counts laden für die sichtbaren Karten
  const readCounts = await ladeReadCounts(sichtbar.map((s) => s.id));
  const ungelesenAnzahl = infos.filter((i) => !gelesen.has(i.id)).length;

  // Angepinnt für rechte Sidebar
  const angepinnt = infos.filter((i) => i.pinned);

  const vorname = profile.first_name ?? profile.full_name?.split(" ")[0] ?? null;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)_300px] md:grid-cols-[minmax(0,1fr)_300px]">
        {/* Linke Sidebar — Filter (nur lg+) */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <FilterSidebar
              kategorien={kategorienListe}
              gesamt={standortGefiltert.length}
              aktiveKategorie={aktiveKategorie}
              standorte={standorte.map((s) => ({ id: s.id, name: s.name }))}
              aktiverStandort={aktiverStandort}
            />
          </div>
        </aside>

        {/* Mitte — Header, Composer, Feed */}
        <main className="min-w-0">
          <header className="mb-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">
                  Wichtige Infos
                </h1>
                <p className="mt-2 max-w-xl text-base leading-relaxed text-muted-foreground">
                  Pinnwand fürs Team. Was läuft? Was ist los?
                </p>
              </div>
              {ungelesenAnzahl > 0 && (
                <form action={alleInfosAlsGelesen}>
                  <Button
                    type="submit"
                    variant="secondary"
                    className="h-10 rounded-lg"
                  >
                    <CheckCheck className="h-4 w-4" />
                    Alle als gelesen ({ungelesenAnzahl})
                  </Button>
                </form>
              )}
            </div>
          </header>

          {/* Mobile-Filter (Filter-Pills horizontal scrollbar bei < lg) */}
          <div className="mb-5 -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 lg:hidden">
            <MobileFilterPill
              href="/infos"
              aktiv={aktiveKategorie === null}
              label={`Alle (${standortGefiltert.length})`}
            />
            {kategorienListe.map((k) => {
              if (k.count === 0 && aktiveKategorie !== k.value) return null;
              return (
                <MobileFilterPill
                  key={k.value}
                  href={`/infos?kategorie=${k.value}`}
                  aktiv={aktiveKategorie === k.value}
                  label={`${k.label} (${k.count})`}
                />
              );
            })}
          </div>

          <div className="space-y-4">
            <Composer
              fullName={profile.full_name}
              avatarPath={profile.avatar_path}
              vorname={vorname}
              standorte={standorte.map((s) => ({ id: s.id, name: s.name }))}
              defaultLocationId={profile.location_id}
            />

            {sichtbar.length === 0 ? (
              <EmptyZustand aktiveKategorie={aktiveKategorie} />
            ) : (
              sichtbar.map((i) => (
                <InfoCard
                  key={i.id}
                  info={i}
                  istGelesen={gelesen.has(i.id)}
                  istEigene={i.author_id === profile.id}
                  standortName={
                    i.location_id ? standortById.get(i.location_id) ?? null : null
                  }
                  authorAvatarPath={i.author_avatar_path}
                  readCount={readCounts.get(i.id) ?? 0}
                />
              ))
            )}
          </div>
        </main>

        {/* Rechte Sidebar — Stats (md+) */}
        <aside className="hidden md:block">
          <div className="sticky top-24">
            <StatsSidebar angepinnt={angepinnt} stats={stats} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function MobileFilterPill({
  href,
  aktiv,
  label,
}: {
  href: string;
  aktiv: boolean;
  label: string;
}) {
  return (
    <a
      href={href}
      className={
        aktiv
          ? "shrink-0 rounded-full border border-[hsl(var(--primary))] bg-[hsl(var(--primary))] px-3 py-1 text-sm font-medium text-[hsl(var(--primary-foreground))]"
          : "shrink-0 rounded-full border border-border bg-card px-3 py-1 text-sm font-medium text-muted-foreground"
      }
    >
      {label}
    </a>
  );
}

function EmptyZustand({
  aktiveKategorie,
}: {
  aktiveKategorie: InfoKategorie | null;
}) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 px-8 py-16 text-center">
      <Megaphone
        className="mb-4 h-12 w-12 text-zinc-300 dark:text-zinc-600"
        strokeWidth={1.5}
      />
      <h3 className="text-base font-semibold tracking-tight">
        {aktiveKategorie ? "Keine Infos in dieser Kategorie" : "Noch keine Infos"}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {aktiveKategorie
          ? "Schalte den Filter aus oder poste selbst etwas."
          : "Sei die erste Person, die etwas postet — der Composer oben wartet."}
      </p>
    </div>
  );
}
