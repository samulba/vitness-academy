import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LoginFormular } from "./LoginFormular";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ weiter?: string; fehler?: string }>;
}) {
  const { weiter, fehler } = await searchParams;

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Branding-Pane */}
      <aside className="relative hidden overflow-hidden bg-[hsl(var(--brand-ink))] text-[hsl(var(--brand-cream))] lg:flex">
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
          className="absolute -bottom-32 -left-20 h-[420px] w-[420px] rounded-full opacity-25 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, hsl(var(--brand-teal)), transparent)",
          }}
        />

        <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
          <Link href="/" className="flex w-fit items-center gap-2.5">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--brand-lime))] text-sm font-bold text-[hsl(var(--brand-ink))]">
              VA
            </span>
            <span className="text-[15px] font-semibold tracking-tight">
              Vitness Academy
            </span>
          </Link>

          <div className="max-w-lg space-y-8">
            <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-cream)/0.55)]">
              <span className="h-1 w-6 rounded-full bg-[hsl(var(--brand-lime))]" />
              Willkommen zurück
            </span>
            <h2 className="text-balance font-semibold leading-[1.02] tracking-[-0.025em] text-[clamp(2.25rem,4vw,3.5rem)]">
              Schön, dass du
              <br />
              wieder da bist.
            </h2>
            <p className="max-w-md text-base leading-relaxed text-[hsl(var(--brand-cream)/0.7)]">
              Melde dich mit deiner dienstlichen E-Mail an und mach da weiter,
              wo du aufgehört hast.
            </p>
          </div>

          <p className="text-xs text-[hsl(var(--brand-cream)/0.4)]">
            © {new Date().getFullYear()} Vitness Academy · Interne Plattform
          </p>
        </div>
      </aside>

      {/* Formular-Pane */}
      <section className="relative flex items-center justify-center bg-[hsl(var(--brand-cream))] px-6 py-12 lg:px-16">
        <div className="w-full max-w-sm space-y-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück zur Startseite
          </Link>

          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-teal))]">
              <span className="h-1 w-6 rounded-full bg-[hsl(var(--brand-lime))]" />
              Anmelden
            </span>
            <h1 className="text-balance font-semibold leading-[1.05] tracking-[-0.02em] text-[clamp(2rem,3vw,2.5rem)]">
              Hallo, schön dass du da bist.
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Melde dich mit deiner dienstlichen E-Mail an. Noch keinen Zugang?
              Kurz beim Studio-Team melden.
            </p>
          </div>

          <LoginFormular weiter={weiter} fehler={fehler} />
        </div>
      </section>
    </main>
  );
}
