"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowRight, Smartphone, Sparkles, Clock } from "lucide-react";

const HEAD_LINES: string[][] = [
  ["Wir", "sind", "froh,"],
  ["dass", "du", "da", "bist."],
];

const FEATURE_PILLS = [
  { Icon: Smartphone, label: "Im Browser. Auf jedem Gerät." },
  { Icon: Sparkles, label: "Mehr als nur Lesen." },
  { Icon: Clock, label: "In deinem Tempo." },
];

export function AnimatedHero() {
  let wordIdx = 0;
  const sectionRef = useRef<HTMLElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  // Mouse-Spotlight: ein Magenta-Light folgt der Cursor-Position
  // sanft via requestAnimationFrame + lerp. CSS-Custom-Properties
  // damit kein React-Re-Render bei jeder Mausbewegung.
  useEffect(() => {
    const section = sectionRef.current;
    const spotlight = spotlightRef.current;
    if (!section || !spotlight) return;

    // Reduced-Motion respektieren
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let targetX = 50;
    let targetY = 50;
    let currentX = 50;
    let currentY = 50;
    let active = false;
    let raf = 0;

    function tick() {
      // Lerp fuer smoothes Folgen (15% Schritt pro Frame)
      currentX += (targetX - currentX) * 0.15;
      currentY += (targetY - currentY) * 0.15;
      spotlight!.style.setProperty("--mx", `${currentX}%`);
      spotlight!.style.setProperty("--my", `${currentY}%`);
      raf = requestAnimationFrame(tick);
    }

    function onMove(e: PointerEvent) {
      const rect = section!.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width) * 100;
      targetY = ((e.clientY - rect.top) / rect.height) * 100;
      if (!active) {
        active = true;
        spotlight!.style.opacity = "1";
        raf = requestAnimationFrame(tick);
      }
    }

    function onLeave() {
      spotlight!.style.opacity = "0";
      active = false;
      cancelAnimationFrame(raf);
    }

    section.addEventListener("pointermove", onMove);
    section.addEventListener("pointerleave", onLeave);
    return () => {
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="group/hero relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-[hsl(var(--brand-ink))] text-[hsl(var(--brand-cream))]"
    >
      {/* Mouse-Spotlight (nur Desktop, hidden auf Touch via media-Query unten) */}
      <div
        ref={spotlightRef}
        aria-hidden
        className="hero-spotlight pointer-events-none absolute inset-0 z-[1] opacity-0 transition-opacity duration-300"
        style={{
          background:
            "radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), hsl(var(--primary) / 0.18), transparent 70%)",
        }}
      />
      {/* Glow oben rechts (Brand-Pink) */}
      <div
        aria-hidden
        className="hero-glow-1 pointer-events-none absolute -top-40 right-[-10%] h-[700px] w-[700px] rounded-full opacity-[0.30] blur-[120px]"
        style={{
          background:
            "radial-gradient(closest-side, hsl(var(--brand-pink)), transparent)",
        }}
      />
      {/* Glow unten links (Magenta-Primary) */}
      <div
        aria-hidden
        className="hero-glow-2 pointer-events-none absolute -bottom-32 left-[-15%] h-[560px] w-[560px] rounded-full opacity-[0.18] blur-[120px]"
        style={{
          background:
            "radial-gradient(closest-side, hsl(var(--primary)), transparent)",
        }}
      />

      {/* Subtiles Grid-Pattern */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--brand-cream)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--brand-cream)) 1px, transparent 1px)",
          backgroundSize: "88px 88px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 75%)",
        }}
      />


      {/* === Inhalt === */}
      <div className="relative z-10 flex flex-1 flex-col px-6 pt-28 sm:pt-32 lg:px-12 lg:pt-44 2xl:px-20">
        {/* Eyebrow */}
        <div className="word-reveal">
          <span
            style={{ animationDelay: "120ms" }}
            className="inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--brand-cream)/0.5)]"
          >
            <span className="h-px w-10 bg-[hsl(var(--primary))]" />
            Vitness Crew · Onboarding
          </span>
        </div>

        {/* Zwei-Spalten-Layout auf lg+: Headline links, Preview-Card rechts */}
        <div className="lg:grid lg:grid-cols-12 lg:items-center lg:gap-12">
          <div className="lg:col-span-7">

        {/* Headline */}
        <h1 className="mt-8 max-w-[16ch] text-balance font-semibold leading-[0.92] tracking-[-0.04em] text-[clamp(2.75rem,11vw,8.75rem)] sm:mt-12">
          {HEAD_LINES.map((line, lineIdx) => (
            <span key={lineIdx} className="block">
              {line.map((w, i) => {
                const delay = wordIdx++ * 90 + 250;
                const istLetzteZeile = lineIdx === HEAD_LINES.length - 1;
                const istLetztesWort = i === line.length - 1;
                const akzent = istLetzteZeile && istLetztesWort;
                return (
                  <span
                    key={`${w}-${lineIdx}-${i}`}
                    className="word-reveal mr-[0.18em]"
                  >
                    <span
                      style={{ animationDelay: `${delay}ms` }}
                      className={
                        akzent ? "relative inline-block" : "inline-block"
                      }
                    >
                      {w}
                      {akzent && (
                        <span
                          aria-hidden
                          className="pointer-events-none absolute -bottom-[0.12em] left-0 right-[0.08em] h-[0.08em] rounded-full bg-[hsl(var(--primary))]"
                          style={{
                            transformOrigin: "left center",
                            transform: "scaleX(0)",
                            animation:
                              "underline-grow 0.9s cubic-bezier(0.2,0.7,0.2,1) forwards",
                            animationDelay: `${delay + 600}ms`,
                          }}
                        />
                      )}
                    </span>
                  </span>
                );
              })}
            </span>
          ))}
        </h1>

        {/* Subline */}
        <div className="word-reveal mt-8 max-w-2xl sm:mt-14">
          <p
            style={{ animationDelay: "1100ms" }}
            className="text-pretty text-base leading-relaxed text-[hsl(var(--brand-cream)/0.7)] sm:text-lg lg:text-xl"
          >
            Hier lernst du, wie wir bei Vitness arbeiten —
            Theke, Trainingsfläche, Reha, Verkauf. In deinem Tempo.
            Jederzeit nachlesbar.
          </p>
        </div>

        {/* Feature-Pills */}
        <div className="word-reveal mt-6 sm:mt-10">
          <div
            style={{ animationDelay: "1250ms" }}
            className="flex flex-wrap gap-2"
          >
            {FEATURE_PILLS.map(({ Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs text-[hsl(var(--brand-cream)/0.75)] backdrop-blur-sm"
              >
                <Icon className="h-3.5 w-3.5 text-[hsl(var(--brand-pink))]" />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="word-reveal mt-8 sm:mt-12">
          <div
            style={{ animationDelay: "1400ms" }}
            className="flex flex-col items-stretch gap-y-5 sm:flex-row sm:items-center sm:gap-x-16"
          >
            <Link
              href="/login"
              className="group inline-flex items-center justify-center gap-3 rounded-full bg-[hsl(var(--primary))] px-8 py-4 text-base font-semibold text-[hsl(var(--primary-foreground))] shadow-[0_8px_24px_-6px_hsl(var(--primary)/0.55)] transition-all duration-200 hover:bg-[hsl(var(--primary)/0.9)] hover:shadow-[0_16px_40px_-10px_hsl(var(--primary)/0.7)]"
            >
              Anmelden
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <a
              href="#story"
              className="text-center text-sm font-medium text-[hsl(var(--brand-cream)/0.55)] transition-colors hover:text-[hsl(var(--brand-cream))] sm:text-left"
            >
              Wie das hier funktioniert ↓
            </a>
          </div>
        </div>
          </div>

          {/* Rechte Spalte: Floating Preview-Card mit Tilt */}
          <div className="hidden lg:col-span-5 lg:block">
            <HeroPreviewCard />
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1 min-h-16 sm:min-h-32" />

        {/* Bottom-Bar mit Live-Status */}
        <div className="mb-6 flex items-center justify-between gap-4 border-t border-white/10 pt-5 text-[11px] text-[hsl(var(--brand-cream)/0.4)] sm:mb-8 sm:pt-8 sm:text-xs">
          <span className="inline-flex items-center gap-2 uppercase tracking-[0.18em]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[hsl(var(--primary)/0.5)]" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[hsl(var(--primary))]" />
            </span>
            Live · Studio Mitte
          </span>
          <span className="hidden font-mono md:block">
            v · {new Date().getFullYear()}
          </span>
          <a
            href="#story"
            className="scroll-arrow inline-flex items-center gap-1.5 transition-colors hover:text-[hsl(var(--brand-cream))]"
          >
            <span>Weiter</span>
            <svg
              viewBox="0 0 12 12"
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M6 1v10M2 7l4 4 4-4" />
            </svg>
          </a>
        </div>
      </div>

      <style>{`
        @keyframes underline-grow {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes hero-glow-pulse-1 {
          0%, 100% { opacity: 0.30; transform: translate(0, 0); }
          50%      { opacity: 0.38; transform: translate(-20px, 10px); }
        }
        @keyframes hero-glow-pulse-2 {
          0%, 100% { opacity: 0.18; transform: translate(0, 0); }
          50%      { opacity: 0.26; transform: translate(15px, -10px); }
        }
        .hero-glow-1 {
          animation: hero-glow-pulse-1 12s ease-in-out infinite;
        }
        .hero-glow-2 {
          animation: hero-glow-pulse-2 14s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-glow-1, .hero-glow-2 { animation: none; }
        }
        /* Spotlight nur auf Desktop (Hover-faehige Pointer) — auf
         * Touch-Devices kein Cursor → keinen Sinn die Mouse-Effekte
         * mitzuladen. */
        @media (hover: none) {
          .hero-spotlight { display: none; }
        }
      `}</style>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/* HeroPreviewCard - schwebende Preview-Card mit Cursor-Tilt             */
/* -------------------------------------------------------------------- */

function HeroPreviewCard() {
  const cardRef = useRef<HTMLDivElement>(null);

  // Cursor-Tilt: berechnet rotateX/rotateY basierend auf Mausposition
  // relativ zur Card. Geclampt damit kein extreme-Tilt wenn der
  // Cursor weit weg ist (z.B. ueber der Headline links).
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const MAX_TILT = 6; // Grad - bewusst dezent
    let targetRX = 0;
    let targetRY = 0;
    let currentRX = 0;
    let currentRY = 0;
    let raf = 0;

    function clamp(v: number, min: number, max: number) {
      return Math.max(min, Math.min(max, v));
    }

    function tick() {
      currentRX += (targetRX - currentRX) * 0.1;
      currentRY += (targetRY - currentRY) * 0.1;
      card!.style.transform = `perspective(1400px) rotateX(${currentRX}deg) rotateY(${currentRY}deg)`;
      // Stoppe wenn ausreichend nah an Target (Performance)
      if (
        Math.abs(targetRX - currentRX) < 0.05 &&
        Math.abs(targetRY - currentRY) < 0.05
      ) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(tick);
    }

    function startTick() {
      if (raf === 0) raf = requestAnimationFrame(tick);
    }

    function onMove(e: PointerEvent) {
      const rect = card!.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      // Normalisiert auf ±1 nur wenn Cursor IN Card-Bounds
      // ist; ausserhalb wird's bei ±1 gecappt — kein Crash mehr.
      const dx = clamp((e.clientX - cx) / (rect.width / 2), -1, 1);
      const dy = clamp((e.clientY - cy) / (rect.height / 2), -1, 1);
      targetRY = dx * MAX_TILT;
      targetRX = -dy * MAX_TILT;
      startTick();
    }

    function onLeave() {
      targetRX = 0;
      targetRY = 0;
      startTick();
    }

    // Auf das Section-Element hoeren damit Card auch bei
    // Cursor-Bewegung "ueber Hero" reagiert.
    const section = card.closest("section");
    if (!section) return;

    section.addEventListener("pointermove", onMove);
    section.addEventListener("pointerleave", onLeave);

    return () => {
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      className="word-reveal"
      style={{ animationDelay: "1500ms", perspective: "1200px" }}
    >
      <div
        ref={cardRef}
        className="hero-preview-card relative will-change-transform"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Glow hinter der Card */}
        <div
          aria-hidden
          className="absolute -inset-6 -z-10 rounded-[2.5rem] opacity-50 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, hsl(var(--primary) / 0.5), transparent)",
          }}
        />

        <div className="rounded-2xl border border-white/12 bg-[hsl(var(--brand-ink)/0.7)] p-5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          {/* Header: Avatar + Greeting */}
          <div className="flex items-center gap-3 border-b border-white/[0.08] pb-4">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white shadow-[0_4px_12px_-2px_hsl(var(--primary)/0.6)]"
              style={{
                background:
                  "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--brand-pink)) 100%)",
              }}
            >
              LM
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-cream)/0.5)]">
                Mein Tag
              </p>
              <p className="mt-0.5 text-sm font-semibold">
                Hallo, Lisa.
              </p>
            </div>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[hsl(var(--primary)/0.5)]" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[hsl(var(--primary))]" />
            </span>
          </div>

          {/* Stats-Pill-Row */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: "Aufgaben", wert: "3" },
              { label: "Anfragen", wert: "1" },
              { label: "Lernpfad", wert: "47%" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-2.5 py-2"
              >
                <p className="text-[9px] font-semibold uppercase tracking-wider text-[hsl(var(--brand-cream)/0.45)]">
                  {s.label}
                </p>
                <p className="mt-1 text-lg font-semibold tabular-nums">
                  {s.wert}
                </p>
              </div>
            ))}
          </div>

          {/* Aktuelle Lektion */}
          <div className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--brand-pink))]">
                Theke und Empfang
              </span>
              <span className="text-[10px] tabular-nums text-[hsl(var(--brand-cream)/0.45)]">
                11 / 16
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
              <div
                className="h-full rounded-full"
                style={{
                  width: "68%",
                  background:
                    "linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--brand-pink)) 100%)",
                  boxShadow: "0 0 12px hsl(var(--primary) / 0.6)",
                }}
              />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-white">
                <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none">
                  <path d="M2 6.5l2.5 2.5L10 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              <span className="text-xs text-[hsl(var(--brand-cream)/0.7)] line-through">
                Begrüßung am Empfang
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              </span>
              <span className="text-xs font-medium">Standard Check-in</span>
              <span className="ml-auto rounded-full border border-[hsl(var(--primary))] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[hsl(var(--primary))]">
                Jetzt
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
