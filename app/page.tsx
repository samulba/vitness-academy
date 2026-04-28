import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  HelpCircle,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCurrentProfile, startseiteFuerRolle } from "@/lib/auth";

export default async function RootPage() {
  const profile = await getCurrentProfile();
  if (profile) {
    redirect(startseiteFuerRolle(profile.role));
  }
  return <Landingpage />;
}

function Landingpage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* dekorative Blobs */}
      <div
        className="blob -top-40 -right-32 h-96 w-96"
        style={{ backgroundColor: "hsl(var(--brand-violet))" }}
      />
      <div
        className="blob top-1/3 -left-24 h-80 w-80"
        style={{ backgroundColor: "hsl(var(--primary))" }}
      />
      <div
        className="blob bottom-0 right-0 h-72 w-72"
        style={{ backgroundColor: "hsl(var(--brand-pink))" }}
      />

      <Topbar />
      <Hero />
      <Stats />
      <Features />
      <SoLaeuftEs />
      <CTA />
      <Footer />
    </div>
  );
}

function Topbar() {
  return (
    <header className="relative z-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="brand-gradient inline-flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold text-white shadow-lg">
            VA
          </span>
          <span>Vitness Academy</span>
        </Link>
        <Button asChild>
          <Link href="/login">
            Anmelden
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative z-10">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 lg:grid-cols-[1.1fr_1fr] lg:px-8 lg:py-24">
        <div className="space-y-6">
          <Badge
            variant="outline"
            className="gap-1 rounded-full border-primary/30 bg-primary/5 px-3 py-1 text-primary"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Interne Schulungsplattform
          </Badge>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl lg:text-6xl">
            Lerne dein Studio{" "}
            <span className="brand-text-gradient">in &amp; auswendig.</span>
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Onboarding, Magicline, Theke, Reha, Verkauf, Notfälle – alles an
            einem Ort. Lernpfade, Quizze, Praxisfreigaben und eine
            Wissensdatenbank für dein Team.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="brand-gradient text-white shadow-lg">
              <Link href="/login">
                Jetzt anmelden
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <span className="text-sm text-muted-foreground">
              Zugang nur für Mitarbeiter:innen
            </span>
          </div>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative">
      <div className="absolute inset-0 brand-gradient-soft rounded-3xl" />
      <div className="relative grid grid-cols-2 gap-3 p-3">
        <MiniKarte
          icon={<GraduationCap className="h-4 w-4" />}
          titel="Theke und Empfang"
          unterzeile="4 Module · 6 Lektionen"
          fortschritt={66}
          akzent="primary"
        />
        <MiniKarte
          icon={<HelpCircle className="h-4 w-4" />}
          titel="Quiz: Begrüßung"
          unterzeile="3 Fragen · 80% zum Bestehen"
          badge="Bestanden"
          akzent="violet"
        />
        <MiniKarte
          icon={<CheckCircle2 className="h-4 w-4" />}
          titel="Check-in Praxis"
          unterzeile="Wartet auf Freigabe"
          badge="Bereit"
          akzent="pink"
        />
        <MiniKarte
          icon={<BookOpen className="h-4 w-4" />}
          titel="Mitgliedskarte defekt?"
          unterzeile="Wissensartikel · Theke"
          akzent="cyan"
        />
      </div>
    </div>
  );
}

function MiniKarte({
  icon,
  titel,
  unterzeile,
  fortschritt,
  badge,
  akzent,
}: {
  icon: React.ReactNode;
  titel: string;
  unterzeile: string;
  fortschritt?: number;
  badge?: string;
  akzent: "primary" | "violet" | "pink" | "cyan";
}) {
  const akzentBg: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    violet: "bg-[hsl(var(--brand-violet)/0.12)] text-[hsl(var(--brand-violet))]",
    pink: "bg-[hsl(var(--brand-pink)/0.12)] text-[hsl(var(--brand-pink))]",
    cyan: "bg-[hsl(var(--brand-cyan)/0.14)] text-[hsl(var(--brand-cyan))]",
  };
  return (
    <div className="glow-card rounded-2xl border bg-card p-4 backdrop-blur">
      <div className="flex items-start justify-between gap-2">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${akzentBg[akzent]}`}>
          {icon}
        </div>
        {badge ? (
          <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-success">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="mt-3 text-sm font-medium leading-tight">{titel}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{unterzeile}</div>
      {typeof fortschritt === "number" ? (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full brand-gradient"
            style={{ width: `${fortschritt}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}

function Stats() {
  const stats = [
    { wert: "7+", label: "Lernpfade" },
    { wert: "30+", label: "Lektionen" },
    { wert: "4", label: "Rollen" },
    { wert: "100%", label: "auf Deutsch" },
  ];
  return (
    <section className="relative z-10">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="grid grid-cols-2 gap-4 rounded-2xl border bg-card/80 p-6 backdrop-blur sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-semibold brand-text-gradient sm:text-3xl">
                {s.wert}
              </div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: <GraduationCap className="h-5 w-5" />,
      titel: "Lernpfade & Lektionen",
      text: "Strukturierte Pfade mit Modulen, Lektionen und Inhalts-Blöcken – Markdown, Checklisten, Hinweise und Videos.",
      akzent: "primary",
    },
    {
      icon: <HelpCircle className="h-5 w-5" />,
      titel: "Quizze",
      text: "Single & Multiple Choice. Konfigurierbare Bestehensgrenze, automatische Auswertung und beliebige Wiederholung.",
      akzent: "violet",
    },
    {
      icon: <CheckCircle2 className="h-5 w-5" />,
      titel: "Praxisfreigaben",
      text: "Mitarbeiter melden sich praktisch bereit, Führungskraft entscheidet mit Notiz. Sauber dokumentiert.",
      akzent: "pink",
    },
    {
      icon: <BookOpen className="h-5 w-5" />,
      titel: "Wissensdatenbank",
      text: "Schnelle Antworten für den Studio-Alltag. Suchbar, kategorisiert und im Markdown-Format.",
      akzent: "cyan",
    },
    {
      icon: <Users className="h-5 w-5" />,
      titel: "Rollen",
      text: "Mitarbeiter, Führungskraft, Admin und Superadmin. Zugriff über Row-Level-Security klar getrennt.",
      akzent: "primary",
    },
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      titel: "Sauber & sicher",
      text: "Supabase Auth + RLS. Mitarbeiter sehen nur eigene Fortschritte, Admins behalten den Überblick.",
      akzent: "violet",
    },
  ];

  const akzentBg: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    violet: "bg-[hsl(var(--brand-violet)/0.12)] text-[hsl(var(--brand-violet))]",
    pink: "bg-[hsl(var(--brand-pink)/0.12)] text-[hsl(var(--brand-pink))]",
    cyan: "bg-[hsl(var(--brand-cyan)/0.14)] text-[hsl(var(--brand-cyan))]",
  };

  return (
    <section className="relative z-10">
      <div className="mx-auto max-w-6xl px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Alles, was dein Team zum Lernen braucht
          </h2>
          <p className="mt-3 text-muted-foreground">
            Von der ersten Schicht bis zur Reha-Beratung – die Academy wächst
            mit deinem Studio.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.titel}
              className="hover-lift rounded-2xl border bg-card p-6"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${akzentBg[f.akzent]}`}>
                {f.icon}
              </div>
              <h3 className="mt-4 text-lg font-semibold">{f.titel}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {f.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SoLaeuftEs() {
  const schritte = [
    {
      nr: "01",
      titel: "Lernpfad öffnen",
      text: "Eingeloggt sieht jeder Mitarbeiter genau die Pfade, die ihm zugewiesen sind.",
    },
    {
      nr: "02",
      titel: "Lektionen durcharbeiten",
      text: "Markdown, Checklisten, Hinweise – als abgeschlossen markieren und weiter.",
    },
    {
      nr: "03",
      titel: "Quiz bestehen",
      text: "Wissen testen, automatisch auswerten lassen, beliebig oft wiederholen.",
    },
    {
      nr: "04",
      titel: "Praxis freigeben",
      text: "In der Schicht zeigen, Führungskraft gibt frei – fertig.",
    },
  ];

  return (
    <section className="relative z-10">
      <div className="mx-auto max-w-6xl px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            So läuft das Lernen
          </h2>
          <p className="mt-3 text-muted-foreground">
            In vier Schritten von Theorie zu sicherer Praxis.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {schritte.map((s) => (
            <div
              key={s.nr}
              className="relative rounded-2xl border bg-card p-6"
            >
              <div className="brand-text-gradient text-3xl font-bold">
                {s.nr}
              </div>
              <h3 className="mt-2 text-lg font-semibold">{s.titel}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="relative z-10">
      <div className="mx-auto max-w-6xl px-4 pb-20 lg:px-8">
        <div className="brand-gradient relative overflow-hidden rounded-3xl px-8 py-14 text-center text-white shadow-2xl">
          <div className="bg-dot-pattern absolute inset-0 opacity-20" />
          <div className="relative space-y-5">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Bereit, dein Studio richtig kennenzulernen?
            </h2>
            <p className="mx-auto max-w-xl text-white/80">
              Melde dich mit deinen Studio-Zugangsdaten an und starte deinen
              ersten Lernpfad.
            </p>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90"
            >
              <Link href="/login">
                Zum Login
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative z-10 border-t bg-card/40 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground lg:px-8">
        <div className="flex items-center gap-2">
          <span className="brand-gradient inline-flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold text-white">
            VA
          </span>
          <span>Vitness Academy</span>
        </div>
        <div>Interne Schulungsplattform · Made with Care</div>
      </div>
    </footer>
  );
}
