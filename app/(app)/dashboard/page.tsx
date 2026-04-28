import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckSquare,
  GraduationCap,
  HelpCircle,
  Sparkles,
  Trophy,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PfadCard } from "@/components/lernpfad/PfadCard";
import { StatusBadge } from "@/components/StatusBadge";
import { requireProfile } from "@/lib/auth";
import { ladeMeineLernpfade, offeneLektionen } from "@/lib/lernpfade";
import { formatProzent, tageszeitGruss } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

async function ladeOffenePraxis(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("user_practical_signoffs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .in("status", ["offen", "abgelehnt"]);
  return count ?? 0;
}

export default async function DashboardPage() {
  const profile = await requireProfile();
  const [pfade, anzOffenePraxis] = await Promise.all([
    ladeMeineLernpfade(profile.id),
    ladeOffenePraxis(profile.id),
  ]);

  const gesamt = pfade.reduce((s, p) => s + p.gesamt, 0);
  const abgeschlossen = pfade.reduce((s, p) => s + p.abgeschlossen, 0);
  const prozent = gesamt === 0 ? 0 : (abgeschlossen / gesamt) * 100;
  const offen = offeneLektionen(pfade, 5);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border bg-card p-6 sm:p-8">
        <div className="brand-gradient-soft absolute inset-0" />
        <div className="bg-dot-pattern absolute inset-0 opacity-50" />
        <div
          className="blob -top-20 -right-20 h-64 w-64 opacity-30"
          style={{ backgroundColor: "hsl(var(--brand-violet))" }}
        />
        <div
          className="blob bottom-0 -left-10 h-56 w-56 opacity-25"
          style={{ backgroundColor: "hsl(var(--primary))" }}
        />

        <div className="relative grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div className="space-y-3">
            <Badge
              variant="outline"
              className="gap-1 rounded-full border-primary/30 bg-card/70 px-3 py-1 text-primary backdrop-blur"
            >
              <Sparkles className="h-3 w-3" />
              Mein Dashboard
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {tageszeitGruss(profile.full_name)}!
            </h1>
            <p className="max-w-xl text-muted-foreground">
              Schön, dass du da bist. Hier siehst du auf einen Blick, wo du
              stehst und was als Nächstes ansteht.
            </p>
          </div>

          <div className="rounded-2xl border bg-card/80 p-5 backdrop-blur shadow-sm">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Gesamtfortschritt
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <div className="text-4xl font-semibold brand-text-gradient">
                {formatProzent(prozent)}
              </div>
              <div className="text-sm text-muted-foreground">
                {abgeschlossen}/{gesamt} Lektionen
              </div>
            </div>
            <div className="mt-3">
              <Progress value={prozent} />
            </div>
          </div>
        </div>
      </section>

      {/* Kennzahl-Karten */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KennzahlCard
          icon={<GraduationCap className="h-5 w-5" />}
          label="Lernpfade"
          wert={pfade.length}
          akzent="primary"
          href="/lernpfade"
        />
        <KennzahlCard
          icon={<BookOpen className="h-5 w-5" />}
          label="Offene Lektionen"
          wert={offen.length}
          akzent="violet"
        />
        <KennzahlCard
          icon={<Trophy className="h-5 w-5" />}
          label="Abgeschlossen"
          wert={abgeschlossen}
          akzent="success"
        />
        <KennzahlCard
          icon={<CheckSquare className="h-5 w-5" />}
          label="Praxis offen"
          wert={anzOffenePraxis}
          akzent="pink"
          href="/praxisfreigaben"
        />
      </section>

      {/* Lernpfade */}
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
              Dir wurden noch keine Lernpfade zugewiesen. Sprich kurz dein
              Studio-Team an.
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

      {/* Offene Lektionen */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Offene Lektionen</h2>
        {offen.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <div className="brand-gradient mx-auto flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg">
                <Trophy className="h-6 w-6" />
              </div>
              <div className="mt-3 text-sm font-medium">
                Du hast aktuell keine offenen Lektionen.
              </div>
              <div className="text-sm text-muted-foreground">Stark!</div>
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

      {/* Wissensdatenbank-Promo */}
      <Card className="overflow-hidden border-0 brand-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <HelpCircle className="h-5 w-5" />
            Wissensdatenbank
          </CardTitle>
          <CardDescription className="text-white/80">
            Schnelle Antworten für den Studio-Alltag – durchsuchbar nach
            Stichworten und Kategorien.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="secondary" className="bg-white text-primary hover:bg-white/90">
            <Link href="/wissen">
              Wissensdatenbank öffnen
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

type Akzent = "primary" | "violet" | "pink" | "success";

function KennzahlCard({
  icon,
  label,
  wert,
  akzent,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  wert: number;
  akzent: Akzent;
  href?: string;
}) {
  const akzentBg: Record<Akzent, string> = {
    primary: "bg-primary/10 text-primary",
    violet: "bg-[hsl(var(--brand-violet)/0.12)] text-[hsl(var(--brand-violet))]",
    pink: "bg-[hsl(var(--brand-pink)/0.12)] text-[hsl(var(--brand-pink))]",
    success: "bg-success/10 text-success",
  };

  const inhalt = (
    <Card className="hover-lift h-full">
      <CardContent className="flex items-center gap-4 py-5">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${akzentBg[akzent]}`}>
          {icon}
        </div>
        <div>
          <div className="text-2xl font-semibold">{wert}</div>
          <div className="text-sm text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );

  if (href) return <Link href={href}>{inhalt}</Link>;
  return inhalt;
}
