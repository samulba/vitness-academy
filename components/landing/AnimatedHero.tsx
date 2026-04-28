"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowRight } from "lucide-react";

const HEADLINE_LINE_1 = ["Willkommen", "im", "Team."];
const HEADLINE_LINE_2 = ["Schön,", "dass", "du", "da", "bist."];

const MARQUEE_ITEMS = [
  "Theke & Empfang",
  "Trainingsfläche",
  "Reha & Prävention",
  "Magicline-System",
  "Verkauf & Beratung",
  "Kursplan",
  "Beschwerden",
  "Probetraining",
];

export function AnimatedHero() {
  const ref = useRef<HTMLDivElement>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty("--mx", `${x}%`);
      el.style.setProperty("--my", `${y}%`);
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  // Re-trigger word animation on mount via tiny tick
  useEffect(() => {
    setTick((t) => t + 1);
  }, []);

  let wordIdx = 0;

  return (
    <section
      ref={ref}
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-[hsl(var(--brand-ink))] text-[hsl(var(--brand-cream))]"
    >
      {/* Grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--brand-cream)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--brand-cream)) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      {/* Schwebende Orbs */}
      <div
        aria-hidden
        className="orb-float-a absolute -top-40 right-[-15%] h-[700px] w-[700px] rounded-full opacity-[0.32] blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, hsl(var(--brand-teal)), transparent)",
        }}
      />
      <div
        aria-hidden
        className="orb-float-b absolute bottom-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full opacity-[0.28] blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, hsl(var(--brand-lime)), transparent)",
        }}
      />
      <div
        aria-hidden
        className="orb-float-c absolute top-[35%] left-[40%] h-[400px] w-[400px] rounded-full opacity-[0.18] blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, hsl(var(--primary)), transparent)",
        }}
      />

      {/* Mouse-Spot */}
      <div aria-hidden className="mouse-spot pointer-events-none absolute inset-0" />

      {/* Inhalt */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col px-6 py-20 lg:px-12">
        {/* Eyebrow */}
        <div
          key={`eyebrow-${tick}`}
          className="word-reveal"
          style={{ animationDelay: "0ms" }}
        >
          <span
            style={{ animationDelay: "100ms" }}
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-cream)/0.55)]"
          >
            <span className="pulse-dot relative inline-block h-2 w-2 rounded-full bg-[hsl(var(--brand-lime))]" />
            Für neue Mitglieder im Vitness-Team
          </span>
        </div>

        {/* Headline word-by-word */}
        <h1
          key={`h-${tick}`}
          className="mt-10 max-w-6xl text-balance font-semibold leading-[0.95] tracking-[-0.035em] text-[clamp(3rem,8vw,7.5rem)]"
        >
          <span className="block">
            {HEADLINE_LINE_1.map((w) => {
              const delay = wordIdx++ * 90 + 200;
              return (
                <span
                  key={`a-${w}-${delay}`}
                  className="word-reveal mr-[0.25em]"
                >
                  <span style={{ animationDelay: `${delay}ms` }}>{w}</span>
                </span>
              );
            })}
          </span>
          <span className="block">
            {HEADLINE_LINE_2.map((w, i) => {
              const delay = wordIdx++ * 90 + 200;
              const istLetztes = i === HEADLINE_LINE_2.length - 1;
              return (
                <span
                  key={`b-${w}-${delay}`}
                  className={
                    istLetztes
                      ? "word-reveal mr-[0.25em] relative"
                      : "word-reveal mr-[0.25em]"
                  }
                >
                  <span style={{ animationDelay: `${delay}ms` }}>
                    {istLetztes ? (
                      <span className="relative inline-block">
                        {w}
                        <span
                          aria-hidden
                          className="absolute -bottom-2 left-0 right-1 h-1 rounded-full bg-[hsl(var(--brand-lime))]"
                          style={{
                            animation: `word-rise 1s cubic-bezier(0.2,0.7,0.2,1) forwards`,
                            animationDelay: `${delay + 600}ms`,
                            opacity: 0,
                          }}
                        />
                      </span>
                    ) : (
                      w
                    )}
                  </span>
                </span>
              );
            })}
          </span>
        </h1>

        {/* Subline */}
        <div
          className="word-reveal mt-10 max-w-2xl"
          style={{ animationDelay: "0ms" }}
        >
          <span
            style={{ animationDelay: "1100ms" }}
            className="block text-pretty text-lg leading-relaxed text-[hsl(var(--brand-cream)/0.7)] sm:text-xl"
          >
            Hier in der Academy lernst du in deinen ersten Wochen alles, was du
            bei uns im Studio brauchst — Theke, Trainingsfläche, Reha, Verkauf.
            In deinem Tempo. Jederzeit nachlesbar.
          </span>
        </div>

        {/* CTAs */}
        <div
          className="word-reveal mt-12"
          style={{ animationDelay: "0ms" }}
        >
          <span
            style={{ animationDelay: "1300ms" }}
            className="flex flex-wrap items-center gap-x-8 gap-y-4"
          >
            <Link
              href="/login"
              className="group shimmer inline-flex items-center gap-2 rounded-full bg-[hsl(var(--brand-lime))] px-7 py-4 text-base font-semibold text-[hsl(var(--brand-ink))] shadow-[0_18px_50px_-15px_hsl(var(--brand-lime)/0.7)] transition-transform hover:scale-[1.03]"
            >
              Jetzt anmelden
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#worum-geht-es"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--brand-cream)/0.75)] transition-colors hover:text-[hsl(var(--brand-cream))]"
            >
              Was dich erwartet
              <ArrowDown className="h-3.5 w-3.5" />
            </a>
          </span>
        </div>
      </div>

      {/* Marquee unten */}
      <div className="absolute bottom-20 left-0 right-0 overflow-hidden border-y border-white/10 bg-[hsl(var(--brand-ink)/0.6)] py-4 backdrop-blur-sm">
        <div className="ticker flex w-max items-center gap-12 whitespace-nowrap text-sm font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-cream)/0.5)]">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map(
            (item, i) => (
              <span key={i} className="flex items-center gap-12">
                <span>{item}</span>
                <span className="h-1 w-1 rounded-full bg-[hsl(var(--brand-lime))]" />
              </span>
            ),
          )}
        </div>
      </div>

      {/* Scroll Arrow */}
      <a
        href="#worum-geht-es"
        aria-label="Weiterscrollen"
        className="scroll-arrow absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-[hsl(var(--brand-cream)/0.5)] transition-colors hover:text-[hsl(var(--brand-cream))]"
      >
        <ArrowDown className="h-5 w-5" />
      </a>
    </section>
  );
}
