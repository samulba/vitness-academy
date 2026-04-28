import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Compass,
  ListChecks,
  UserCheck,
} from "lucide-react";
import { getCurrentProfile, startseiteFuerRolle } from "@/lib/auth";
import { StickyNav } from "@/components/landing/StickyNav";
import { Reveal } from "@/components/landing/Reveal";
import { AnimatedHero } from "@/components/landing/AnimatedHero";
import { PinnedNarrative } from "@/components/landing/PinnedNarrative";

export default async function RootPage() {
  const profile = await getCurrentProfile();
  if (profile) {
    redirect(startseiteFuerRolle(profile.role));
  }

  return (
    <main className="bg-[hsl(var(--brand-ink))] text-foreground">
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
  const items = [
    {
      icon: Compass,
      kicker: "01",
      titel: "Lernpfade",
      text: "Pro Bereich ein Pfad. Modul für Modul. In der richtigen Reihenfolge — du kannst dich nicht verlaufen.",
    },
    {
      icon: ListChecks,
      kicker: "02",
      titel: "Quizze & Aufdeck-Karten",
      text: "Direkt in der Lektion prüfen, ob's sitzt. Falsche Antwort? Erklärung, nochmal. Kein Drama.",
    },
    {
      icon: UserCheck,
      kicker: "03",
      titel: "Praxisfreigabe",
      text: "Manche Dinge muss man am Tresen können. Studioleitung schaut zu, gibt Häkchen, du bist drin.",
    },
    {
      icon: BookOpen,
      kicker: "04",
      titel: "Wissensdatenbank",
      text: "Wenn du im Alltag eine Frage hast — kurz suchen, Antwort lesen, weiter geht's.",
    },
  ];

  return (
    <section className="bg-[hsl(var(--brand-cream))] text-foreground">
      <div className="mx-auto max-w-[1600px] px-6 py-32 lg:px-12 lg:py-48 2xl:px-20">
        <div className="max-w-3xl">
          <Reveal>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--brand-pink))]">
              Womit du arbeitest
            </p>
          </Reveal>
          <Reveal delay={120}>
            <h2 className="mt-8 text-balance font-semibold leading-[1.0] tracking-[-0.03em] text-[clamp(2.5rem,5vw,4.5rem)]">
              Vier Werkzeuge.
              <br />
              <span className="text-muted-foreground">
                Mehr brauchst du nicht.
              </span>
            </h2>
          </Reveal>
        </div>

        <div className="mt-24 grid gap-x-12 gap-y-20 md:grid-cols-2 lg:gap-y-24 xl:grid-cols-4">
          {items.map((it, i) => (
            <Reveal key={it.titel} delay={i * 90}>
              <article className="group">
                <span className="font-mono text-xs text-muted-foreground">
                  {it.kicker}
                </span>
                <div className="mt-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-white text-[hsl(var(--brand-pink))] transition-colors group-hover:border-[hsl(var(--brand-pink))]">
                  <it.icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h3 className="mt-6 text-2xl font-semibold tracking-tight">
                  {it.titel}
                </h3>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  {it.text}
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
/* Closer                                                                */
/* -------------------------------------------------------------------- */

function Closer() {
  return (
    <section className="relative isolate overflow-hidden bg-[hsl(var(--brand-ink))] text-[hsl(var(--brand-cream))]">
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 left-[-10%] h-[700px] w-[700px] rounded-full opacity-25 blur-[120px]"
        style={{
          background:
            "radial-gradient(closest-side, hsl(var(--primary)), transparent)",
        }}
      />

      <div className="relative mx-auto max-w-[1600px] px-6 py-40 lg:px-12 lg:py-56 2xl:px-20">
        <Reveal>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--brand-cream)/0.5)]">
            Bevor du loslegst
          </p>
        </Reveal>

        <Reveal delay={120}>
          <h2 className="mt-8 max-w-[18ch] text-balance font-semibold leading-[0.92] tracking-[-0.04em] text-[clamp(3rem,8vw,8rem)]">
            Willkommen
            <br />
            <span className="relative inline-block">
              im Team.
              <span
                aria-hidden
                className="absolute -bottom-3 left-0 right-2 h-[6px] rounded-full bg-[hsl(var(--primary))]"
              />
            </span>
          </h2>
        </Reveal>

        <Reveal delay={240}>
          <p className="mt-14 max-w-2xl text-pretty text-lg leading-relaxed text-[hsl(var(--brand-cream)/0.7)] sm:text-xl">
            Niemand erwartet, dass du alles auf einmal kannst. Wenn unterwegs
            etwas hängt — deine Studioleitung weiß Bescheid und hilft jederzeit.
          </p>
        </Reveal>

        <Reveal delay={360}>
          <div className="mt-16 flex flex-col items-start gap-y-8 sm:flex-row sm:items-center sm:gap-x-16">
            <Link
              href="/login"
              className="group inline-flex items-center gap-3 rounded-full bg-[hsl(var(--primary))] px-8 py-4 text-base font-semibold text-[hsl(var(--primary-foreground))] transition-transform hover:scale-[1.02]"
            >
              Zum Login
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <p className="max-w-sm text-sm text-[hsl(var(--brand-cream)/0.5)]">
              Login-Daten kommen per E-Mail von deiner Studioleitung.
            </p>
          </div>
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
    <footer className="bg-[hsl(var(--brand-ink))] text-[hsl(var(--brand-cream)/0.55)]">
      <div className="w-full border-t border-white/10 px-6 py-10 lg:px-12 2xl:px-20">
        <div className="mx-auto flex max-w-[1600px] flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5 text-[hsl(var(--brand-cream))]">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[hsl(var(--primary))] text-xs font-bold text-[hsl(var(--primary-foreground))]">
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
