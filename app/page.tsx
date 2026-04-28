import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  GraduationCap,
  Library,
  ListChecks,
  Sparkles,
  Target,
  UserCheck,
} from "lucide-react";
import { getCurrentProfile, startseiteFuerRolle } from "@/lib/auth";
import { StickyNav } from "@/components/landing/StickyNav";
import { Reveal } from "@/components/landing/Reveal";

export default async function RootPage() {
  const profile = await getCurrentProfile();
  if (profile) {
    redirect(startseiteFuerRolle(profile.role));
  }
  return <Landingpage />;
}

function Landingpage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <StickyNav />
      <Hero />
      <Problem />
      <Loesung />
      <Features />
      <Numbers />
      <Prozess />
      <ClosingCTA />
      <Footer />
    </main>
  );
}

/* -------------------------------------------------------------------- */
/* Hero                                                                  */
/* -------------------------------------------------------------------- */

function Hero() {
  return (
    <section className="ink-section noise-overlay relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden">
      <div className="aurora absolute inset-0 -z-10" />
      <div className="bg-grid-on-ink absolute inset-0 -z-10 opacity-40" />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-4 pt-32 pb-24 text-center lg:px-8">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-[hsl(var(--brand-cream)/0.8)] backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--brand-lime))]" />
            Die interne Lernplattform für dein Studio
          </span>
        </Reveal>

        <Reveal delay={120}>
          <h1 className="display mt-8 text-5xl text-[hsl(var(--brand-cream))] sm:text-6xl md:text-7xl lg:text-8xl">
            Dein Studio,
            <br />
            <span className="lime-text-gradient">von innen verstanden.</span>
          </h1>
        </Reveal>

        <Reveal delay={240}>
          <p className="mt-8 max-w-2xl text-lg text-[hsl(var(--brand-cream)/0.75)] sm:text-xl">
            Vitness Academy macht aus jedem neuen Mitarbeiter in wenigen Wochen
            jemanden, der den Laden kennt — Theke, Trainingsfläche, Reha,
            Verkauf. Ohne Zettelwirtschaft. Ohne „frag mal die Kollegin“.
          </p>
        </Reveal>

        <Reveal delay={360}>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 rounded-full bg-[hsl(var(--brand-lime))] px-7 py-3.5 text-base font-semibold text-[hsl(var(--brand-ink))] shadow-[0_10px_40px_-10px_hsl(var(--brand-lime)/0.7)] transition-all hover:scale-[1.02] hover:bg-[hsl(var(--brand-lime)/0.9)]"
            >
              Jetzt anmelden
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#problem"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-base font-medium text-[hsl(var(--brand-cream))] backdrop-blur transition-colors hover:bg-white/10"
            >
              Mehr erfahren
            </a>
          </div>
        </Reveal>

        <Reveal delay={520}>
          <div className="mt-20 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-xs text-[hsl(var(--brand-cream)/0.55)]">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--brand-lime))]" />
              4 Rollen, eine Plattform
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--brand-teal))]" />
              100% deutschsprachig
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--brand-coral))]" />
              Standort-übergreifend
            </span>
          </div>
        </Reveal>
      </div>

      {/* Scroll-Hinweis */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-[hsl(var(--brand-cream)/0.4)]">
        <div className="flex h-10 w-6 items-start justify-center rounded-full border border-current p-1.5">
          <span className="h-2 w-1 animate-bounce rounded-full bg-current" />
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/* Problem                                                               */
/* -------------------------------------------------------------------- */

function Problem() {
  const fragen = [
    "Wer macht eigentlich den Check-in?",
    "Wie nehme ich nochmal eine Reha-Anfrage auf?",
    "Wo finde ich den aktuellen Vertrag?",
    "Was sage ich, wenn jemand den Beitrag pausieren will?",
  ];

  return (
    <section
      id="problem"
      className="relative overflow-hidden bg-background py-28 lg:py-40"
    >
      <div className="bg-dot-pattern absolute inset-0 -z-10 opacity-60" />
      <div className="mx-auto max-w-5xl px-4 lg:px-8">
        <Reveal>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[hsl(var(--brand-teal))]">
            Das kennt jedes Studio
          </p>
        </Reveal>

        <Reveal delay={120}>
          <h2 className="display text-4xl sm:text-5xl md:text-6xl">
            Neue Mitarbeiter
            <br />
            haben{" "}
            <span className="brand-text-gradient">100 offene Fragen</span> —
            <br />
            und niemand hat Zeit.
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-4 md:grid-cols-2">
          {fragen.map((frage, i) => (
            <Reveal key={frage} delay={i * 80}>
              <blockquote className="hover-lift group relative rounded-2xl border border-border bg-card p-7 text-lg font-medium text-foreground sm:text-xl">
                <span className="absolute -top-3 left-6 text-5xl font-bold text-[hsl(var(--brand-coral)/0.3)] transition-colors group-hover:text-[hsl(var(--brand-coral)/0.6)]">
                  „
                </span>
                <span className="relative">{frage}</span>
              </blockquote>
            </Reveal>
          ))}
        </div>

        <Reveal delay={300}>
          <p className="mt-12 max-w-2xl text-lg text-muted-foreground">
            Onboarding läuft heute über Zurufe, WhatsApp-Nachrichten und „der
            macht das schon irgendwie“. Das kostet Zeit, Nerven und am Ende
            Mitglieder, die schlecht beraten werden.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/* Loesung                                                               */
/* -------------------------------------------------------------------- */

function Loesung() {
  return (
    <section className="ink-section relative overflow-hidden py-28 lg:py-40">
      <div className="bg-grid-on-ink absolute inset-0 -z-10 opacity-50" />

      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <Reveal>
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[hsl(var(--brand-lime))]">
                Die Lösung
              </p>
            </Reveal>
            <Reveal delay={120}>
              <h2 className="display text-4xl text-[hsl(var(--brand-cream))] sm:text-5xl md:text-6xl">
                Ein Ort.
                <br />
                Alles, was dein
                <br />
                Team{" "}
                <span className="lime-text-gradient">wissen muss.</span>
              </h2>
            </Reveal>
            <Reveal delay={240}>
              <p className="mt-8 text-lg text-muted-on-ink">
                Vitness Academy bündelt Lernpfade, Quizze, Praxisfreigaben und
                Wissensartikel in einer schlanken Plattform. Mitarbeiter sehen,
                was als nächstes dran ist. Führungskräfte sehen, wer wo steht.
              </p>
            </Reveal>
          </div>

          <Reveal delay={200}>
            <MockupCard />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function MockupCard() {
  return (
    <div className="relative">
      <div className="brand-gradient absolute -inset-4 -z-10 rounded-[2rem] opacity-25 blur-2xl" />
      <div className="rounded-3xl border border-white/10 bg-[hsl(var(--brand-ink))]/60 p-2 shadow-2xl backdrop-blur">
        <div className="rounded-2xl bg-[hsl(var(--brand-cream))] p-6 text-foreground">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Lernpfad
              </p>
              <p className="mt-0.5 text-lg font-semibold">
                Theke und Empfang
              </p>
            </div>
            <span className="rounded-full bg-[hsl(var(--brand-lime)/0.2)] px-3 py-1 text-xs font-semibold text-[hsl(var(--primary))]">
              In Arbeit
            </span>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div className="brand-gradient h-full w-[68%] rounded-full" />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            68% abgeschlossen · 11 von 16 Lektionen
          </p>

          <ul className="mt-6 space-y-3">
            {[
              { titel: "Begrüßung am Empfang", done: true },
              { titel: "Check-in & Check-out", done: true },
              { titel: "Häufige Kundenfragen", done: false, current: true },
              { titel: "Problemlösung", done: false },
            ].map((l) => (
              <li
                key={l.titel}
                className="flex items-center gap-3 rounded-xl border border-border bg-background px-3.5 py-2.5"
              >
                <span
                  className={
                    l.done
                      ? "flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]"
                      : l.current
                      ? "flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(var(--brand-lime)/0.25)] text-[hsl(var(--primary))]"
                      : "flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground"
                  }
                >
                  {l.done ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-bold">→</span>
                  )}
                </span>
                <span
                  className={
                    l.done
                      ? "text-sm text-muted-foreground line-through"
                      : "text-sm font-medium"
                  }
                >
                  {l.titel}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Features                                                              */
/* -------------------------------------------------------------------- */

function Features() {
  const features = [
    {
      icon: Compass,
      kicker: "01 — Lernpfade",
      titel: "Strukturierte Wege durchs ganze Studio.",
      text: "Jede Rolle bekommt ihren Pfad: Theke, Trainingsfläche, Reha, Verkauf. Aufgeteilt in Module und Lektionen, die Schritt für Schritt freigeschaltet werden.",
      tag: "lime" as const,
    },
    {
      icon: ListChecks,
      kicker: "02 — Quizze",
      titel: "Wissen wird geprüft, nicht nur gelesen.",
      text: "Single- und Multiple-Choice-Fragen pro Lektion oder Modul. Bestehensgrenze frei wählbar, Wiederholung jederzeit möglich.",
      tag: "teal" as const,
    },
    {
      icon: UserCheck,
      kicker: "03 — Praxisfreigaben",
      titel: "Erst dann, wenn die Führungskraft nickt.",
      text: "Manche Dinge muss man am Tresen können, nicht nur erklären. Mitarbeiter melden sich „bereit“, die Führungskraft gibt frei oder schickt zurück.",
      tag: "coral" as const,
    },
    {
      icon: Library,
      kicker: "04 — Wissensdatenbank",
      titel: "Die eine Frage, schnell beantwortet.",
      text: "Suchbare Artikel mit Kategorien — vom Notfallplan bis zur Reinigungsroutine. Immer aktuell, immer erreichbar.",
      tag: "lime" as const,
    },
  ];

  return (
    <section
      id="features"
      className="relative overflow-hidden bg-background py-28 lg:py-40"
    >
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <Reveal>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[hsl(var(--brand-teal))]">
            Was du bekommst
          </p>
        </Reveal>
        <Reveal delay={120}>
          <h2 className="display max-w-3xl text-4xl sm:text-5xl md:text-6xl">
            Vier Bausteine, ein
            <br />
            <span className="brand-text-gradient">durchdachtes System.</span>
          </h2>
        </Reveal>

        <div className="mt-20 space-y-24 lg:space-y-32">
          {features.map((f, i) => (
            <FeatureRow key={f.kicker} {...f} flip={i % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

type Tag = "lime" | "teal" | "coral";

function FeatureRow({
  icon: Icon,
  kicker,
  titel,
  text,
  tag,
  flip,
}: {
  icon: typeof Compass;
  kicker: string;
  titel: string;
  text: string;
  tag: Tag;
  flip: boolean;
}) {
  const tagColors: Record<Tag, string> = {
    lime: "bg-[hsl(var(--brand-lime)/0.18)] text-[hsl(var(--primary))] border-[hsl(var(--brand-lime)/0.4)]",
    teal: "bg-[hsl(var(--brand-teal)/0.12)] text-[hsl(var(--brand-teal))] border-[hsl(var(--brand-teal)/0.3)]",
    coral:
      "bg-[hsl(var(--brand-coral)/0.12)] text-[hsl(var(--brand-coral))] border-[hsl(var(--brand-coral)/0.3)]",
  };

  const visualGradient: Record<Tag, string> = {
    lime: "from-[hsl(var(--brand-lime))] via-[hsl(var(--brand-teal))] to-[hsl(var(--primary))]",
    teal: "from-[hsl(var(--brand-teal))] via-[hsl(var(--primary))] to-[hsl(var(--brand-ink))]",
    coral:
      "from-[hsl(var(--brand-coral))] via-[hsl(var(--brand-lime))] to-[hsl(var(--brand-teal))]",
  };

  return (
    <div
      className={`grid items-center gap-12 lg:grid-cols-2 lg:gap-20 ${
        flip ? "lg:[&>*:first-child]:order-2" : ""
      }`}
    >
      <div>
        <Reveal>
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${tagColors[tag]}`}
          >
            <Icon className="h-3.5 w-3.5" />
            {kicker}
          </span>
        </Reveal>
        <Reveal delay={120}>
          <h3 className="display mt-5 text-3xl sm:text-4xl md:text-5xl">
            {titel}
          </h3>
        </Reveal>
        <Reveal delay={240}>
          <p className="mt-6 max-w-lg text-lg text-muted-foreground">{text}</p>
        </Reveal>
      </div>

      <Reveal delay={180}>
        <div className="relative aspect-[5/4] w-full overflow-hidden rounded-3xl border border-border shadow-xl">
          <div
            className={`absolute inset-0 bg-gradient-to-br ${visualGradient[tag]}`}
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(0_0%_100%/0.25),_transparent_60%)]" />
          <Icon className="absolute right-8 bottom-8 h-32 w-32 text-white/30" />
          <div className="absolute left-8 top-8 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
            {kicker.split(" — ")[1]}
          </div>
        </div>
      </Reveal>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Numbers                                                               */
/* -------------------------------------------------------------------- */

function Numbers() {
  const stats = [
    { wert: "7+", label: "Lernpfade" },
    { wert: "30+", label: "Lektionen" },
    { wert: "4", label: "Rollen" },
    { wert: "100%", label: "Deutsch" },
  ];

  return (
    <section className="ink-section relative overflow-hidden py-28 lg:py-40">
      <div className="bg-grid-on-ink absolute inset-0 -z-10 opacity-50" />
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <Reveal>
          <h2 className="display max-w-3xl text-4xl text-[hsl(var(--brand-cream))] sm:text-5xl md:text-6xl">
            Klein gestartet —
            <br />
            <span className="lime-text-gradient">groß gedacht.</span>
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 100}>
              <div className="border-t border-white/15 pt-6">
                <p className="display text-6xl text-[hsl(var(--brand-lime))] sm:text-7xl">
                  {s.wert}
                </p>
                <p className="mt-3 text-sm font-medium uppercase tracking-wider text-[hsl(var(--brand-cream)/0.7)]">
                  {s.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/* Prozess                                                               */
/* -------------------------------------------------------------------- */

function Prozess() {
  const schritte = [
    {
      icon: UserCheck,
      titel: "Admin lädt dich ein",
      text: "Du bekommst eine E-Mail mit Login-Daten — Self-Signup gibt es nicht. Sicher von Tag eins an.",
    },
    {
      icon: Target,
      titel: "Lernpfade werden zugewiesen",
      text: "Je nach Rolle bekommst du genau die Pfade, die für deinen Job zählen. Keine Lehrgänge, die niemand braucht.",
    },
    {
      icon: GraduationCap,
      titel: "Du arbeitest dich durch",
      text: "Lektionen, Quizze, Praxis. In deinem Tempo, jederzeit nachlesbar. Fortschritt sichtbar fürs Team.",
    },
    {
      icon: ClipboardCheck,
      titel: "Führungskraft gibt frei",
      text: "Wenn alles sitzt, gibt deine Führungskraft Praxisaufgaben frei. Du bist offiziell startklar.",
    },
  ];

  return (
    <section
      id="prozess"
      className="relative overflow-hidden bg-background py-28 lg:py-40"
    >
      <div className="bg-dot-pattern absolute inset-0 -z-10 opacity-50" />
      <div className="mx-auto max-w-4xl px-4 lg:px-8">
        <Reveal>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[hsl(var(--brand-teal))]">
            So läuft&apos;s
          </p>
        </Reveal>
        <Reveal delay={120}>
          <h2 className="display text-4xl sm:text-5xl md:text-6xl">
            In vier Schritten
            <br />
            <span className="brand-text-gradient">vom Tag eins zur Theke.</span>
          </h2>
        </Reveal>

        <ol className="relative mt-20 space-y-12 border-l-2 border-dashed border-[hsl(var(--brand-teal)/0.3)] pl-10">
          {schritte.map((s, i) => (
            <Reveal key={s.titel} delay={i * 100}>
              <li className="relative">
                <span className="brand-gradient absolute -left-[3.4rem] flex h-12 w-12 items-center justify-center rounded-full text-[hsl(var(--brand-cream))] shadow-lg ring-4 ring-background">
                  <s.icon className="h-5 w-5" />
                </span>
                <div className="rounded-2xl border border-border bg-card p-6 hover-lift">
                  <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[hsl(var(--brand-teal))]">
                    Schritt {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="text-xl font-semibold sm:text-2xl">
                    {s.titel}
                  </h3>
                  <p className="mt-2 text-muted-foreground">{s.text}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/* Closing CTA                                                           */
/* -------------------------------------------------------------------- */

function ClosingCTA() {
  return (
    <section className="ink-section noise-overlay relative isolate overflow-hidden py-28 lg:py-40">
      <div className="aurora absolute inset-0 -z-10" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center lg:px-8">
        <Reveal>
          <h2 className="display text-5xl text-[hsl(var(--brand-cream))] sm:text-6xl md:text-7xl">
            Bereit, das Studio
            <br />
            <span className="lime-text-gradient">richtig zu kennen?</span>
          </h2>
        </Reveal>
        <Reveal delay={160}>
          <p className="mx-auto mt-8 max-w-xl text-lg text-[hsl(var(--brand-cream)/0.75)]">
            Login-Daten von der Studioleitung holen, einloggen, loslegen. Es
            dauert keine zwei Minuten.
          </p>
        </Reveal>
        <Reveal delay={280}>
          <Link
            href="/login"
            className="group mt-10 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--brand-lime))] px-8 py-4 text-lg font-semibold text-[hsl(var(--brand-ink))] shadow-[0_15px_50px_-10px_hsl(var(--brand-lime)/0.7)] transition-all hover:scale-[1.03] hover:bg-[hsl(var(--brand-lime)/0.9)]"
          >
            Zum Login
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/* Footer                                                                */
/* -------------------------------------------------------------------- */

function Footer() {
  return (
    <footer className="border-t border-border bg-background py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row lg:px-8">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <span className="brand-gradient inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-[hsl(var(--brand-ink))]">
            VA
          </span>
          Vitness Academy
        </div>
        <p>© {new Date().getFullYear()} Vitness Academy · Interne Plattform</p>
        <div className="flex items-center gap-5">
          <Link href="/login" className="hover:text-foreground">
            Anmelden
          </Link>
          <a href="#problem" className="hover:text-foreground">
            Warum
          </a>
          <a href="#features" className="hover:text-foreground">
            Features
          </a>
        </div>
      </div>
    </footer>
  );
}
