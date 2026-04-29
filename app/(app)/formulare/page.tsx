import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import {
  ladeSubmissions,
  ladeTemplates,
  STATUS_LABEL,
} from "@/lib/formulare";
import { formatDatum } from "@/lib/format";

export default async function FormulareUebersichtPage() {
  const profile = await requireProfile();
  const [templates, meine] = await Promise.all([
    ladeTemplates({ nurAktiv: true }),
    ladeSubmissions({ submittedBy: profile.id }),
  ]);

  return (
    <div className="space-y-12">
      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))]">
          Studio
        </p>
        <h1 className="mt-3 text-balance font-semibold leading-[1.1] tracking-[-0.025em] text-[clamp(1.875rem,3vw,2.75rem)]">
          Formulare einreichen
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
          Krankmeldung, Urlaubsantrag, Schadensmeldung — was die Studioleitung
          gerade braucht.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">
          Verfügbare Formulare
        </h2>
        {templates.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            Aktuell sind keine Formulare aktiv.
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {templates.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/formulare/${t.slug}`}
                  className="group flex h-full items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-[hsl(var(--primary))] hover:shadow-[0_16px_40px_-20px_hsl(var(--primary)/0.3)]"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--brand-pink)/0.12)] text-[hsl(var(--brand-pink))]">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold leading-tight">{t.title}</p>
                    {t.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {t.description}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 self-center text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-[hsl(var(--primary))]" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {meine.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">
            Deine Einreichungen
          </h2>
          <ul className="overflow-hidden rounded-2xl border border-border bg-card">
            {meine.slice(0, 10).map((s, i) => (
              <li
                key={s.id}
                className={i > 0 ? "border-t border-border" : ""}
              >
                <div className="flex items-center gap-4 px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold leading-tight">
                      {s.template_title ?? "Formular"}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Eingereicht am {formatDatum(s.submitted_at)}
                      {s.admin_note && <> · Antwort: {s.admin_note}</>}
                    </p>
                  </div>
                  <span
                    className={
                      s.status === "erledigt"
                        ? "rounded-full bg-[hsl(var(--success)/0.15)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--success))]"
                        : s.status === "abgelehnt"
                        ? "rounded-full bg-[hsl(var(--destructive)/0.12)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--destructive))]"
                        : s.status === "in_bearbeitung"
                        ? "rounded-full bg-[hsl(var(--warning)/0.18)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--warning))]"
                        : "rounded-full bg-[hsl(var(--brand-pink)/0.12)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--brand-pink))]"
                    }
                  >
                    {STATUS_LABEL[s.status]}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
