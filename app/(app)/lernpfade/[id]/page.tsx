import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ModulAccordion } from "@/components/lernpfad/ModulAccordion";
import { requireProfile } from "@/lib/auth";
import { ladeLernpfadFuerUser } from "@/lib/lernpfade";
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

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Module</h2>
        <ModulAccordion module={pfad.modules} />
      </section>
    </div>
  );
}
