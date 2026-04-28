import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Coffee,
  Compass,
  Dumbbell,
  HeartPulse,
  ListChecks,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";
import { getCurrentProfile, startseiteFuerRolle } from "@/lib/auth";
import { StickyNav } from "@/components/landing/StickyNav";
import { Reveal } from "@/components/landing/Reveal";

export default async function RootPage() {
  const profile = await getCurrentProfile();
  if (profile) {
    redirect(startseiteFuerRolle(profile.role));
  }

  return (
    <main className="bg-[hsl(var(--brand-cream))] text-foreground">
      <StickyNav />
      <Hero />
      <WorumGehtEs />
      <Bausteine />
      <Themen />
      <Loslegen />
      <Willkommen />
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
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--brand-cream)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--brand-cream)) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />
      <div
        aria-hidden
        className="absolute -top-32 right-[-10%] h-[600px] w-[600px] rounded-full opacity-25 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, hsl(var(--brand-teal)), transparent)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 pb-32 pt-40 lg:px-12 lg:pb-44 lg:pt-56">
        <Reveal>
          <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-cream)/0.55)]">
            <span className="h-1 w-6 rounded-full bg-[hsl(var(--brand-lime))]" />
            Für neue Mitglieder im Vitness-Team
          </span>
        </Reveal>

        <Reveal delay={120}>
          <h1 className="mt-8 max-w-5xl text-balance font-semibold leading-[0.98] tracking-[-0.03em] text-[clamp(2.75rem,6.5vw,6rem)]">
            Willkommen im Team.
            <br />
            <span className="relative inline-block">
              Schön, dass du da bist.
              <span
                aria-hidden
                className="absolute -bottom-2 left-0 right-0 h-1 rounded-full bg-[hsl(var(--brand-lime))]"
              />
            </span>
          </h1>
        </Reveal>

        <Reveal delay={240}>
          <p className="mt-10 max-w-2xl text-pretty text-lg leading-relaxed text-[hsl(var(--brand-cream)/0.7)] sm:text-xl">
            Hier in der Academy lernst du in deinen ersten Wochen alles, was du
            bei uns im Studio brauchst — Theke, Trainingsfläche, Reha, Verkauf.
            In deinem Tempo. Jederzeit nachlesbar.
          </p>
        </Reveal>

        <Reveal delay={360}>
          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 rounded-full bg-[hsl(var(--brand-lime))] px-6 py-3.5 text-base font-semibold text-[hsl(var(--brand-ink))] transition-transform hover:scale-[1.02]"
            >
              Jetzt anmelden
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#worum-geht-es"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--brand-cream)/0.75)] transition-colors hover:text-[hsl(var(--brand-cream))]"
            >
              Was dich hier erwartet
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/* Worum geht es?                                                        */
/* -------------------------------------------------------------------- */

function WorumGehtEs() {
  return (
    <section
      id="worum-geht-es"
      className="border-b border-border bg-[hsl(var(--brand-cream))]"
    >
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-36">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-teal))]">
                Was ist das hier?
              </p>
            </Reveal>
            <Reveal delay={120}>
              <h2 className="mt-6 text-balance font-semibold leading-[1.02] tracking-[-0.025em] text-[clamp(2rem,4vw,3.75rem)]">
                Dein Onboarding — ohne Zettelwirtschaft.
              </h2>
            </Reveal>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal delay={120}>
              <p className="text-balance text-lg leading-relaxed text-foreground sm:text-xl">
                Statt zwei Wochen hinter Kolleginnen herzulaufen, dir Notizen
                auf Klebezettel zu kritzeln und immer wieder dieselbe Frage zu
                stellen, gehst du hier strukturiert durch.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
                Alles, was du wissen musst, ist an einem Ort. Dein:e
                Studioleiter:in und das ganze Team haben das mit aufgebaut —
                damit du dich von Tag eins an sicher fühlst, wenn das erste
                Mitglied an der Theke steht.
              </p>
            </Reveal>

            <Reveal delay={360}>
              <ul className="mt-10 space-y-4 text-sm text-foreground">
                {[
                  "In deinem Tempo — keine Stoppuhr, keine Bewertung",
                  "Auf dem Handy, am Laptop, an der Theke",
                  "Jederzeit nachlesbar, auch nach Monaten noch",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[hsl(var(--success))]" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/* Drei Bausteine                                                        */
/* -------------------------------------------------------------------- */

function Bausteine() {
  const items = [
    {
      icon: Compass,
      kicker: "01",
      titel: "Lernpfade",
      text: "Pro Bereich ein Pfad — Theke, Trainingsfläche, Reha, Verkauf. In Module und Lektionen aufgeteilt, in der richtigen Reihenfolge. Du klickst dich durch, in deinem Tempo.",
    },
    {
      icon: ListChecks,
      kicker: "02",
      titel: "Mini-Quizze & Aufdeck-Karten",
      text: "Kurze Checks direkt in der Lektion. Statt nur zu lesen, prüfst du sofort: hab ich's verstanden? Bei falschen Antworten gibt's eine Erklärung — kein Drama, einfach nochmal.",
    },
    {
      icon: UserCheck,
      kicker: "03",
      titel: "Praxisfreigabe",
      text: "Manche Sachen muss man am Tresen können, nicht nur erklären. Wenn du dich bereit fühlst, meldest du dich, deine Studioleitung schaut zu und gibt frei. Dann bist du offiziell startklar.",
    },
  ];

  return (
    <section
      id="bausteine"
      className="border-b border-border bg-[hsl(var(--brand-cream))]"
    >
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-36">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start">
            <Reveal>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-teal))]">
                Wie du lernst
              </p>
            </Reveal>
            <Reveal delay={120}>
              <h2 className="mt-6 text-balance font-semibold leading-[1.02] tracking-[-0.025em] text-[clamp(2rem,4vw,3.75rem)]">
                Drei Bausteine. Mehr brauchst du nicht.
              </h2>
            </Reveal>
            <Reveal delay={240}>
              <p className="mt-8 max-w-md text-base leading-relaxed text-muted-foreground">
                Wir wollen, dass du Lust hast, durchzugehen — kein
                Frontalunterricht, keine PDFs, kein Powerpoint.
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
            <ol className="space-y-12 lg:space-y-16">
              {items.map((it, i) => (
                <Reveal key={it.titel} delay={i * 100}>
                  <li className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-t-2 border-foreground pt-6 lg:gap-x-8 lg:pt-8">
                    <span className="row-span-3 font-mono text-sm text-muted-foreground">
                      {it.kicker}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-white text-[hsl(var(--brand-teal))]">
                      <it.icon className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                      {it.titel}
                    </h3>
                    <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
                      {it.text}
                    </p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/* Themen — was du konkret lernst                                        */
/* -------------------------------------------------------------------- */

function Themen() {
  const bereiche = [
    {
      icon: Coffee,
      titel: "Theke & Empfang",
      text: "Begrüßung, Check-in im Magicline, häufige Fragen, Beschwerden professionell aufnehmen.",
    },
    {
      icon: Dumbbell,
      titel: "Trainingsfläche",
      text: "Geräteeinweisungen, Sicherheitschecks, wie du Mitglieder bei Fragen unterstützt.",
    },
    {
      icon: HeartPulse,
      titel: "Reha & Prävention",
      text: "Anfragen sauber aufnehmen, was bei Verordnungen wichtig ist, wann du an wen verweist.",
    },
    {
      icon: Users,
      titel: "Beratung & Verkauf",
      text: "Mitgliedsanfragen beantworten, Beiträge erklären, Probetraining sauber durchführen.",
    },
  ];

  return (
    <section
      id="themen"
      className="border-b border-border bg-[hsl(var(--brand-cream))]"
    >
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-36">
        <div className="max-w-3xl">
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-teal))]">
              Was du nach den ersten Wochen kannst
            </p>
          </Reveal>
          <Reveal delay={120}>
            <h2 className="mt-6 text-balance font-semibold leading-[1.02] tracking-[-0.025em] text-[clamp(2rem,4vw,3.75rem)]">
              Du wirst den Laden kennen — Bereich für Bereich.
            </h2>
          </Reveal>
        </div>

        <div className="mt-20 grid gap-x-12 gap-y-16 sm:grid-cols-2 lg:grid-cols-4">
          {bereiche.map((b, i) => (
            <Reveal key={b.titel} delay={i * 80}>
              <article>
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-[hsl(var(--brand-lime)/0.18)] text-[hsl(var(--primary))]">
                  <b.icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h3 className="mt-5 text-xl font-semibold tracking-tight">
                  {b.titel}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {b.text}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/* Loslegen                                                              */
/* -------------------------------------------------------------------- */

function Loslegen() {
  const schritte = [
    {
      titel: "Login-Daten checken",
      text: "Du hast eine E-Mail von uns mit deinem Zugang bekommen. Falls nicht: kurz bei deiner Studioleitung melden.",
    },
    {
      titel: "Anmelden",
      text: "Klick oben rechts auf „Anmelden“, E-Mail + Passwort eingeben, fertig.",
    },
    {
      titel: "Erster Lernpfad",
      text: "Auf deinem Dashboard wartet schon der erste zugewiesene Pfad. Lektion eins anklicken, loslegen.",
    },
  ];

  return (
    <section
      id="loslegen"
      className="border-b border-border bg-[hsl(var(--brand-cream))]"
    >
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-36">
        <div className="max-w-3xl">
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-teal))]">
              So fängst du an
            </p>
          </Reveal>
          <Reveal delay={120}>
            <h2 className="mt-6 text-balance font-semibold leading-[1.02] tracking-[-0.025em] text-[clamp(2rem,4vw,3.75rem)]">
              Du hast schon alles, was du brauchst.
            </h2>
          </Reveal>
        </div>

        <ol className="mt-20 grid gap-10 md:grid-cols-3">
          {schritte.map((s, i) => (
            <Reveal key={s.titel} delay={i * 100}>
              <li className="border-t-2 border-foreground pt-5">
                <span className="text-2xl font-semibold tracking-tight">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 text-xl font-semibold tracking-tight">
                  {s.titel}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {s.text}
                </p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/* Willkommen / CTA                                                      */
/* -------------------------------------------------------------------- */

function Willkommen() {
  return (
    <section className="bg-[hsl(var(--brand-ink))] text-[hsl(var(--brand-cream))]">
      <div className="mx-auto max-w-7xl px-6 py-28 lg:px-12 lg:py-40">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-end lg:gap-16">
          <div className="lg:col-span-8">
            <Reveal>
              <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-cream)/0.55)]">
                <Sparkles className="h-3 w-3 text-[hsl(var(--brand-lime))]" />
                Bevor du loslegst
              </span>
            </Reveal>
            <Reveal delay={120}>
              <h2 className="mt-6 text-balance font-semibold leading-[0.98] tracking-[-0.03em] text-[clamp(2.5rem,5vw,5rem)]">
                Willkommen bei Vitness.
                <br />
                <span className="text-[hsl(var(--brand-cream)/0.6)]">
                  Wir freuen uns, dass du da bist.
                </span>
              </h2>
            </Reveal>
          </div>
          <div className="lg:col-span-4">
            <Reveal delay={240}>
              <p className="text-base leading-relaxed text-[hsl(var(--brand-cream)/0.7)]">
                Wenn unterwegs etwas hängt: deine Studioleitung weiß Bescheid
                und hilft jederzeit. Niemand erwartet, dass du alles auf einmal
                kannst.
              </p>
              <Link
                href="/login"
                className="group mt-6 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--brand-lime))] px-6 py-3.5 text-base font-semibold text-[hsl(var(--brand-ink))] transition-transform hover:scale-[1.02]"
              >
                Jetzt anmelden
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Reveal>
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
            © {new Date().getFullYear()} Vitness · Interne Plattform
          </p>
          <Link
            href="/login"
            className="text-sm transition-colors hover:text-[hsl(var(--brand-cream))]"
          >
            Anmelden →
          </Link>
        </div>
      </div>
    </footer>
  );
}
