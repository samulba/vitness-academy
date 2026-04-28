import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap, Trophy } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PfadCard } from "@/components/lernpfad/PfadCard";
import { StatusBadge } from "@/components/StatusBadge";
import { requireProfile } from "@/lib/auth";
import { ladeMeineLernpfade, offeneLektionen } from "@/lib/lernpfade";
import { formatProzent } from "@/lib/format";

export default async function DashboardPage() {
  const profile = await requireProfile();
  const pfade = await ladeMeineLernpfade(profile.id);

  const gesamt = pfade.reduce((s, p) => s + p.gesamt, 0);
  const abgeschlossen = pfade.reduce((s, p) => s + p.abgeschlossen, 0);
  const prozent = gesamt === 0 ? 0 : (abgeschlossen / gesamt) * 100;
  const offen = offeneLektionen(pfade, 5);
  const vorname = profile.full_name?.split(" ")[0] ?? "willkommen";

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <p className="text-sm text-muted-foreground">Mein Dashboard</p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Hallo, {vorname}!
        </h1>
        <p className="text-muted-foreground">
          Schön, dass du da bist. Hier siehst du, was als Nächstes ansteht.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <KennzahlCard
          icon={<GraduationCap className="h-5 w-5" />}
          label="Zugewiesene Lernpfade"
          wert={pfade.length}
        />
        <KennzahlCard
          icon={<BookOpen className="h-5 w-5" />}
          label="Lektionen gesamt"
          wert={gesamt}
        />
        <KennzahlCard
          icon={<Trophy className="h-5 w-5" />}
          label="Abgeschlossen"
          wert={abgeschlossen}
        />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Gesamtfortschritt</CardTitle>
          <CardDescription>
            Über alle dir zugewiesenen Lernpfade hinweg.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={prozent} />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              {abgeschlossen} von {gesamt} Lektionen abgeschlossen
            </span>
            <span className="font-medium text-foreground">
              {formatProzent(prozent)}
            </span>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold">Meine Lernpfade</h2>
            <p className="text-sm text-muted-foreground">
              Alle dir zugewiesenen Lernpfade auf einen Blick.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/lernpfade" className="text-primary">
              Alle ansehen
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {pfade.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              Dir wurden noch keine Lernpfade zugewiesen. Sprich dafür kurz
              dein Studio-Team an.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {pfade.map((pfad) => (
              <PfadCard
                key={pfad.id}
                id={pfad.id}
                title={pfad.title}
                description={pfad.description}
                modulAnzahl={pfad.modules.length}
                abgeschlossen={pfad.abgeschlossen}
                gesamt={pfad.gesamt}
                prozent={pfad.prozent}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Offene Lektionen</h2>
        {offen.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Du hast aktuell keine offenen Lektionen. Stark!
            </CardContent>
          </Card>
        ) : (
          <Card>
            <ul className="divide-y">
              {offen.map((eintrag) => (
                <li
                  key={eintrag.lesson_id}
                  className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/lektionen/${eintrag.lesson_id}`}
                      className="font-medium hover:text-primary"
                    >
                      {eintrag.lesson_title}
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      {eintrag.path_title} · {eintrag.module_title}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge status={eintrag.status} />
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/lektionen/${eintrag.lesson_id}`}>
                        Öffnen
                      </Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>
    </div>
  );
}

function KennzahlCard({
  icon,
  label,
  wert,
}: {
  icon: React.ReactNode;
  label: string;
  wert: number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <div className="text-2xl font-semibold">{wert}</div>
          <div className="text-sm text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
