import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  GraduationCap,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { LoginFormular } from "./LoginFormular";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ weiter?: string; fehler?: string }>;
}) {
  const { weiter, fehler } = await searchParams;

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Branding-Pane */}
      <div className="brand-gradient relative hidden overflow-hidden lg:flex">
        <div className="bg-dot-pattern absolute inset-0 opacity-20" />
        <div
          className="blob -top-32 -right-32 h-96 w-96 opacity-40"
          style={{ backgroundColor: "hsl(var(--brand-pink))" }}
        />
        <div
          className="blob bottom-0 -left-32 h-80 w-80 opacity-30"
          style={{ backgroundColor: "white" }}
        />

        <div className="relative z-10 flex w-full flex-col justify-between p-12 text-white">
          <Link href="/" className="flex w-fit items-center gap-2 font-semibold">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-sm font-bold backdrop-blur">
              VA
            </span>
            <span>Vitness Academy</span>
          </Link>

          <div className="space-y-8">
            <div className="space-y-3">
              <h2 className="max-w-md text-3xl font-semibold leading-tight tracking-tight">
                Willkommen zurück.
                <br />
                Schön, dass du wieder da bist.
              </h2>
              <p className="max-w-md text-white/80">
                Melde dich mit deiner dienstlichen E-Mail an und mach da weiter,
                wo du aufgehört hast.
              </p>
            </div>

            <ul className="space-y-3 text-sm">
              <Vorteil
                icon={<GraduationCap className="h-4 w-4" />}
                text="Strukturierte Lernpfade für alle Bereiche"
              />
              <Vorteil
                icon={<HelpCircle className="h-4 w-4" />}
                text="Quizze mit sofortiger Auswertung"
              />
              <Vorteil
                icon={<CheckCircle2 className="h-4 w-4" />}
                text="Praxisfreigaben durch deine Führungskraft"
              />
            </ul>
          </div>

          <p className="text-xs text-white/60">
            © Vitness Academy · Interne Schulungsplattform
          </p>
        </div>
      </div>

      {/* Formular-Pane */}
      <div className="relative flex items-center justify-center bg-background px-4 py-12">
        <div
          className="blob -top-20 right-0 h-72 w-72 opacity-20 lg:hidden"
          style={{ backgroundColor: "hsl(var(--brand-violet))" }}
        />

        <div className="relative w-full max-w-sm space-y-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück zur Startseite
          </Link>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary">
              <Sparkles className="h-3 w-3" />
              Anmelden
            </span>
            <h1 className="text-3xl font-semibold tracking-tight">
              Hallo, schön dass du da bist.
            </h1>
            <p className="text-sm text-muted-foreground">
              Melde dich mit deiner dienstlichen E-Mail an. Noch keinen Zugang?
              Kurz beim Studio-Team melden.
            </p>
          </div>

          <LoginFormular weiter={weiter} fehler={fehler} />
        </div>
      </div>
    </main>
  );
}

function Vorteil({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
        {icon}
      </span>
      <span>{text}</span>
    </li>
  );
}
