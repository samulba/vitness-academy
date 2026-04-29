import Link from "next/link";
import { notFound } from "next/navigation";
import { Award, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ModulAccordion } from "@/components/lernpfad/ModulAccordion";
import { requireProfile } from "@/lib/auth";
import { ladeLernpfadFuerUser } from "@/lib/lernpfade";
import { ladeZertifikat, zertifikatErzeugenWennFertig } from "@/lib/zertifikat";
import { formatProzent } from "@/lib/format";

export default async function LernpfadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireProfile();
  const pfad = await ladeLernpfadFuerUser(profile.id, id);

  if (!pfad) notFound();

  // Falls schon 100% (z.B. durch alte Daten) und kein Zertifikat
  // existiert, jetzt nachholen.
  let zert = await ladeZertifikat(profile.id, id);
  const istFertig = pfad.gesamt > 0 && pfad.abgeschlossen === pfad.gesamt;
  if (istFertig && !zert) {
    zert = await zertifikatErzeugenWennFertig(profile.id, id);
  }

  return (
    <div className="space-y-6">
      <Link
        href="/lernpfade"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zu meinen Lernpfaden
      </Link>

      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{pfad.title}</h1>
        {pfad.description ? (
          <p className="max-w-2xl text-muted-foreground">{pfad.description}</p>
        ) : null}
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Dein Fortschritt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={pfad.prozent} />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              {pfad.abgeschlossen} von {pfad.gesamt} Lektionen abgeschlossen
            </span>
            <span className="font-medium text-foreground">
              {formatProzent(pfad.prozent)}
            </span>
          </div>
        </CardContent>
      </Card>

      {istFertig && zert && (
        <Link
          href={`/zertifikate/${zert.id}`}
          target="_blank"
          className="group relative flex items-center gap-5 overflow-hidden rounded-2xl border-2 border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)] p-6 transition-all hover:-translate-y-0.5 hover:bg-[hsl(var(--primary)/0.08)]"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
            <Award className="h-6 w-6" />
          </span>
          <div className="flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--primary))]">
              Pfad abgeschlossen
            </p>
            <p className="mt-0.5 text-base font-semibold sm:text-lg">
              Dein Zertifikat ist bereit
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Nr. {zert.certificate_number} · zum Drucken oder Speichern
            </p>
          </div>
          <span className="rounded-full bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))]">
            Ansehen
          </span>
        </Link>
      )}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Module</h2>
        <ModulAccordion module={pfad.modules} />
      </section>
    </div>
  );
}
