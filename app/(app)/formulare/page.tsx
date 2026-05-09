import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Palmtree,
  Stethoscope,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { requireProfile } from "@/lib/auth";
import { ladeSubmissions, ladeTemplates, type Template } from "@/lib/formulare";
import { MeineAnfragenListe } from "@/components/formulare/MeineAnfragenListe";

const STANDARD_META: Record<
  string,
  { icon: typeof Stethoscope; tint: string }
> = {
  krankmeldung: {
    icon: Stethoscope,
    tint: "bg-rose-500/10 text-rose-600",
  },
  urlaubsantrag: {
    icon: Palmtree,
    tint: "bg-amber-500/10 text-amber-600",
  },
};

export default async function FormulareUebersichtPage() {
  const profile = await requireProfile();
  const [templates, meine] = await Promise.all([
    ladeTemplates({ nurAktiv: true }),
    ladeSubmissions({ submittedBy: profile.id }),
  ]);

  // Standard-3 prominent oben, Rest darunter
  const standardSlugs = Object.keys(STANDARD_META);
  const standard = standardSlugs
    .map((slug) => templates.find((t) => t.slug === slug))
    .filter((t): t is Template => Boolean(t));
  const weitere = templates.filter((t) => !standardSlugs.includes(t.slug));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Studio"
        title="Anfragen"
        description="Krankmeldung, Urlaub, Schicht-Tausch und weitere Anträge — schnell einreichen, Status hier verfolgen."
      />

      {/* Schnell-Anfragen */}
      {standard.length > 0 && (
        <section>
          <h2 className="text-[11px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--brand-pink))]">
            Schnell-Anfragen
          </h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {standard.map((t) => {
              const meta = STANDARD_META[t.slug];
              const Icon = meta.icon;
              return (
                <li key={t.id}>
                  <Link
                    href={`/formulare/${t.slug}`}
                    className="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-[hsl(var(--primary)/0.4)] hover:shadow-[0_16px_40px_-20px_hsl(var(--primary)/0.25)]"
                  >
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${meta.tint}`}
                    >
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <div>
                      <p className="text-base font-semibold leading-tight">
                        {t.title}
                      </p>
                      {t.description && (
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {t.description}
                        </p>
                      )}
                    </div>
                    <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-[hsl(var(--primary))]">
                      Anfrage starten
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Weitere Formulare */}
      {weitere.length > 0 && (
        <section>
          <h2 className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Weitere Formulare
          </h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {weitere.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/formulare/${t.slug}`}
                  className="group flex h-full items-start gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-[hsl(var(--brand-pink)/0.45)] hover:shadow-sm"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[hsl(var(--brand-pink)/0.12)] text-[hsl(var(--brand-pink))]">
                    <FileText className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold tracking-tight">
                      {t.title}
                    </p>
                    {t.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {t.description}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 self-center text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-[hsl(var(--brand-pink))]" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {standard.length === 0 && weitere.length === 0 && (
        <div className="rounded-2xl border border-border bg-card">
          <EmptyState
            title="Keine Formulare aktiv"
            description="Sobald die Studioleitung ein Formular freigibt, taucht es hier auf."
          />
        </div>
      )}

      {/* Eigene Einreichungen */}
      {meine.length > 0 && (
        <section>
          <h2 className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Deine Einreichungen
          </h2>
          <div className="mt-3">
            <MeineAnfragenListe submissions={meine.slice(0, 20)} />
          </div>
        </section>
      )}
    </div>
  );
}
