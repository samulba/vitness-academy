"use client";

import { useState, useTransition } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  Compass,
  GraduationCap,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { onboardingAbschliessen } from "@/app/(app)/onboarding-actions";

type Slide = {
  eyebrow: string;
  titel: string;
  body: string;
  punkte: { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; text: string }[];
};

function makeSlides(vorname: string): Slide[] {
  return [
    {
      eyebrow: "Willkommen bei Vitness",
      titel: vorname ? `Schön, dass du da bist, ${vorname}.` : "Schön, dass du da bist.",
      body: "Hier in der Academy lernst du in deinen ersten Wochen alles, was du im Studio brauchst — Schritt für Schritt, in deinem Tempo.",
      punkte: [
        { icon: Sparkles, text: "Kein Druck — du fängst einfach an." },
        { icon: Sparkles, text: "Jederzeit nachlesbar." },
        { icon: Sparkles, text: "Auf dem Handy oder am Laptop." },
      ],
    },
    {
      eyebrow: "So lernst du",
      titel: "Drei Bausteine — mehr brauchst du nicht.",
      body: "Lernpfade führen dich durch ein Thema. Innerhalb gibt es Module mit Lektionen — und in den Lektionen warten kurze Mini-Quizze, Aufdeck-Karten und Szenarien auf dich.",
      punkte: [
        { icon: Compass, text: "Lernpfade pro Bereich — Service, Magicline, Reha, Trainer" },
        { icon: GraduationCap, text: "Lektionen mit interaktiven Aufgaben" },
        { icon: Sparkles, text: "Praxisfreigabe von der Studioleitung" },
      ],
    },
    {
      eyebrow: "So findest du Hilfe",
      titel: "Du bist nicht allein.",
      body: "Wenn du im Alltag eine schnelle Antwort brauchst, schau im Handbuch nach — vom Notfallplan bis zur Reinigungsroutine. Und wenn etwas hängt, weiß die Studioleitung Bescheid.",
      punkte: [
        { icon: BookOpenText, text: "Handbuch mit suchbaren Artikeln" },
        { icon: Sparkles, text: "Häufig-gesucht-Tags für schnellen Zugriff" },
        { icon: Sparkles, text: "Studioleitung hilft jederzeit weiter" },
      ],
    },
  ];
}

export function OnboardingDialog({ vorname }: { vorname: string | null }) {
  const [aktiv, setAktiv] = useState(0);
  const [pending, startTransition] = useTransition();
  const [versteckt, setVersteckt] = useState(false);

  const slides = makeSlides(vorname ?? "");
  const istLetzter = aktiv === slides.length - 1;
  const slide = slides[aktiv];

  function abschliessen() {
    startTransition(async () => {
      await onboardingAbschliessen();
      setVersteckt(true);
    });
  }

  if (versteckt) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-titel"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[hsl(var(--brand-ink)/0.85)] backdrop-blur-md"
      />

      {/* Dialog */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[hsl(var(--brand-ink))] text-[hsl(var(--brand-cream))] shadow-[0_40px_100px_-40px_hsl(var(--primary)/0.5)]">
        {/* Magenta-Glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 right-[-10%] h-[400px] w-[400px] rounded-full opacity-30 blur-[100px]"
          style={{
            background:
              "radial-gradient(closest-side, hsl(var(--primary)), transparent)",
          }}
        />
        {/* Grid */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--brand-cream)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--brand-cream)) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Skip */}
        <button
          type="button"
          onClick={abschliessen}
          disabled={pending}
          className="absolute right-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-[hsl(var(--brand-cream)/0.6)] transition-colors hover:bg-white/5 hover:text-[hsl(var(--brand-cream))]"
        >
          <X className="h-3.5 w-3.5" />
          Überspringen
        </button>

        <div className="relative p-8 sm:p-12">
          {/* Inhalt */}
          <span className="inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--brand-cream)/0.55)]">
            <span className="h-px w-10 bg-[hsl(var(--primary))]" />
            {slide.eyebrow}
          </span>
          <h2
            id="onboarding-titel"
            className="mt-6 text-balance font-semibold leading-[1.05] tracking-[-0.025em] text-[clamp(1.75rem,3.5vw,2.5rem)]"
          >
            {slide.titel}
          </h2>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-[hsl(var(--brand-cream)/0.7)]">
            {slide.body}
          </p>

          <ul className="mt-8 space-y-3">
            {slide.punkte.map((p, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm text-[hsl(var(--brand-cream)/0.85)]"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.18)] text-[hsl(var(--primary))]">
                  <p.icon className="h-3.5 w-3.5" strokeWidth={2} />
                </span>
                {p.text}
              </li>
            ))}
          </ul>

          {/* Footer */}
          <div className="mt-10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              {slides.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === aktiv
                      ? "w-6 bg-[hsl(var(--primary))]"
                      : i < aktiv
                      ? "w-1.5 bg-[hsl(var(--brand-cream)/0.6)]"
                      : "w-1.5 bg-[hsl(var(--brand-cream)/0.2)]",
                  )}
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              {aktiv > 0 && (
                <button
                  type="button"
                  onClick={() => setAktiv((a) => Math.max(0, a - 1))}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-medium text-[hsl(var(--brand-cream)/0.7)] transition-colors hover:bg-white/10"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Zurück
                </button>
              )}
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  istLetzter ? abschliessen() : setAktiv((a) => a + 1)
                }
                className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition-transform hover:scale-[1.02]"
              >
                {istLetzter ? "Loslegen" : "Weiter"}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
