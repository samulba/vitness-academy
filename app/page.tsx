import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Compass,
  FileText,
  ListChecks,
  Megaphone,
  Stethoscope,
  UserCheck,
  Wrench,
} from "lucide-react";
import { getCurrentProfile, startseiteFuerRolle } from "@/lib/auth";
import { StickyNav } from "@/components/landing/StickyNav";
import { Reveal } from "@/components/landing/Reveal";
import { AnimatedHero } from "@/components/landing/AnimatedHero";
import { PinnedNarrative } from "@/components/landing/PinnedNarrative";
import { Logo } from "@/components/brand/Logo";

export default async function RootPage() {
  const profile = await getCurrentProfile();
  if (profile) {
    redirect(startseiteFuerRolle(profile.role));
  }

  return (
    <main className="theme-dark-locked bg-[hsl(var(--brand-ink))] text-[hsl(var(--brand-cream))]">
      <StickyNav />
      <AnimatedHero />
      <PinnedNarrative />
      <Bausteine />
      <Closer />
      <Footer />
    </main>
  );
}

/* -------------------------------------------------------------------- */
/* Bausteine — bricht die Dunkelheit auf, drei klare Tiles               */
/* -------------------------------------------------------------------- */

function Bausteine() {
  return (
    <section
      id="bausteine"
      className="theme-light-locked scroll-mt-24 bg-[hsl(var(--brand-cream))] text-foreground"
    >
      <div className="mx-auto max-w-[1600px] px-6 py-24 lg:px-12 lg:py-32 2xl:px-20">
        {/* Header */}
        <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <Reveal>
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--brand-pink))]">
                Womit du arbeitest
              </p>
            </Reveal>
            <Reveal delay={120}>
              <h2 className="mt-6 text-balance font-semibold leading-[1.0] tracking-[-0.03em] text-[clamp(2.25rem,5vw,4.5rem)] sm:mt-8">
                Alles in einer App.
                <br />
                <span className="text-muted-foreground">
                  Lernen, Anfragen, Studio-Alltag.
                </span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={240}>
            <p className="max-w-md text-base leading-relaxed text-muted-foreground">
              Jedes Werkzeug ist genau dort, wo du&apos;s brauchst. Du musst
              nichts vorher verstehen — du fängst einfach an.
            </p>
          </Reveal>
        </div>

        {/* Bento Grid */}
        <div className="mt-12 grid gap-4 sm:mt-16 md:gap-6 lg:mt-20 lg:grid-cols-5">
          <Reveal className="lg:col-span-3">
            <BentoCard
              kicker="01"
              titel="Lernpfade"
              text="Pro Bereich ein Pfad. Modul für Modul. In der richtigen Reihenfolge — du kannst dich nicht verlaufen."
              icon={Compass}
              featured
            >
              <LernpfadVisual />
            </BentoCard>
          </Reveal>

          <Reveal delay={90} className="lg:col-span-2">
            <BentoCard
              kicker="02"
              titel="Mini-Quizze & Aufdeck-Karten"
              text="Direkt prüfen, ob's sitzt. Kein Drama, falsch ist falsch — Erklärung und nochmal."
              icon={ListChecks}
            >
              <QuizVisual />
            </BentoCard>
          </Reveal>

          <Reveal delay={180} className="lg:col-span-2">
            <BentoCard
              kicker="03"
              titel="Praxisfreigabe"
              text="Manche Dinge muss man am Tresen können. Studioleitung schaut zu, gibt Häkchen."
              icon={UserCheck}
            >
              <FreigabeVisual />
            </BentoCard>
          </Reveal>

          <Reveal delay={270} className="lg:col-span-3">
            <BentoCard
              kicker="04"
              titel="Handbuch"
              text="Wenn du im Alltag eine Frage hast — kurz suchen, Antwort lesen, weiter geht's."
              icon={BookOpen}
              featured
            >
              <WissenVisual />
            </BentoCard>
          </Reveal>

          <Reveal delay={360} className="lg:col-span-3">
            <BentoCard
              kicker="05"
              titel="Anfragen einreichen"
              text="Krankmeldung, Urlaub, Schicht-Tausch — direkt in der App, nichts ausdrucken, nichts vergessen."
              icon={FileText}
              featured
            >
              <AnfragenVisual />
            </BentoCard>
          </Reveal>

          <Reveal delay={450} className="lg:col-span-2">
            <BentoCard
              kicker="06"
              titel="Studio-Alltag"
              text="Aufgaben für heute, Mängel melden, wichtige Infos lesen — alles auf einer Seite."
              icon={Megaphone}
            >
              <StudioAlltagVisual />
            </BentoCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/* Bento-Card + Visuals                                                  */
/* -------------------------------------------------------------------- */

function BentoCard({
  kicker,
  titel,
  text,
  icon: Icon,
  featured,
  children,
}: {
  kicker: string;
  titel: string;
  text: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  featured?: boolean;
  children: React.ReactNode;
}) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[hsl(var(--primary))] hover:shadow-[0_24px_60px_-24px_hsl(var(--primary)/0.35)] sm:p-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="font-mono text-xs text-muted-foreground">
            {kicker}
          </span>
          <h3
            className={
              featured
                ? "mt-3 text-3xl font-semibold tracking-tight sm:text-4xl"
                : "mt-3 text-2xl font-semibold tracking-tight sm:text-3xl"
            }
          >
            {titel}
          </h3>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-[hsl(var(--brand-cream))] text-[hsl(var(--brand-pink))] transition-colors group-hover:border-[hsl(var(--primary))] group-hover:bg-[hsl(var(--primary)/0.08)]">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </span>
      </div>

      <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
        {text}
      </p>

      {/* Visual */}
      <div className="mt-8 flex-1">{children}</div>
    </article>
  );
}

function LernpfadVisual() {
  const lektionen = [
    { titel: "Begrüßung am Empfang", state: "done" as const },
    { titel: "Standard Check-in", state: "doing" as const },
    { titel: "Häufige Kundenfragen", state: "open" as const },
  ];
  return (
    <div className="rounded-xl border border-border bg-[hsl(var(--brand-cream))] p-4">
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Theke und Empfang
        </span>
        <span className="text-[10px] tabular-nums text-muted-foreground">
          11 / 16
        </span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-[hsl(var(--primary))]"
          style={{ width: "68%" }}
        />
      </div>
      <ul className="mt-4 space-y-2">
        {lektionen.map((l) => (
          <li
            key={l.titel}
            className="flex items-center gap-3 rounded-lg bg-white px-3 py-2"
          >
            <span
              className={
                l.state === "done"
                  ? "flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--success))] text-white"
                  : l.state === "doing"
                  ? "flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                  : "h-5 w-5 rounded-full border-2 border-border"
              }
            >
              {l.state === "done" && (
                <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none">
                  <path
                    d="M2 6.5l2.5 2.5L10 3.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
              {l.state === "doing" && (
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
              )}
            </span>
            <span
              className={
                l.state === "done"
                  ? "flex-1 text-sm text-muted-foreground line-through"
                  : "flex-1 text-sm font-medium"
              }
            >
              {l.titel}
            </span>
            {l.state === "doing" && (
              <span className="rounded-full border border-[hsl(var(--primary))] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[hsl(var(--primary))]">
                Jetzt
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function QuizVisual() {
  return (
    <div className="rounded-xl border-2 border-[hsl(var(--primary)/0.25)] bg-[hsl(var(--primary)/0.04)] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--brand-pink))]">
        Mini-Quiz
      </p>
      <p className="mt-1 text-sm font-semibold leading-tight">
        Welche Reaktion ist richtig?
      </p>
      <ul className="mt-3 space-y-1.5">
        <li className="flex items-center gap-2 rounded-lg border-2 border-[hsl(var(--success))] bg-[hsl(var(--success)/0.08)] px-3 py-2">
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-[hsl(var(--success))] text-white">
            <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none">
              <path
                d="M2 6.5l2.5 2.5L10 3.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="text-xs font-medium">Lächeln und Blickkontakt</span>
        </li>
        <li className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 opacity-60">
          <span className="h-4 w-4 shrink-0 rounded-sm border-2 border-muted-foreground/30" />
          <span className="text-xs font-medium">Erst Aufgabe abschließen</span>
        </li>
      </ul>
      <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-[hsl(var(--success)/0.15)] px-2.5 py-0.5 text-[10px] font-semibold text-[hsl(var(--success))]">
        Richtig!
      </div>
    </div>
  );
}

function FreigabeVisual() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 rounded-xl border-2 border-[hsl(var(--success))] bg-[hsl(var(--success)/0.08)] px-4 py-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--success))] text-white">
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
            <path
              d="M3 8.5l3.5 3.5L13 4.5"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--success))]">
            Freigegeben
          </p>
          <p className="text-sm font-semibold">Begrüßung live</p>
        </div>
      </div>
      <div className="rounded-xl bg-[hsl(var(--brand-cream))] p-3">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Notiz von Maria
        </p>
        <p className="mt-1 text-xs italic leading-relaxed">
          „Sehr ruhig und freundlich am Tresen. Top!“
        </p>
      </div>
    </div>
  );
}

function WissenVisual() {
  const ergebnisse = [
    { titel: "Karte funktioniert nicht", kat: "Theke" },
    { titel: "Reha-Anfrage aufnehmen", kat: "Reha" },
    { titel: "Beitrag pausieren", kat: "Verkauf" },
  ];
  return (
    <div className="rounded-xl border border-border bg-[hsl(var(--brand-cream))] p-4">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2">
        <svg viewBox="0 0 16 16" className="h-4 w-4 text-muted-foreground" fill="none">
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M14 14l-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span className="text-xs text-muted-foreground">Karte</span>
        <span className="ml-auto h-2 w-px animate-pulse bg-foreground/40" />
      </div>
      <ul className="mt-3 space-y-1.5">
        {ergebnisse.map((e) => (
          <li
            key={e.titel}
            className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 transition-colors hover:bg-[hsl(var(--primary)/0.04)]"
          >
            <span className="text-xs font-medium">{e.titel}</span>
            <span className="rounded-full bg-[hsl(var(--brand-pink)/0.12)] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[hsl(var(--brand-pink))]">
              {e.kat}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AnfragenVisual() {
  const items = [
    {
      titel: "Krankmeldung",
      sub: "Krank ab heute · Krankenschein folgt",
      Icon: Stethoscope,
      tint:
        "bg-[hsl(var(--destructive)/0.12)] text-[hsl(var(--destructive))]",
      status: "Eingereicht",
    },
    {
      titel: "Urlaubsantrag",
      sub: "12. – 19. Aug · 7 Tage",
      Icon: FileText,
      tint: "bg-amber-500/15 text-amber-700",
      status: "Genehmigt",
    },
  ];
  return (
    <div className="space-y-2">
      {items.map((it) => (
        <div
          key={it.titel}
          className="flex items-center gap-3 rounded-xl border border-border bg-white p-3"
        >
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${it.tint}`}
          >
            <it.Icon className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold leading-tight">
              {it.titel}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
              {it.sub}
            </p>
          </div>
          <span className="rounded-full bg-[hsl(var(--brand-pink)/0.12)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[hsl(var(--brand-pink))]">
            {it.status}
          </span>
        </div>
      ))}
    </div>
  );
}

function StudioAlltagVisual() {
  const tiles = [
    { Icon: ListChecks, label: "Aufgaben", count: 3 },
    { Icon: Wrench, label: "Mängel", count: 1 },
    { Icon: Megaphone, label: "Infos", count: 2 },
  ];
  return (
    <div className="space-y-2">
      {tiles.map((t) => (
        <div
          key={t.label}
          className="flex items-center gap-3 rounded-xl border border-border bg-white p-3"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--brand-pink)/0.12)] text-[hsl(var(--brand-pink))]">
            <t.Icon className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <span className="text-xs font-semibold">{t.label}</span>
          <span className="ml-auto rounded-full bg-[hsl(var(--primary))] px-2 py-0.5 text-[10px] font-bold text-[hsl(var(--primary-foreground))]">
            {t.count}
          </span>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Closer                                                                */
/* -------------------------------------------------------------------- */

function Closer() {
  return (
    <section
      id="studio"
      className="relative isolate scroll-mt-24 overflow-hidden bg-[hsl(var(--brand-ink))] text-[hsl(var(--brand-cream))]"
    >
      {/* Magenta-Glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-10%] h-[700px] w-[700px] rounded-full opacity-25 blur-[120px]"
        style={{
          background:
            "radial-gradient(closest-side, hsl(var(--primary)), transparent)",
        }}
      />

      {/* Watermark VITNESS */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -bottom-12 select-none overflow-hidden text-center font-semibold leading-none tracking-[-0.05em] sm:-bottom-20 lg:-bottom-32"
        style={{
          fontSize: "clamp(5rem, 22vw, 28rem)",
          color: "transparent",
          WebkitTextStroke: "1px hsl(var(--brand-cream) / 0.07)",
        }}
      >
        VITNESS
      </div>

      <div className="relative mx-auto max-w-[1600px] px-6 pt-24 lg:px-12 lg:pt-32 2xl:px-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-12">
          {/* Linke Spalte: Headline */}
          <div className="lg:col-span-8">
            <Reveal>
              <span className="inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--brand-cream)/0.55)]">
                <span className="h-px w-10 bg-[hsl(var(--primary))]" />
                PS · Bevor du loslegst
              </span>
            </Reveal>

            <Reveal delay={120}>
              <h2 className="mt-8 max-w-[16ch] text-balance font-semibold leading-[0.9] tracking-[-0.04em] text-[clamp(2.75rem,6.5vw,6.5rem)]">
                Willkommen
                <br />
                <span className="relative inline-block">
                  im Vitness-Team.
                  <span
                    aria-hidden
                    className="absolute -bottom-2 left-0 right-2 h-[6px] rounded-full bg-[hsl(var(--primary))]"
                  />
                </span>
              </h2>
            </Reveal>

            <Reveal delay={240}>
              <p className="mt-10 max-w-2xl text-pretty text-base leading-relaxed text-[hsl(var(--brand-cream)/0.7)] sm:text-lg">
                Niemand erwartet, dass du alles auf einmal kannst. Wenn
                unterwegs etwas hängt — deine Studioleitung weiß Bescheid und
                hilft jederzeit.{" "}
                <span className="text-[hsl(var(--brand-cream))]">
                  Du bist nicht allein.
                </span>
              </p>
            </Reveal>
          </div>

          {/* Rechte Spalte: Team-Card */}
          <Reveal delay={360} className="lg:col-span-4">
            <TeamCard />
          </Reveal>
        </div>

        {/* CTA */}
        <Reveal delay={480}>
          <div className="mt-16 flex flex-col items-start gap-y-6 lg:mt-20 sm:flex-row sm:items-center sm:gap-x-12">
            <Link
              href="/login"
              className="group inline-flex items-center gap-3 rounded-full bg-[hsl(var(--primary))] px-8 py-4 text-base font-semibold text-[hsl(var(--primary-foreground))] shadow-[0_25px_70px_-20px_hsl(var(--primary)/0.65)] transition-transform hover:scale-[1.03]"
            >
              Zum Login
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <p className="max-w-sm text-sm text-[hsl(var(--brand-cream)/0.55)]">
              Login-Daten kommen per E-Mail von deiner Studioleitung.
            </p>
          </div>
        </Reveal>

        {/* Spacer vor Marquee */}
        <div className="h-16 lg:h-24" />
      </div>

      {/* Marquee */}
      <div className="relative z-10 overflow-hidden border-y border-white/10 bg-[hsl(var(--brand-ink)/0.7)] py-5 backdrop-blur-sm">
        <div className="ticker flex w-max items-center gap-12 whitespace-nowrap text-sm font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-cream)/0.45)]">
          {Array.from({ length: 3 }).flatMap((_, j) =>
            [
              "Theke & Empfang",
              "Magicline",
              "Trainingsfläche",
              "Reha & Prävention",
              "Verkauf",
              "Kursplan",
              "Probetraining",
              "Beschwerdemanagement",
            ].map((item, i) => (
              <span
                key={`${j}-${i}`}
                className="flex items-center gap-12"
              >
                <span>{item}</span>
                <span className="h-1 w-1 rounded-full bg-[hsl(var(--primary))]" />
              </span>
            )),
          )}
        </div>
      </div>
    </section>
  );
}

function TeamCard() {
  const bausteine = [
    { Icon: BookOpen, label: "Theke" },
    { Icon: Compass, label: "Magicline" },
    { Icon: ListChecks, label: "Regeln" },
    { Icon: UserCheck, label: "Freigabe" },
  ];
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[hsl(var(--primary)/0.6)]" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[hsl(var(--primary))]" />
        </span>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--brand-cream)/0.55)]">
          Alles vorbereitet
        </p>
      </div>

      <div className="mt-6 flex items-center -space-x-3">
        {bausteine.map(({ Icon, label }, i) => (
          <span
            key={label}
            className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[hsl(var(--brand-ink))] text-[hsl(var(--primary-foreground))] shadow-md"
            style={{
              background: `hsl(var(--primary) / ${1 - i * 0.18})`,
              zIndex: bausteine.length - i,
            }}
            aria-label={label}
          >
            <Icon className="h-5 w-5" />
          </span>
        ))}
      </div>

      <p className="mt-6 text-sm leading-relaxed text-[hsl(var(--brand-cream)/0.7)]">
        Theke, Magicline, Studioregeln, Praxisfreigabe — dein Onboarding-Pfad
        steht schon. Du musst dir nichts selbst zusammensuchen.
      </p>

      <div className="mt-6 border-t border-white/10 pt-4">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--brand-cream)/0.4)]">
          Im Schnitt
        </p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-semibold tracking-tight text-[hsl(var(--brand-cream))]">
            10 Min
          </span>
          <span className="text-xs text-[hsl(var(--brand-cream)/0.55)]">
            pro Lektion
          </span>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Footer                                                                */
/* -------------------------------------------------------------------- */

function Footer() {
  return (
    <footer className="bg-[hsl(var(--brand-ink))] text-[hsl(var(--brand-cream)/0.55)]">
      <div className="w-full border-t border-white/10 px-6 py-6 sm:py-8 lg:px-12 lg:py-10 2xl:px-20">
        <div className="mx-auto max-w-[1600px]">
          {/* Mobile: Logo + Anmelden in einer Zeile, dann Links + Copyright */}
          <div className="flex items-center justify-between gap-4 sm:hidden">
            <div className="flex items-center gap-2 text-[hsl(var(--brand-cream))]">
              <Logo size={24} />
              <span className="text-sm font-semibold">Vitness Crew</span>
            </div>
            <Link
              href="/login"
              className="text-sm font-medium text-[hsl(var(--brand-cream)/0.8)] transition-colors hover:text-[hsl(var(--brand-cream))]"
            >
              Anmelden →
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:hidden">
            <Link
              href="/impressum"
              className="transition-colors hover:text-[hsl(var(--brand-cream))]"
            >
              Impressum
            </Link>
            <Link
              href="/datenschutz"
              className="transition-colors hover:text-[hsl(var(--brand-cream))]"
            >
              Datenschutz
            </Link>
            <span className="text-[hsl(var(--brand-cream)/0.35)]">
              © {new Date().getFullYear()} Vitness Crew
            </span>
          </div>

          {/* Desktop: alles in einer Zeile */}
          <div className="hidden flex-row items-center justify-between gap-6 sm:flex">
            <div className="flex items-center gap-2.5 text-[hsl(var(--brand-cream))]">
              <Logo size={28} />
              <span className="text-sm font-semibold">Vitness Crew</span>
            </div>
            <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
              <span>
                © {new Date().getFullYear()} Vitness · Interne Plattform
              </span>
              <Link
                href="/impressum"
                className="transition-colors hover:text-[hsl(var(--brand-cream))]"
              >
                Impressum
              </Link>
              <Link
                href="/datenschutz"
                className="transition-colors hover:text-[hsl(var(--brand-cream))]"
              >
                Datenschutz
              </Link>
            </nav>
            <Link
              href="/login"
              className="text-sm transition-colors hover:text-[hsl(var(--brand-cream))]"
            >
              Anmelden →
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
