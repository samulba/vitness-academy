"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Sparkles } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

type Phase = {
  marker: string;
  ueber: string;
  headline: string;
  body: string;
  visual: "login" | "lektion" | "quiz" | "freigabe";
};

const PHASEN: Phase[] = [
  {
    marker: "Tag 1",
    ueber: "Du kommst rein",
    headline: "Erste Anmeldung. Erste Lernpfade.",
    body: "Kein Stapel Papier, kein „frag mal die Kollegin“. Du loggst dich ein, dein Studio hat dir die richtigen Pfade schon zugewiesen — Theke und Empfang, Magicline-Basics, Studioregeln.",
    visual: "login",
  },
  {
    marker: "Tag 5",
    ueber: "Erstes echtes Mitglied",
    headline: "An der Theke. Du weißt, was zu tun ist.",
    body: "Begrüßung, Check-in, häufige Fragen — das hast du in den letzten Tagen Lektion für Lektion durchgearbeitet. Und wenn doch was unklar ist: zwei Klicks, du findest die Antwort.",
    visual: "lektion",
  },
  {
    marker: "Woche 2",
    ueber: "Wissen sitzt",
    headline: "Mini-Quizze. Aufdeck-Karten. Es macht Klick.",
    body: "Statt nur zu lesen, prüfst du dich direkt: was tust du, wenn die Karte nicht funktioniert? Was sagst du bei einer Beschwerde? Falsche Antwort? Kein Drama — Erklärung, nochmal.",
    visual: "quiz",
  },
  {
    marker: "Monat 1",
    ueber: "Du bist offiziell drin",
    headline: "Praxisfreigabe von der Studioleitung.",
    body: "Wenn du dich bereit fühlst, meldest du dich. Deine Studioleitung schaut zu — Begrüßung live, Check-in live, eine echte Beschwerde sauber aufnehmen. Häkchen. Du bist startklar.",
    visual: "freigabe",
  },
];

export function PinnedNarrative() {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) {
        setProgress(rect.top < 0 ? 1 : 0);
        return;
      }
      const passed = Math.max(0, -rect.top);
      const p = Math.max(0, Math.min(1, passed / total));
      setProgress(p);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 4 Phasen → idx 0..3 anhand des Fortschritts
  const phaseAnzahl = PHASEN.length;
  const segGroesse = 1 / phaseAnzahl;
  const aktuellerIdx = Math.min(
    phaseAnzahl - 1,
    Math.floor(progress * phaseAnzahl),
  );
  const aktuelleSubProgress =
    (progress - aktuellerIdx * segGroesse) / segGroesse;

  return (
    <section
      id="story"
      ref={ref}
      className="relative bg-[hsl(var(--brand-ink))] text-[hsl(var(--brand-cream))]"
      style={{ height: `${(phaseAnzahl + 1) * 100}vh` }}
    >
      {/* Sticky Inner */}
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        {/* Sich bewegender Lichtkegel — Farbe ändert sich mit Phase */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(700px circle at ${
              30 + aktuellerIdx * 15
            }% ${50 - aktuelleSubProgress * 10}%, hsl(var(--primary) / ${
              [0.16, 0.2, 0.24, 0.18][aktuellerIdx]
            }), transparent 70%)`,
            transition: "background 600ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />

        {/* Timeline-Indikator — durchgehende Linie + nummerierte Marker */}
        <div className="absolute left-0 right-0 top-0 z-20 px-4 pt-20 sm:px-6 sm:pt-28 lg:px-12 2xl:px-20">
          <div className="mx-auto max-w-[1600px]">
            <div className="relative">
              {/* Background-Linie — durchgehend (Mobile: linker/rechter Offset = halbe Marker-Breite = 1rem; Desktop: 1.25rem) */}
              <div
                aria-hidden
                className="absolute left-4 right-4 top-4 h-px bg-white/10 sm:left-5 sm:right-5 sm:top-5"
              />
              {/* Fill-Linie — folgt Gesamt-Progress, KEIN Transition damit kein Jitter */}
              <div
                aria-hidden
                className="absolute left-4 right-4 top-4 h-px origin-left sm:left-5 sm:right-5 sm:top-5"
                style={{
                  background:
                    "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--brand-pink)))",
                  transform: `scaleX(${progress})`,
                  willChange: "transform",
                }}
              />

              {/* Marker-Reihe */}
              <ol className="relative flex items-start justify-between">
                {PHASEN.map((p, i) => {
                  const istAktiv = i === aktuellerIdx;
                  const istVorbei = i < aktuellerIdx;
                  return (
                    <li
                      key={p.marker}
                      className="flex flex-col items-center gap-2 sm:gap-3"
                    >
                      {/* Nummerierter Marker */}
                      <span
                        className={
                          istVorbei || istAktiv
                            ? "relative flex h-8 w-8 items-center justify-center rounded-full border border-[hsl(var(--primary))] bg-[hsl(var(--brand-ink))] text-[9px] font-mono font-semibold tracking-wider text-[hsl(var(--brand-cream))] transition-colors duration-300 sm:h-10 sm:w-10 sm:text-[10px]"
                            : "relative flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-[hsl(var(--brand-ink))] text-[9px] font-mono font-semibold tracking-wider text-[hsl(var(--brand-cream)/0.4)] transition-colors duration-300 sm:h-10 sm:w-10 sm:text-[10px]"
                        }
                      >
                        {istAktiv && (
                          <span
                            aria-hidden
                            className="absolute inset-[-4px] rounded-full"
                            style={{
                              boxShadow:
                                "0 0 0 1px hsl(var(--primary) / 0.3), 0 0 16px hsl(var(--primary) / 0.5)",
                              animation:
                                "marker-pulse 2.4s ease-in-out infinite",
                            }}
                          />
                        )}
                        {istVorbei ? (
                          <svg
                            viewBox="0 0 12 12"
                            className="h-3 w-3 sm:h-3.5 sm:w-3.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M2.5 6.5l2.5 2.5L9.5 3.5" />
                          </svg>
                        ) : (
                          String(i + 1).padStart(2, "0")
                        )}
                      </span>

                      {/* Label */}
                      <span
                        className={
                          istAktiv
                            ? "text-center text-[9px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--brand-cream))] transition-colors duration-300 sm:text-[11px] sm:tracking-[0.18em]"
                            : istVorbei
                            ? "text-center text-[9px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--brand-cream)/0.6)] transition-colors duration-300 sm:text-[11px] sm:tracking-[0.18em]"
                            : "text-center text-[9px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--brand-cream)/0.3)] transition-colors duration-300 sm:text-[11px] sm:tracking-[0.18em]"
                        }
                      >
                        {p.marker}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>

        {/* Inhalt */}
        <div className="relative z-10 mx-auto grid w-full max-w-[1600px] grid-cols-1 items-center gap-8 px-6 pt-24 sm:gap-12 sm:pt-20 lg:grid-cols-12 lg:gap-16 lg:px-12 lg:pt-0 2xl:px-20">
          {/* Linke Spalte: Text — alle Frames in EINER Grid-Cell uebereinander */}
          <div className="grid grid-cols-1 grid-rows-1 lg:col-span-6 xl:col-span-7">
            {PHASEN.map((p, i) => (
              <div
                key={p.marker}
                aria-hidden={i !== aktuellerIdx}
                className="col-start-1 row-start-1"
                style={{
                  opacity: i === aktuellerIdx ? 1 : 0,
                  transform:
                    i === aktuellerIdx
                      ? "translateY(0)"
                      : i < aktuellerIdx
                      ? "translateY(-30px)"
                      : "translateY(30px)",
                  transition:
                    "opacity 600ms cubic-bezier(0.4,0,0.2,1), transform 600ms cubic-bezier(0.4,0,0.2,1)",
                  pointerEvents: i === aktuellerIdx ? "auto" : "none",
                }}
              >
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--brand-pink))] sm:text-[11px]">
                  {p.ueber}
                </p>
                <h2 className="mt-4 max-w-[16ch] text-balance font-semibold leading-[0.95] tracking-[-0.035em] text-[clamp(2rem,7vw,5.5rem)] sm:mt-6">
                  {p.headline}
                </h2>
                <p className="mt-5 max-w-xl text-pretty text-sm leading-relaxed text-[hsl(var(--brand-cream)/0.7)] sm:mt-8 sm:text-base lg:text-lg">
                  {p.body}
                </p>
              </div>
            ))}
          </div>

          {/* Rechte Spalte: morphender Visual */}
          <div className="lg:col-span-6 xl:col-span-5">
            <PhasenVisual phase={PHASEN[aktuellerIdx]} />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marker-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.6; transform: scale(1.08); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="marker-pulse"] { animation: none !important; }
        }
      `}</style>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/* Phasen-Visual                                                         */
/* -------------------------------------------------------------------- */

function PhasenVisual({ phase }: { phase: Phase }) {
  return (
    <div className="relative mx-auto w-full max-w-[280px] sm:max-w-sm lg:max-w-md">
      {/* Glow */}
      <div
        aria-hidden
        className="absolute -inset-8 -z-10 rounded-[2rem] opacity-25 blur-3xl"
        style={{
          background: "hsl(var(--primary))",
          transition: "background 600ms",
        }}
      />

      <div
        className="overflow-hidden rounded-2xl border border-white/15 bg-[hsl(var(--brand-ink)/0.6)] shadow-2xl backdrop-blur-md"
        style={{
          transform: "rotate(-1.5deg)",
          transition: "transform 800ms cubic-bezier(0.2,0.7,0.2,1)",
        }}
      >
        {/* Window-Chrome */}
        <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-2.5">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--destructive)/0.6)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--warning)/0.7)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--success)/0.6)]" />
          </div>
          <div className="ml-3 flex-1 truncate rounded-md bg-white/[0.05] px-2.5 py-1 text-[11px] text-[hsl(var(--brand-cream)/0.5)]">
            {phase.visual === "login" && "academy.vitness.de/login"}
            {phase.visual === "lektion" &&
              "academy.vitness.de/lektionen/begruessung"}
            {phase.visual === "quiz" && "academy.vitness.de/quiz/check-in"}
            {phase.visual === "freigabe" && "academy.vitness.de/praxisfreigabe"}
          </div>
        </div>

        <div className="theme-light-locked bg-[hsl(var(--brand-cream))] p-6 text-foreground">
          {phase.visual === "login" && <VisualLogin />}
          {phase.visual === "lektion" && <VisualLektion />}
          {phase.visual === "quiz" && <VisualQuiz />}
          {phase.visual === "freigabe" && <VisualFreigabe />}
        </div>
      </div>
    </div>
  );
}

function VisualLogin() {
  return (
    <div>
      <div className="flex items-center gap-2">
        <Logo size={28} />
        <span className="text-sm font-semibold">Vitness Crew</span>
      </div>
      <h4 className="mt-5 text-xl font-semibold leading-tight tracking-tight">
        Hallo, schön dass du da bist.
      </h4>
      <div className="mt-4 space-y-2.5">
        <div className="rounded-md border border-border bg-background px-3 py-2.5 text-xs text-muted-foreground">
          lisa.mueller@vitness.de
        </div>
        <div className="rounded-md border border-border bg-background px-3 py-2.5 text-xs text-muted-foreground">
          ••••••••••
        </div>
        <div className="rounded-md bg-[hsl(var(--primary))] px-3 py-2.5 text-center text-xs font-semibold text-[hsl(var(--primary-foreground))]">
          Anmelden
        </div>
      </div>
      <div className="mt-5 rounded-md border border-dashed border-border bg-muted/40 p-3">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Zugewiesen
        </p>
        <p className="mt-1 text-xs font-medium">
          Lernpfad „Theke und Empfang“ · 3 weitere
        </p>
      </div>
    </div>
  );
}

function VisualLektion() {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Lektion 1 von 4
      </p>
      <h4 className="mt-2 text-lg font-semibold leading-tight">
        Begrüßung am Empfang
      </h4>
      <ul className="mt-4 space-y-2.5">
        {[
          { t: "Blickkontakt aufnehmen", done: true },
          { t: "Aktiv begrüßen, mit Vornamen", done: true },
          { t: "Lächeln, auch wenn beschäftigt", done: true },
          { t: "Volle Aufmerksamkeit geben", done: false },
        ].map((it) => (
          <li key={it.t} className="flex items-start gap-2.5">
            <span
              className={
                it.done
                  ? "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--success))] text-white"
                  : "mt-0.5 flex h-4 w-4 shrink-0 rounded-full border-2 border-muted-foreground/30"
              }
            >
              {it.done && <CheckCircle2 className="h-3 w-3" />}
            </span>
            <span
              className={
                it.done
                  ? "text-xs text-muted-foreground line-through"
                  : "text-xs font-medium"
              }
            >
              {it.t}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-[11px]">
        <span className="text-muted-foreground">3 von 4 erledigt</span>
        <div className="h-1 w-20 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-3/4 bg-[hsl(var(--primary))]" />
        </div>
      </div>
    </div>
  );
}

function VisualQuiz() {
  return (
    <div>
      <div className="flex items-start gap-2.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--brand-pink)/0.15)] text-[hsl(var(--brand-pink))]">
          <Sparkles className="h-3 w-3" />
        </span>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--brand-pink))]">
            Mini-Quiz · Mehrere Antworten
          </p>
          <p className="mt-1 text-sm font-semibold leading-tight">
            Welche Verhaltensweisen gehören zu einer guten Begrüßung?
          </p>
        </div>
      </div>
      <ul className="mt-4 space-y-2">
        {[
          { t: "Lächeln und Blickkontakt", state: "richtig" as const },
          { t: "Erst Aufgabe abschließen", state: "neutral" as const },
          { t: "Mit Vornamen begrüßen", state: "richtig" as const },
        ].map((opt) => (
          <li
            key={opt.t}
            className={
              opt.state === "richtig"
                ? "flex items-start gap-2.5 rounded-md border-2 border-[hsl(var(--success))] bg-[hsl(var(--success)/0.08)] px-3 py-2.5"
                : "flex items-start gap-2.5 rounded-md border border-border px-3 py-2.5 opacity-60"
            }
          >
            <span
              className={
                opt.state === "richtig"
                  ? "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-[hsl(var(--success))] text-white"
                  : "mt-0.5 h-4 w-4 shrink-0 rounded-sm border-2 border-muted-foreground/30"
              }
            >
              {opt.state === "richtig" && (
                <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none">
                  <path
                    d="M2 6.5l2.5 2.5L10 3.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </span>
            <span className="text-xs font-medium">{opt.t}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--success)/0.15)] px-3 py-1 text-[10px] font-semibold text-[hsl(var(--success))]">
        <CheckCircle2 className="h-3 w-3" />
        Richtig!
      </div>
    </div>
  );
}

function VisualFreigabe() {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Praxisfreigabe
      </p>
      <h4 className="mt-2 text-lg font-semibold leading-tight">
        Begrüßung live durchführen
      </h4>
      <p className="mt-2 text-xs text-muted-foreground">
        Studio Mitte · Lisa M. · vor 2 Minuten
      </p>

      <div className="mt-4 flex items-center gap-3 rounded-lg border-2 border-[hsl(var(--success))] bg-[hsl(var(--success)/0.08)] px-4 py-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--success))] text-white">
          <CheckCircle2 className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--success))]">
            Freigegeben
          </p>
          <p className="text-sm font-semibold">Du bist startklar.</p>
        </div>
      </div>

      <div className="mt-4 rounded-md bg-muted/40 p-3">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Notiz von Maria
        </p>
        <p className="mt-1 text-xs leading-relaxed text-foreground">
          „Sehr ruhig und freundlich am Tresen. Mitglied hatte sofort ein gutes
          Gefühl. Top!“
        </p>
      </div>
    </div>
  );
}
