import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-screen flex-col bg-[hsl(var(--brand-ink))] text-[hsl(var(--brand-cream))]">
      {/* Magenta-Glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-10%] h-[600px] w-[600px] rounded-full opacity-25 blur-[120px]"
        style={{
          background:
            "radial-gradient(closest-side, hsl(var(--primary)), transparent)",
        }}
      />
      {/* Grid-Pattern */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--brand-cream)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--brand-cream)) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex w-full items-center justify-between px-6 py-6 lg:px-12 2xl:px-20">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-sm font-bold text-[hsl(var(--primary-foreground))]">
            VC
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            Vitness Crew
          </span>
        </Link>
      </header>

      {/* Mitte */}
      <section className="relative z-10 flex w-full flex-1 flex-col justify-center px-6 py-16 lg:px-12 2xl:px-20">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--brand-cream)/0.55)]">
            <span className="h-px w-10 bg-[hsl(var(--primary))]" />
            Fehler 404
          </span>

          <h1 className="mt-10 max-w-[14ch] text-balance font-semibold leading-[0.92] tracking-[-0.04em] text-[clamp(3.5rem,11vw,9rem)]">
            Die Seite gibt&apos;s
            <br />
            <span className="relative inline-block">
              hier nicht.
              <span
                aria-hidden
                className="absolute -bottom-2 left-0 right-1 h-[6px] rounded-full bg-[hsl(var(--primary))]"
              />
            </span>
          </h1>

          <p className="mt-12 max-w-xl text-pretty text-lg leading-relaxed text-[hsl(var(--brand-cream)/0.7)] sm:text-xl">
            Vielleicht ein alter Link, ein Tippfehler in der URL — oder die
            Lektion wurde umsortiert. Geh kurz zurück und such dir was anderes
            aus.
          </p>

          <div className="mt-14 flex flex-col items-start gap-y-6 sm:flex-row sm:items-center sm:gap-x-12">
            <Link
              href="/"
              className="group inline-flex items-center gap-3 rounded-full bg-[hsl(var(--primary))] px-7 py-3.5 text-base font-semibold text-[hsl(var(--primary-foreground))] transition-transform hover:scale-[1.02]"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              Zurück zur Startseite
            </Link>
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 text-sm font-medium text-[hsl(var(--brand-cream)/0.7)] transition-colors hover:text-[hsl(var(--brand-cream))]"
            >
              Zum Dashboard
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-white/10 px-6 py-6 lg:px-12 2xl:px-20">
        <p className="text-xs text-[hsl(var(--brand-cream)/0.5)]">
          © {new Date().getFullYear()} Vitness · Interne Plattform
        </p>
      </footer>
    </main>
  );
}
