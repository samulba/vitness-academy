"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowRight, CheckCircle2, Play } from "lucide-react";

const HEADLINE_BIG = ["Willkommen", "bei", "Vitness."];
const MARQUEE_ITEMS = [
  "Theke & Empfang",
  "Magicline-System",
  "Trainingsfläche",
  "Reha & Prävention",
  "Verkauf & Beratung",
  "Kursplan",
  "Probetraining",
  "Beschwerdemanagement",
];

function uhrzeit(): string {
  const d = new Date();
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function AnimatedHero() {
  const ref = useRef<HTMLElement>(null);
  const [zeit, setZeit] = useState<string>("");

  useEffect(() => {
    setZeit(uhrzeit());
    const id = setInterval(() => setZeit(uhrzeit()), 30_000);
    return () => clearInterval(id);
  }, []);

  // Mouse-Parallax: --mx/--my als CSS-Variablen, auch -px/-py für stärkere Verschiebung
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      el.style.setProperty("--mx", `${x * 100}%`);
      el.style.setProperty("--my", `${y * 100}%`);
      el.style.setProperty("--px", `${(x - 0.5) * 60}px`);
      el.style.setProperty("--py", `${(y - 0.5) * 60}px`);
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  let wordIdx = 0;

  return (
    <section
      ref={ref}
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-[hsl(var(--brand-ink))] text-[hsl(var(--brand-cream))]"
    >
      {/* Grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--brand-cream)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--brand-cream)) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Schwebende Orbs mit Mouse-Parallax */}
      <div
        aria-hidden
        className="orb-float-a absolute -top-44 right-[-18%] h-[820px] w-[820px] rounded-full opacity-[0.38] blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, hsl(var(--brand-teal)), transparent)",
          transform: "translate3d(var(--px,0), var(--py,0), 0)",
        }}
      />
      <div
        aria-hidden
        className="orb-float-b absolute bottom-[-25%] left-[-15%] h-[700px] w-[700px] rounded-full opacity-[0.32] blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, hsl(var(--brand-lime)), transparent)",
          transform: "translate3d(calc(var(--px,0) * -1), calc(var(--py,0) * -1), 0)",
        }}
      />
      <div
        aria-hidden
        className="orb-float-c absolute top-[30%] left-[35%] h-[450px] w-[450px] rounded-full opacity-[0.22] blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, hsl(var(--primary)), transparent)",
        }}
      />

      {/* Geometrischer Akzent: dünne Lime-Linie diagonal */}
      <div
        aria-hidden
        className="absolute inset-0 mix-blend-screen"
        style={{
          background:
            "linear-gradient(115deg, transparent 0%, transparent 49.6%, hsl(var(--brand-lime) / 0.15) 49.8%, hsl(var(--brand-lime) / 0.15) 50.2%, transparent 50.4%, transparent 100%)",
        }}
      />

      {/* Mouse-Lichtkegel */}
      <div aria-hidden className="mouse-spot pointer-events-none absolute inset-0" />

      {/* === Inhalt === */}
      <div className="relative z-10 flex flex-1 flex-col px-6 pt-32 lg:px-12 lg:pt-44 2xl:px-20">
        <div className="grid flex-1 items-center gap-16 lg:grid-cols-12 lg:gap-12">
          {/* Linke Seite: Headline */}
          <div className="lg:col-span-8">
            {/* Live-Indicator */}
            <div className="word-reveal mb-10">
              <span
                style={{ animationDelay: "100ms" }}
                className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/[0.04] px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-cream)/0.7)] backdrop-blur"
              >
                <span className="pulse-dot relative inline-block h-1.5 w-1.5 rounded-full bg-[hsl(var(--brand-lime))]" />
                <span>Live · Vitness Team</span>
                {zeit && (
                  <>
                    <span className="text-[hsl(var(--brand-cream)/0.3)]">·</span>
                    <span className="font-mono normal-case tracking-normal text-[hsl(var(--brand-cream)/0.55)]">
                      {zeit}
                    </span>
                  </>
                )}
              </span>
            </div>

            {/* Tier 1: kleines „Hey." */}
            <div className="word-reveal">
              <span
                style={{ animationDelay: "250ms" }}
                className="inline-block text-2xl font-medium tracking-tight text-[hsl(var(--brand-cream)/0.7)] sm:text-3xl"
              >
                Hey, schön dass du da bist.
              </span>
            </div>

            {/* Tier 2: massive Headline */}
            <h1 className="mt-8 max-w-[18ch] text-balance font-semibold leading-[0.92] tracking-[-0.04em] text-[clamp(3.5rem,11vw,10rem)]">
              {HEADLINE_BIG.map((w, i) => {
                const delay = wordIdx++ * 110 + 400;
                const istLetztes = i === HEADLINE_BIG.length - 1;
                return (
                  <span key={`${w}-${i}`} className="word-reveal mr-[0.18em]">
                    <span
                      style={{ animationDelay: `${delay}ms` }}
                      className={
                        istLetztes ? "relative inline-block" : "inline-block"
                      }
                    >
                      {w}
                      {istLetztes && (
                        <span
                          aria-hidden
                          className="absolute -bottom-3 left-0 right-2 h-[6px] rounded-full bg-[hsl(var(--brand-lime))]"
                          style={{
                            transformOrigin: "left center",
                            transform: "scaleX(0)",
                            animation:
                              "underline-grow 0.9s cubic-bezier(0.2,0.7,0.2,1) forwards",
                            animationDelay: `${delay + 700}ms`,
                          }}
                        />
                      )}
                    </span>
                  </span>
                );
              })}
            </h1>

            {/* Tier 3: subline */}
            <div className="word-reveal mt-12 max-w-2xl">
              <span
                style={{ animationDelay: "1300ms" }}
                className="block text-pretty text-lg leading-relaxed text-[hsl(var(--brand-cream)/0.7)] sm:text-xl"
              >
                Du startest gerade bei uns. Hier in der Academy lernst du in
                deinen ersten Wochen alles, was du im Studio brauchst — in
                deinem Tempo, jederzeit nachlesbar.
              </span>
            </div>
          </div>

          {/* Rechte Seite: Floating Mockup-Card */}
          <FloatingMockup />
        </div>

        {/* CTA-Block — explizit getrennt, viel Whitespace */}
        <div
          className="word-reveal mt-20 lg:mt-28"
          style={{ animationDelay: "0ms" }}
        >
          <div
            style={{ animationDelay: "1600ms" }}
            className="flex flex-col items-start gap-10 sm:flex-row sm:items-center sm:gap-20"
          >
            <Link
              href="/login"
              className="group shimmer relative inline-flex items-center gap-3 rounded-full bg-[hsl(var(--brand-lime))] px-9 py-5 text-lg font-semibold text-[hsl(var(--brand-ink))] shadow-[0_25px_70px_-20px_hsl(var(--brand-lime)/0.65)] transition-transform hover:scale-[1.03]"
            >
              Jetzt anmelden
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>

            <a
              href="#worum-geht-es"
              className="group inline-flex items-center gap-3 text-sm font-medium text-[hsl(var(--brand-cream)/0.7)] transition-colors hover:text-[hsl(var(--brand-cream))]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 transition-colors group-hover:border-[hsl(var(--brand-lime))] group-hover:text-[hsl(var(--brand-lime))]">
                <Play className="h-3 w-3 fill-current" />
              </span>
              <span>Was dich in den ersten Wochen erwartet</span>
            </a>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1 min-h-12" />
      </div>

      {/* Marquee am unteren Rand */}
      <div className="relative z-10 overflow-hidden border-y border-white/10 bg-[hsl(var(--brand-ink)/0.7)] py-4 backdrop-blur-sm">
        <div className="ticker flex w-max items-center gap-12 whitespace-nowrap text-sm font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-cream)/0.5)]">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="flex items-center gap-12">
              <span>{item}</span>
              <span className="h-1 w-1 rounded-full bg-[hsl(var(--brand-lime))]" />
            </span>
          ))}
        </div>
      </div>

      {/* Scroll-Pfeil */}
      <a
        href="#worum-geht-es"
        aria-label="Weiterscrollen"
        className="scroll-arrow absolute bottom-20 left-1/2 z-20 -translate-x-1/2 text-[hsl(var(--brand-cream)/0.4)] transition-colors hover:text-[hsl(var(--brand-cream))]"
      >
        <ArrowDown className="h-5 w-5" />
      </a>

      <style>{`
        @keyframes underline-grow {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
      `}</style>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/* Floating Mockup-Card                                                  */
/* -------------------------------------------------------------------- */

function FloatingMockup() {
  return (
    <div
      className="relative hidden lg:col-span-4 lg:block"
      style={{
        transform:
          "translate3d(calc(var(--px,0) * 0.5), calc(var(--py,0) * 0.5), 0) rotate(2.5deg)",
        transition: "transform 200ms ease-out",
      }}
    >
      <div
        className="word-reveal"
        style={{ animationDelay: "0ms" }}
      >
        <div
          style={{ animationDelay: "1000ms" }}
          className="block"
        >
          <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-[hsl(var(--brand-lime))] opacity-10 blur-3xl" />
          <div className="rounded-2xl border border-white/15 bg-[hsl(var(--brand-ink)/0.6)] p-2 shadow-2xl backdrop-blur-md">
            <div className="rounded-xl bg-[hsl(var(--brand-cream))] p-5 text-foreground">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Lektion
                </span>
                <span className="rounded-full bg-[hsl(var(--brand-lime)/0.25)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--primary))]">
                  Live
                </span>
              </div>
              <h3 className="mt-2 text-base font-semibold leading-tight">
                Begrüßung am Empfang
              </h3>

              <div className="mt-4 space-y-2.5">
                {[
                  { label: "Blickkontakt aufnehmen", done: true },
                  { label: "Aktiv begrüßen, mit Vornamen", done: true },
                  { label: "Lächeln, auch wenn beschäftigt", done: false },
                  { label: "Volle Aufmerksamkeit geben", done: false },
                ].map((it) => (
                  <div key={it.label} className="flex items-start gap-2.5">
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
                          : "text-xs font-medium text-foreground"
                      }
                    >
                      {it.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Fortschritt
                </span>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-20 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[55%] rounded-full bg-[hsl(var(--brand-lime))]" />
                  </div>
                  <span className="text-[10px] font-bold tabular-nums text-foreground">
                    55%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
