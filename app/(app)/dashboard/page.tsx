import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckSquare,
  GraduationCap,
  HelpCircle,
  Trophy,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
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
    <div className="space-y-12">
      {/* Hero */}
      <section className="space-y-8">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-teal))]">
              Mein Dashboard
            </p>
            <h1 className="mt-3 text-balance font-semibold leading-[1.05] tracking-[-0.025em] text-[clamp(2rem,3.5vw,3rem)]">
              {tageszeitGruss(profile.full_name)}.
            </h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
              Hier siehst du auf einen Blick, wo du stehst und was als
              Nächstes ansteht.
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-baseline justify-between">
                <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                  Gesamtfortschritt
                </p>
                <span className="text-xs text-muted-foreground">
                  {abgeschlossen} / {gesamt} Lektionen
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-5xl font-semibold tracking-tight text-foreground">
                  {formatProzent(prozent)}
                </span>
              </div>
              <div className="mt-4">
                <Progress value={prozent} />
              </div>
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
          akzent="lime"
          href="/lernpfade"
        />
        <KennzahlCard
          icon={<BookOpen className="h-5 w-5" />}
          label="Offene Lektionen"
          wert={offen.length}
          akzent="teal"
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
          akzent="coral"
          href="/praxisfreigaben"
        />
      </section>

      {/* Lernpfade */}
      <section className="space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Meine Lernpfade
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Alle dir zugewiesenen Lernpfade auf einen Blick.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/lernpfade" className="text-foreground">
              Alle ansehen
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {pfade.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
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
      <section className="space-y-5">
        <h2 className="text-2xl font-semibold tracking-tight">
          Offene Lektionen
        </h2>
        {offen.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(var(--brand-lime))] text-[hsl(var(--brand-ink))]">
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
            <ul className="divide-y divide-border">
              {offen.map((eintrag) => (
                <li
                  key={eintrag.lesson_id}
                  className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
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
      <section className="overflow-hidden rounded-2xl border border-border bg-[hsl(var(--brand-ink))] text-[hsl(var(--brand-cream))]">
        <div className="grid gap-6 p-6 sm:p-10 lg:grid-cols-12 lg:items-center lg:gap-10">
          <div className="lg:col-span-8">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-cream)/0.5)]">
              <HelpCircle className="mr-1 inline h-3 w-3" />
              Wissensdatenbank
            </p>
            <h3 className="mt-3 text-balance text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
              Schnelle Antworten für den Studio-Alltag.
            </h3>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-[hsl(var(--brand-cream)/0.7)]">
              Durchsuchbar nach Stichworten und Kategorien — vom Notfallplan
              bis zur Reinigungsroutine.
            </p>
          </div>
          <div className="lg:col-span-4 lg:text-right">
            <Link
              href="/wissen"
              className="group inline-flex items-center gap-2 rounded-full bg-[hsl(var(--brand-lime))] px-5 py-3 text-sm font-semibold text-[hsl(var(--brand-ink))] transition-transform hover:scale-[1.02]"
            >
              Wissensdatenbank öffnen
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

type Akzent = "lime" | "teal" | "coral" | "success";

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
    lime: "bg-[hsl(var(--brand-lime)/0.18)] text-[hsl(var(--primary))]",
    teal: "bg-[hsl(var(--brand-teal)/0.12)] text-[hsl(var(--brand-teal))]",
    coral: "bg-[hsl(var(--brand-coral)/0.12)] text-[hsl(var(--brand-coral))]",
    success: "bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]",
  };

  const inhalt = (
    <Card className="h-full transition-colors hover:border-foreground/20">
      <CardContent className="flex items-center gap-4 py-6">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${akzentBg[akzent]}`}
        >
          {icon}
        </div>
        <div>
          <div className="text-2xl font-semibold tracking-tight">{wert}</div>
          <div className="text-sm text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );

  if (href) return <Link href={href}>{inhalt}</Link>;
  return inhalt;
}
