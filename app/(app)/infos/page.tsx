import Link from "next/link";
import { CheckCheck, Megaphone, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { requireProfile } from "@/lib/auth";
import {
  INFO_KATEGORIEN,
  istValideKategorie,
  ladeAnnouncements,
  ladeReadIds,
} from "@/lib/infos";
import { ladeStandorte } from "@/lib/standorte";
import { InfoCard } from "@/components/infos/InfoCard";
import { NeueInfoForm } from "./NeueInfoForm";
import { alleInfosAlsGelesen } from "./actions";

export default async function InfosPage({
  searchParams,
}: {
  searchParams: Promise<{ kategorie?: string }>;
}) {
  const profile = await requireProfile();
  const sp = await searchParams;
  const aktiveKategorie = istValideKategorie(sp.kategorie ?? "")
    ? (sp.kategorie as string)
    : null;

  const [infos, gelesen, standorte] = await Promise.all([
    ladeAnnouncements({ nurPublished: true }),
    ladeReadIds(profile.id),
    ladeStandorte(),
  ]);

  const standortById = new Map(standorte.map((s) => [s.id, s.name]));
  const sichtbar = aktiveKategorie
    ? infos.filter((i) => i.category === aktiveKategorie)
    : infos;
  const ungelesenAnzahl = infos.filter((i) => !gelesen.has(i.id)).length;
  const istLeer = infos.length === 0;

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-12 py-4">
      {/* Header */}
      <header className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Studio
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight">
              Wichtige Infos
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground">
              Pinnwand fürs Team — du kannst selbst posten. Studioleitung darf
              zusätzlich „Dringend&ldquo;-Banner setzen.
            </p>
          </div>
          {ungelesenAnzahl > 0 && (
            <form action={alleInfosAlsGelesen}>
              <Button type="submit" variant="secondary" className="h-11 rounded-lg">
                <CheckCheck className="h-4 w-4" />
                Alle als gelesen ({ungelesenAnzahl})
              </Button>
            </form>
          )}
        </div>
      </header>

      {istLeer ? (
        // Wenn gar nichts da ist: Form zentriert + Empty-State darunter
        <div className="mx-auto max-w-2xl space-y-8">
          <FormCard
            standorte={standorte.map((s) => ({ id: s.id, name: s.name }))}
            defaultLocationId={profile.location_id}
          />
          <EmptyZustand aktiveKategorie={null} />
        </div>
      ) : (
        // Mit Inhalt: 2-Spalten-Layout
        <div className="grid gap-8 lg:grid-cols-12">
          <aside className="lg:col-span-5 xl:col-span-4">
            <div className="lg:sticky lg:top-20">
              <FormCard
                standorte={standorte.map((s) => ({ id: s.id, name: s.name }))}
                defaultLocationId={profile.location_id}
              />
            </div>
          </aside>

          <section className="lg:col-span-7 xl:col-span-8">
            {/* Filter-Pills */}
            <div className="mb-6 flex flex-wrap items-center gap-1.5">
              <FilterPill
                href="/infos"
                aktiv={aktiveKategorie === null}
                label={`Alle (${infos.length})`}
              />
              {INFO_KATEGORIEN.map((k) => {
                const count = infos.filter((i) => i.category === k.value).length;
                if (count === 0 && aktiveKategorie !== k.value) return null;
                return (
                  <FilterPill
                    key={k.value}
                    href={`/infos?kategorie=${k.value}`}
                    aktiv={aktiveKategorie === k.value}
                    label={`${k.label} (${count})`}
                  />
                );
              })}
            </div>

            {sichtbar.length === 0 ? (
              <EmptyZustand aktiveKategorie={aktiveKategorie} />
            ) : (
              <ul className="space-y-4">
                {sichtbar.map((i) => (
                  <li key={i.id}>
                    <InfoCard
                      info={i}
                      istGelesen={gelesen.has(i.id)}
                      istEigene={i.author_id === profile.id}
                      standortName={
                        i.location_id ? standortById.get(i.location_id) ?? null : null
                      }
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function FormCard({
  standorte,
  defaultLocationId,
}: {
  standorte: { id: string; name: string }[];
  defaultLocationId: string | null;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--brand-pink)/0.12)] text-[hsl(var(--brand-pink))]">
          <Sparkles className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <div>
          <h2 className="text-base font-semibold tracking-tight">
            Neue Info posten
          </h2>
          <p className="text-xs text-muted-foreground">
            Sag dem Team Bescheid.
          </p>
        </div>
      </div>
      <NeueInfoForm
        standorte={standorte}
        defaultLocationId={defaultLocationId}
      />
    </div>
  );
}

function EmptyZustand({
  aktiveKategorie,
}: {
  aktiveKategorie: string | null;
}) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-8 py-16 text-center">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-background text-muted-foreground">
        <Megaphone className="h-6 w-6" strokeWidth={1.5} />
      </span>
      <h3 className="text-base font-semibold tracking-tight">
        {aktiveKategorie
          ? "Keine Infos in dieser Kategorie"
          : "Noch keine Infos"}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {aktiveKategorie
          ? "Schalte den Filter aus oder poste selbst etwas."
          : "Sei die erste Person, die etwas postet — dein Beitrag erscheint hier sofort."}
      </p>
    </div>
  );
}

function FilterPill({
  href,
  aktiv,
  label,
}: {
  href: string;
  aktiv: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        aktiv
          ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
          : "border-border bg-card text-muted-foreground hover:border-[hsl(var(--brand-pink)/0.4)] hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}
