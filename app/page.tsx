import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Compass,
  Library,
  ListChecks,
  UserCheck,
} from "lucide-react";
import { getCurrentProfile, startseiteFuerRolle } from "@/lib/auth";
import { StickyNav } from "@/components/landing/StickyNav";

export default async function RootPage() {
  const profile = await getCurrentProfile();
  if (profile) {
    redirect(startseiteFuerRolle(profile.role));
  }
  return <Landingpage />;
}

function Landingpage() {
  return (
    <main className="bg-[hsl(var(--brand-cream))] text-foreground">
      <StickyNav />
      <Hero />
      <Brueckenzeile />
      <Problem />
      <Loesung />
      <Features />
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
    <section className="relative isolate overflow-hidden bg-[hsl(var(--brand-ink))] text-[hsl(var(--brand-cream))]">
      {/* feines Grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--brand-cream)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--brand-cream)) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />
      {/* einzelner, ruhiger Lichtkegel oben rechts */}
      <div
        aria-hidden
        className="absolute -top-32 right-[-10%] h-[600px] w-[600px] rounded-full opacity-25 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, hsl(var(--brand-teal)), transparent)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 pb-32 pt-40 lg:px-12 lg:pb-44 lg:pt-56">
        <div className="max-w-4xl">
          <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-cream)/0.55)]">
            <span className="h-1 w-6 rounded-full bg-[hsl(var(--brand-lime))]" />
            Interne Lernplattform · Vitness Academy
          </span>

          <h1 className="mt-8 text-balance font-semibold leading-[0.98] tracking-[-0.03em] text-[clamp(2.5rem,6vw,5.5rem)]">
            Dein Studio,
            <br />
            <span className="text-[hsl(var(--brand-cream))]">
              von innen
            </span>{" "}
            <span className="relative inline-block text-[hsl(var(--brand-cream))]">
              verstanden.
              <span
                aria-hidden
                className="absolute -bottom-2 left-0 right-0 h-1 rounded-full bg-[hsl(var(--brand-lime))]"
              />
            </span>
          </h1>

          <p className="mt-10 max-w-2xl text-pretty text-lg leading-relaxed text-[hsl(var(--brand-cream)/0.7)] sm:text-xl">
            Wir machen aus jedem neuen Mitarbeiter in wenigen Wochen jemanden,
            der den Laden kennt — Theke, Trainingsfläche, Reha, Verkauf. Ohne
            Zettelwirtschaft.
          </p>

          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 rounded-full bg-[hsl(var(--brand-lime))] px-6 py-3.5 text-base font-semibold text-[hsl(var(--brand-ink))] transition-transform hover:scale-[1.02]"
            >
              Anmelden
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#problem"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--brand-cream)/0.75)] transition-colors hover:text-[hsl(var(--brand-cream))]"
            >
              Wofür das gut ist
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* ruhige Meta-Zeile unten */}
        <div className="mt-24 grid grid-cols-2 gap-8 border-t border-white/10 pt-8 text-sm text-[hsl(var(--brand-cream)/0.5)] sm:grid-cols-4 lg:mt-32">
          <MetaPunkt label="Rollen" wert="4" />
          <MetaPunkt label="Sprache" wert="100% Deutsch" />
          <MetaPunkt label="Standorte" wert="Beliebig viele" />
          <MetaPunkt label="Zugang" wert="Per Einladung" />
        </div>
      </div>
    </section>
  );
}

function MetaPunkt({ label, wert }: { label: string; wert: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.15em] text-[hsl(var(--brand-cream)/0.4)]">
        {label}
      </p>
      <p className="mt-2 text-base font-medium text-[hsl(var(--brand-cream))] sm:text-lg">
        {wert}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Brueckenzeile                                                         */
/* -------------------------------------------------------------------- */

function Brueckenzeile() {
  return (
    <section className="border-b border-border bg-[hsl(var(--brand-cream))]">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12 lg:py-20">
        <p className="max-w-3xl text-balance text-2xl font-medium leading-snug text-foreground sm:text-3xl">
          Ein Werkzeug, mit dem dein Team selbst lernen kann — und du{" "}
          <span className="text-[hsl(var(--brand-teal))]">
            jederzeit siehst
          </span>
          , wer wo steht.
        </p>
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
      className="border-b border-border bg-[hsl(var(--brand-cream))]"
    >
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-36">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-teal))]">
              Das Problem
            </p>
            <h2 className="mt-6 text-balance font-semibold leading-[1.02] tracking-[-0.025em] text-[clamp(2rem,4vw,3.75rem)]">
              Neue Mitarbeiter haben hundert offene Fragen — und niemand hat
              Zeit.
            </h2>
            <p className="mt-8 max-w-md text-base leading-relaxed text-muted-foreground">
              Onboarding läuft heute über Zurufe, WhatsApp und „der macht das
              schon irgendwie“. Das kostet Zeit, Nerven und Mitglieder, die
              schlecht beraten werden.
            </p>
          </div>

          <ul className="lg:col-span-6 lg:col-start-7">
            {fragen.map((f, i) => (
              <li
                key={f}
                className="flex items-start gap-6 border-t border-border py-6 first:border-t-0 last:border-b first:pt-0 lg:py-8"
              >
                <span className="shrink-0 pt-1 text-sm font-mono text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-balance text-xl font-medium text-foreground sm:text-2xl">
                  „{f}“
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/* Loesung mit Mockup                                                    */
/* -------------------------------------------------------------------- */

function Loesung() {
  return (
    <section className="border-b border-border bg-[hsl(var(--brand-cream))]">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-36">
        <div className="grid items-start gap-16 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-teal))]">
              Die Lösung
            </p>
            <h2 className="mt-6 text-balance font-semibold leading-[1.02] tracking-[-0.025em] text-[clamp(2rem,4vw,3.75rem)]">
              Ein Ort. Alles, was dein Team wissen muss.
            </h2>
            <p className="mt-8 max-w-md text-base leading-relaxed text-muted-foreground">
              Lernpfade, Quizze, Praxisfreigaben und eine Wissensdatenbank in
              einer schlanken Plattform. Mitarbeiter sehen, was als Nächstes
              ansteht. Führungskräfte sehen, wer wo steht.
            </p>

            <ul className="mt-10 space-y-3 text-sm text-foreground">
              {[
                "Strukturierte Lernpfade pro Rolle",
                "Bewerteter Wissens-Check pro Modul",
                "Praxisfreigabe durch Führungskraft",
                "Wissensdatenbank für den Alltag",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--brand-lime))]"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-7">
            <Mockup />
          </div>
        </div>
      </div>
    </section>
  );
}

function Mockup() {
  const lektionen = [
    { titel: "Begrüßung am Empfang", state: "abgeschlossen" as const },
    { titel: "Körpersprache & Tonfall", state: "abgeschlossen" as const },
    { titel: "Standard Check-in", state: "aktuell" as const },
    { titel: "Mitgliedskarte funktioniert nicht", state: "offen" as const },
    { titel: "Top-Fragen & -Antworten", state: "offen" as const },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-[0_30px_60px_-30px_hsl(var(--brand-ink)/0.25)]">
      {/* Browser-Anmutung */}
      <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--destructive)/0.6)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--warning)/0.7)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--success)/0.6)]" />
        </div>
        <div className="ml-3 flex-1 truncate rounded-md bg-background px-2.5 py-1 text-xs text-muted-foreground">
          academy.vitness.de/lernpfade/theke
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
              Lernpfad
            </p>
            <h3 className="mt-1 text-xl font-semibold sm:text-2xl">
              Theke und Empfang
            </h3>
          </div>
          <span className="rounded-full bg-[hsl(var(--brand-lime)/0.18)] px-3 py-1 text-xs font-semibold text-[hsl(var(--primary))]">
            In Arbeit
          </span>
        </div>

        <div className="mt-6">
          <div className="flex items-baseline justify-between text-xs text-muted-foreground">
            <span>Fortschritt</span>
            <span>11 / 16 Lektionen</span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-[hsl(var(--brand-lime))]"
              style={{ width: "68%" }}
            />
          </div>
        </div>

        <ul className="mt-7 divide-y divide-border">
          {lektionen.map((l) => (
            <li key={l.titel} className="flex items-center gap-4 py-3.5">
              <LektionMarker state={l.state} />
              <span
                className={
                  l.state === "abgeschlossen"
                    ? "flex-1 text-sm text-muted-foreground line-through"
                    : "flex-1 text-sm font-medium text-foreground"
                }
              >
                {l.titel}
              </span>
              {l.state === "aktuell" && (
                <span className="rounded-full border border-[hsl(var(--brand-teal))] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--brand-teal))]">
                  Jetzt dran
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function LektionMarker({
  state,
}: {
  state: "abgeschlossen" | "aktuell" | "offen";
}) {
  if (state === "abgeschlossen") {
    return (
      <span
        aria-hidden
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--success))] text-white"
      >
        <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" aria-hidden>
          <path
            d="M2 6.5l2.5 2.5L10 3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </span>
    );
  }
  if (state === "aktuell") {
    return (
      <span
        aria-hidden
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--brand-lime))]"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--brand-ink))]" />
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className="h-5 w-5 shrink-0 rounded-full border-2 border-border"
    />
  );
}

/* -------------------------------------------------------------------- */
/* Features                                                              */
/* -------------------------------------------------------------------- */

function Features() {
  const items = [
    {
      icon: Compass,
      titel: "Lernpfade",
      text: "Strukturierte Wege durchs ganze Studio. Pro Rolle eigene Pfade, in Module und Lektionen aufgeteilt.",
    },
    {
      icon: ListChecks,
      titel: "Quizze",
      text: "Single- oder Multiple-Choice, Bestehensgrenze frei wählbar, Wiederholung jederzeit erlaubt.",
    },
    {
      icon: UserCheck,
      titel: "Praxisfreigaben",
      text: "Manche Dinge muss man am Tresen können. Mitarbeiter melden sich „bereit“, die Führung gibt frei.",
    },
    {
      icon: Library,
      titel: "Wissensdatenbank",
      text: "Suchbare Artikel mit Kategorien — vom Notfallplan bis zur Reinigungsroutine. Immer aktuell.",
    },
  ];

  return (
    <section
      id="features"
      className="border-b border-border bg-[hsl(var(--brand-cream))]"
    >
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-36">
        <div className="max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-teal))]">
            Was drin ist
          </p>
          <h2 className="mt-6 text-balance font-semibold leading-[1.02] tracking-[-0.025em] text-[clamp(2rem,4vw,3.75rem)]">
            Vier Bausteine. Mehr braucht ihr nicht.
          </h2>
        </div>

        <div className="mt-20 grid gap-x-12 gap-y-16 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <article key={it.titel} className="relative">
              <span className="text-xs font-mono text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="mt-3 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-white text-[hsl(var(--brand-teal))]">
                <it.icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h3 className="mt-5 text-xl font-semibold tracking-tight">
                {it.titel}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {it.text}
              </p>
            </article>
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
      titel: "Du wirst eingeladen",
      text: "Admin schickt dir eine E-Mail mit Login-Daten. Self-Signup gibt es nicht — sicher von Tag eins an.",
    },
    {
      titel: "Lernpfade werden zugewiesen",
      text: "Je nach Rolle bekommst du genau die Pfade, die zählen. Keine Lehrgänge, die niemand braucht.",
    },
    {
      titel: "Du arbeitest dich durch",
      text: "Lektionen, Quizze, Praxis. In deinem Tempo, jederzeit nachlesbar. Fortschritt sichtbar.",
    },
    {
      titel: "Führungskraft gibt frei",
      text: "Wenn alles sitzt, gibt deine Führungskraft Praxisaufgaben frei. Du bist offiziell startklar.",
    },
  ];

  return (
    <section
      id="prozess"
      className="border-b border-border bg-[hsl(var(--brand-cream))]"
    >
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-36">
        <div className="max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-teal))]">
            Ablauf
          </p>
          <h2 className="mt-6 text-balance font-semibold leading-[1.02] tracking-[-0.025em] text-[clamp(2rem,4vw,3.75rem)]">
            Vier Schritte vom Tag eins zur Theke.
          </h2>
        </div>

        <ol className="mt-20 grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-4">
          {schritte.map((s, i) => (
            <li key={s.titel} className="relative">
              <div className="flex items-baseline gap-3 border-t-2 border-foreground pt-5">
                <span className="text-2xl font-semibold tracking-tight text-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-4 text-xl font-semibold tracking-tight">
                {s.titel}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {s.text}
              </p>
            </li>
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
    <section className="bg-[hsl(var(--brand-ink))] text-[hsl(var(--brand-cream))]">
      <div className="mx-auto max-w-7xl px-6 py-28 lg:px-12 lg:py-40">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-end lg:gap-16">
          <h2 className="lg:col-span-8 text-balance font-semibold leading-[0.98] tracking-[-0.03em] text-[clamp(2.5rem,5vw,5rem)]">
            Bereit, das Studio
            <br />
            richtig zu kennen?
          </h2>
          <div className="lg:col-span-4">
            <p className="text-base leading-relaxed text-[hsl(var(--brand-cream)/0.7)]">
              Login-Daten von der Studioleitung holen, einloggen, loslegen. Es
              dauert keine zwei Minuten.
            </p>
            <Link
              href="/login"
              className="group mt-6 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--brand-lime))] px-6 py-3.5 text-base font-semibold text-[hsl(var(--brand-ink))] transition-transform hover:scale-[1.02]"
            >
              Zum Login
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/* Footer                                                                */
/* -------------------------------------------------------------------- */

function Footer() {
  return (
    <footer className="bg-[hsl(var(--brand-ink))] text-[hsl(var(--brand-cream)/0.6)]">
      <div className="mx-auto max-w-7xl border-t border-white/10 px-6 py-10 lg:px-12">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5 text-[hsl(var(--brand-cream))]">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[hsl(var(--brand-lime))] text-xs font-bold text-[hsl(var(--brand-ink))]">
              VA
            </span>
            <span className="text-sm font-semibold">Vitness Academy</span>
          </div>
          <p className="text-xs">
            © {new Date().getFullYear()} Vitness Academy · Interne Plattform
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/login"
              className="transition-colors hover:text-[hsl(var(--brand-cream))]"
            >
              Anmelden
            </Link>
            <a
              href="#problem"
              className="transition-colors hover:text-[hsl(var(--brand-cream))]"
            >
              Warum
            </a>
            <a
              href="#features"
              className="transition-colors hover:text-[hsl(var(--brand-cream))]"
            >
              Features
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
