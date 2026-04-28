import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCurrentProfile, startseiteFuerRolle } from "@/lib/auth";

export default async function RootPage() {
  const profile = await getCurrentProfile();
  if (profile) {
    redirect(startseiteFuerRolle(profile.role));
  }

  return (
    <main className="relative isolate flex min-h-screen flex-col bg-[hsl(var(--brand-ink))] text-[hsl(var(--brand-cream))]">
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

      {/* Header */}
      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-12">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--brand-lime))] text-sm font-bold text-[hsl(var(--brand-ink))]">
            VA
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            Vitness Academy
          </span>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--brand-lime))] px-4 py-2 text-sm font-semibold text-[hsl(var(--brand-ink))] transition-transform hover:scale-[1.02]"
        >
          Anmelden
        </Link>
      </header>

      {/* Mitte */}
      <section className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-6 py-16 lg:px-12">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-cream)/0.55)]">
            <span className="h-1 w-6 rounded-full bg-[hsl(var(--brand-lime))]" />
            Interne Lernplattform für das Vitness-Team
          </span>

          <h1 className="mt-8 text-balance font-semibold leading-[0.98] tracking-[-0.03em] text-[clamp(2.5rem,6vw,5rem)]">
            Willkommen in der
            <br />
            <span className="relative inline-block">
              Vitness Academy.
              <span
                aria-hidden
                className="absolute -bottom-2 left-0 right-0 h-1 rounded-full bg-[hsl(var(--brand-lime))]"
              />
            </span>
          </h1>

          <p className="mt-10 max-w-xl text-pretty text-lg leading-relaxed text-[hsl(var(--brand-cream)/0.7)]">
            Lernpfade, Quizze und Wissen für alle Bereiche — Theke,
            Trainingsfläche, Reha, Verkauf. Login mit deiner dienstlichen
            E-Mail.
          </p>

          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 rounded-full bg-[hsl(var(--brand-lime))] px-6 py-3.5 text-base font-semibold text-[hsl(var(--brand-ink))] transition-transform hover:scale-[1.02]"
            >
              Zum Login
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <p className="text-sm text-[hsl(var(--brand-cream)/0.5)]">
              Noch keinen Zugang? Kurz beim Studio-Team melden.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 mx-auto w-full max-w-7xl border-t border-white/10 px-6 py-6 lg:px-12">
        <p className="text-xs text-[hsl(var(--brand-cream)/0.5)]">
          © {new Date().getFullYear()} Vitness · Interne Plattform
        </p>
      </footer>
    </main>
  );
}
