import Link from "next/link";
import { CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex-1">
          <PageHeader
            eyebrow="Studio"
            title="Wichtige Infos"
            description='Pinnwand fürs Team — du kannst selbst posten. Studioleitung darf zusätzlich „Dringend"-Banner setzen.'
          />
        </div>
        {ungelesenAnzahl > 0 && (
          <form action={alleInfosAlsGelesen}>
            <Button type="submit" variant="secondary">
              <CheckCheck />
              Alle als gelesen ({ungelesenAnzahl})
            </Button>
          </form>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Form-Spalte */}
        <section className="lg:col-span-5 xl:col-span-4">
          <div className="sticky top-20 overflow-hidden rounded-2xl border border-border bg-card">
            <header className="border-b border-border px-5 py-4">
              <h2 className="text-[14px] font-semibold tracking-tight">
                Neue Info posten
              </h2>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                Sag dem Team Bescheid — Sauna defekt? Schicht-Tausch?
                Wichtige Mitglieder-Info?
              </p>
            </header>
            <div className="p-5">
              <NeueInfoForm
                standorte={standorte.map((s) => ({ id: s.id, name: s.name }))}
                defaultLocationId={profile.location_id}
              />
            </div>
          </div>
        </section>

        {/* Listen-Spalte */}
        <section className="lg:col-span-7 xl:col-span-8">
          {/* Filter-Pills */}
          <div className="mb-4 flex flex-wrap items-center gap-1.5">
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
            <div className="rounded-xl border border-border bg-card">
              <EmptyState
                title={
                  aktiveKategorie
                    ? "Keine Infos in dieser Kategorie"
                    : "Aktuell keine Infos"
                }
                description={
                  aktiveKategorie
                    ? "Schalte den Filter aus oder poste selbst etwas."
                    : "Sei die erste Person, die etwas postet."
                }
              />
            </div>
          ) : (
            <ul className="space-y-3">
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
        "rounded-full border px-3 py-1 text-[12px] font-medium transition-colors",
        aktiv
          ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
          : "border-border bg-card text-muted-foreground hover:border-[hsl(var(--brand-pink)/0.4)] hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}
