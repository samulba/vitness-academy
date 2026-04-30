import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/admin/StatusPill";
import { requireProfile } from "@/lib/auth";
import {
  ladeSubmissions,
  ladeTemplates,
  STATUS_LABEL,
  type SubmissionStatus,
} from "@/lib/formulare";
import { formatDatum } from "@/lib/format";

function StatusBadge({ status }: { status: SubmissionStatus }) {
  if (status === "erledigt")
    return <StatusPill ton="success">{STATUS_LABEL[status]}</StatusPill>;
  if (status === "abgelehnt")
    return <StatusPill ton="danger">{STATUS_LABEL[status]}</StatusPill>;
  if (status === "in_bearbeitung")
    return <StatusPill ton="warn">{STATUS_LABEL[status]}</StatusPill>;
  return (
    <StatusPill ton="primary" dot>
      {STATUS_LABEL[status]}
    </StatusPill>
  );
}

export default async function FormulareUebersichtPage() {
  const profile = await requireProfile();
  const [templates, meine] = await Promise.all([
    ladeTemplates({ nurAktiv: true }),
    ladeSubmissions({ submittedBy: profile.id }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Studio"
        title="Formulare einreichen"
        description="Krankmeldung, Urlaubsantrag, Schadensmeldung — was die Studioleitung gerade braucht."
      />

      <section className="space-y-2">
        <header>
          <h2 className="text-[14px] font-semibold tracking-tight">
            Verfügbare Formulare
          </h2>
        </header>
        {templates.length === 0 ? (
          <div className="rounded-xl border border-border bg-card">
            <EmptyState
              title="Keine Formulare aktiv"
              description="Sobald die Studioleitung ein Formular freigibt, taucht es hier auf."
            />
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {templates.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/formulare/${t.slug}`}
                  className="group flex h-full items-start gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-[hsl(var(--brand-pink)/0.45)] hover:shadow-sm"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[hsl(var(--brand-pink)/0.12)] text-[hsl(var(--brand-pink))]">
                    <FileText className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold tracking-tight">
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
        )}
      </section>

      {meine.length > 0 && (
        <section className="space-y-2">
          <header>
            <h2 className="text-[14px] font-semibold tracking-tight">
              Deine Einreichungen
            </h2>
          </header>
          <ul className="overflow-hidden rounded-xl border border-border bg-card">
            {meine.slice(0, 10).map((s, i) => (
              <li key={s.id} className={i > 0 ? "border-t border-border" : ""}>
                <div className="flex items-center gap-4 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium leading-tight">
                      {s.template_title ?? "Formular"}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      Eingereicht am {formatDatum(s.submitted_at)}
                      {s.admin_note && <> · Antwort: {s.admin_note}</>}
                    </p>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
