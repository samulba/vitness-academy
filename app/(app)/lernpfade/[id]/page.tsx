import Link from "next/link";
import { notFound } from "next/navigation";
import { Award } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/ui/page-header";
import { ModulAccordion } from "@/components/lernpfad/ModulAccordion";
import { requireProfile } from "@/lib/auth";
import { ladeLernpfadFuerUser } from "@/lib/lernpfade";
import { ladeZertifikat, zertifikatErzeugenWennFertig } from "@/lib/zertifikat";
import { formatProzent } from "@/lib/format";
import { bildUrlFuerPfad } from "@/lib/storage";

export default async function LernpfadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireProfile();
  const pfad = await ladeLernpfadFuerUser(profile.id, id);

  if (!pfad) notFound();

  let zert = await ladeZertifikat(profile.id, id);
  const istFertig = pfad.gesamt > 0 && pfad.abgeschlossen === pfad.gesamt;
  if (istFertig && !zert) {
    zert = await zertifikatErzeugenWennFertig(profile.id, id);
  }

  const heroUrl = bildUrlFuerPfad(pfad.hero_image_path);

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Lernen", href: "/dashboard" },
          { label: "Lernpfade", href: "/lernpfade" },
          { label: pfad.title },
        ]}
        eyebrow="Lernpfad"
        title={pfad.title}
        description={pfad.description ?? undefined}
      />

      {heroUrl && (
        <div className="overflow-hidden rounded-xl border border-border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroUrl}
            alt=""
            className="h-44 w-full object-cover sm:h-56 lg:h-64"
          />
        </div>
      )}

      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-[hsl(var(--brand-pink)/0.08)] via-card to-card p-5 sm:p-6">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))]">
              Dein Fortschritt
            </p>
            <p className="mt-1 text-[15px] font-medium text-muted-foreground">
              {pfad.abgeschlossen} von {pfad.gesamt} Lektionen abgeschlossen
            </p>
          </div>
          <p className="text-[34px] font-bold leading-none tabular-nums text-[hsl(var(--brand-pink))] sm:text-[40px]">
            {formatProzent(pfad.prozent)}
          </p>
        </div>
        <div className="mt-4">
          <Progress value={pfad.prozent} />
        </div>
      </div>

      {istFertig && zert && (
        <Link
          href={`/zertifikate/${zert.id}`}
          target="_blank"
          className="group relative flex items-center gap-4 overflow-hidden rounded-xl border-2 border-[hsl(var(--brand-pink)/0.5)] bg-[hsl(var(--brand-pink)/0.04)] p-5 transition-all hover:-translate-y-0.5 hover:bg-[hsl(var(--brand-pink)/0.08)]"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
            <Award className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))]">
              Pfad abgeschlossen
            </p>
            <p className="mt-0.5 text-[15px] font-semibold">
              Dein Zertifikat ist bereit
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Nr. {zert.certificate_number} · zum Drucken oder Speichern
            </p>
          </div>
          <span className="rounded-md bg-[hsl(var(--primary))] px-3 py-1.5 text-[13px] font-medium text-[hsl(var(--primary-foreground))]">
            Ansehen
          </span>
        </Link>
      )}

      <section className="space-y-3">
        <header>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Inhalt
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">
            Module &amp; Lektionen
          </h2>
        </header>
        <ModulAccordion module={pfad.modules} />
      </section>
    </div>
  );
}
