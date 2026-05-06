"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

const HEAD_LINES: string[][] = [
  ["Wir", "sind", "froh,"],
  ["dass", "du", "da", "bist."],
];

export function AnimatedHero() {
  let wordIdx = 0;

  return (
    <section className="relative isolate flex min-h-[100svh] flex-col bg-[hsl(var(--brand-ink))] text-[hsl(var(--brand-cream))]">
      {/* Ein einziger ruhiger Lichtkegel oben rechts */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-10%] h-[700px] w-[700px] rounded-full opacity-[0.28] blur-[120px]"
        style={{
          background:
            "radial-gradient(closest-side, hsl(var(--brand-pink)), transparent)",
        }}
      />

      {/* === Inhalt === */}
      <div className="relative z-10 flex flex-1 flex-col px-6 pt-44 lg:px-12 lg:pt-56 2xl:px-20">
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

        {/* Headline */}
        <h1 className="mt-12 max-w-[16ch] text-balance font-semibold leading-[0.92] tracking-[-0.04em] text-[clamp(3.25rem,9vw,8.75rem)]">
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
        <div className="word-reveal mt-14 max-w-2xl">
          <p
            style={{ animationDelay: "1100ms" }}
            className="text-pretty text-lg leading-relaxed text-[hsl(var(--brand-cream)/0.7)] sm:text-xl"
          >
            Hier lernst du, wie wir bei Vitness arbeiten —
            Theke, Trainingsfläche, Reha, Verkauf. In deinem Tempo.
            Jederzeit nachlesbar.
          </p>
        </div>

        {/* CTA */}
        <div className="word-reveal mt-16">
          <div
            style={{ animationDelay: "1300ms" }}
            className="flex flex-col items-start gap-y-8 sm:flex-row sm:items-center sm:gap-x-16"
          >
            <Link
              href="/login"
              className="group inline-flex items-center gap-3 rounded-full bg-[hsl(var(--primary))] px-8 py-4 text-base font-semibold text-[hsl(var(--primary-foreground))] transition-transform hover:scale-[1.02]"
            >
              Anmelden
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#story"
              className="text-sm font-medium text-[hsl(var(--brand-cream)/0.55)] transition-colors hover:text-[hsl(var(--brand-cream))]"
            >
              Wie das hier funktioniert ↓
            </a>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1 min-h-32" />

        {/* Bottom-Bar */}
        <div className="mb-8 flex items-end justify-between gap-6 border-t border-white/10 pt-8 text-xs text-[hsl(var(--brand-cream)/0.4)]">
          <span className="uppercase tracking-[0.18em]">
            Interne Lernplattform
          </span>
          <span className="hidden font-mono sm:block">
            v · {new Date().getFullYear()}
          </span>
          <a
            href="#story"
            className="scroll-arrow inline-flex items-center gap-2 transition-colors hover:text-[hsl(var(--brand-cream))]"
          >
            <span className="hidden sm:inline">Weiter</span>
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
      `}</style>
    </section>
  );
}
