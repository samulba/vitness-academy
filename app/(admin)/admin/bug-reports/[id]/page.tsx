import { notFound } from "next/navigation";
import { AlertOctagon } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatusPill } from "@/components/admin/StatusPill";
import { LoeschenButton } from "@/components/admin/LoeschenButton";
import { requirePermission } from "@/lib/auth";
import {
  BUG_KATEGORIE_LABEL,
  BUG_PRIORITAET_LABEL,
  BUG_QUELLE_LABEL,
  BUG_STATUS_LABEL,
  ladeBugReport,
  screenshotSignedUrl,
  type BugPrioritaet,
  type BugStatus,
} from "@/lib/bug-reports";
import { formatDatum } from "@/lib/format";
import {
  bugLoeschen,
  bugNotizSpeichern,
  bugPrioritaetSetzen,
  bugStatusSetzen,
} from "@/app/(app)/bug-reports/actions";

const STATUS_LISTE: BugStatus[] = [
  "neu",
  "in_bearbeitung",
  "behoben",
  "verworfen",
  "duplikat",
];
const PRIO_LISTE: BugPrioritaet[] = ["niedrig", "normal", "hoch", "kritisch"];

function StatusBadge({ status }: { status: BugStatus }) {
  const ton =
    status === "neu"
      ? "warn"
      : status === "in_bearbeitung"
        ? "info"
        : status === "behoben"
          ? "success"
          : "neutral";
  return (
    <StatusPill ton={ton} dot={status === "neu" || status === "in_bearbeitung"}>
      {BUG_STATUS_LABEL[status]}
    </StatusPill>
  );
}

export default async function BugReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("bug_reports", "view");
  const { id } = await params;
  const b = await ladeBugReport(id);
  if (!b) notFound();

  const screenshotUrl = await screenshotSignedUrl(b.screenshot_path);

  const setStatus = (next: BugStatus) => bugStatusSetzen.bind(null, id, next);
  const setPrio = (next: BugPrioritaet) =>
    bugPrioritaetSetzen.bind(null, id, next);
  const notizSpeichern = bugNotizSpeichern.bind(null, id);
  const loeschen = bugLoeschen.bind(null, id);

  const titel =
    b.beschreibung && b.beschreibung.length > 0
      ? b.beschreibung.slice(0, 80)
      : (b.fehler_message ?? "(ohne Titel)").slice(0, 80);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Verwaltung", href: "/admin" },
          { label: "Bug-Reports", href: "/admin/bug-reports" },
          { label: titel },
        ]}
        eyebrow={BUG_QUELLE_LABEL[b.quelle]}
        title={titel}
        description={`Gemeldet am ${formatDatum(b.created_at)}${b.reported_by_name ? ` von ${b.reported_by_name}` : ""}.`}
        meta={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={b.status} />
            <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {BUG_PRIORITAET_LABEL[b.prioritaet]}
            </span>
            <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {BUG_KATEGORIE_LABEL[b.kategorie]}
            </span>
            {b.meldungen_count > 1 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--brand-pink)/0.15)] px-2.5 py-1 text-[10px] font-bold text-[hsl(var(--brand-pink))]">
                <AlertOctagon className="h-3 w-3" />
                {b.meldungen_count}× gemeldet
              </span>
            )}
          </div>
        }
      />

      {/* Technische Details bei Popup-Meldung */}
      {b.quelle === "error_popup" && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Technischer Kontext
          </h2>
          <dl className="mt-3 space-y-2 text-sm">
            {b.pfad && (
              <div className="flex flex-wrap gap-2">
                <dt className="w-24 shrink-0 text-xs text-muted-foreground">
                  Pfad
                </dt>
                <dd className="font-mono text-xs break-all">{b.pfad}</dd>
              </div>
            )}
            {b.error_digest && (
              <div className="flex flex-wrap gap-2">
                <dt className="w-24 shrink-0 text-xs text-muted-foreground">
                  Digest
                </dt>
                <dd className="font-mono text-xs break-all">
                  {b.error_digest}
                </dd>
              </div>
            )}
            {b.user_agent && (
              <div className="flex flex-wrap gap-2">
                <dt className="w-24 shrink-0 text-xs text-muted-foreground">
                  User-Agent
                </dt>
                <dd className="text-xs break-words text-muted-foreground">
                  {b.user_agent}
                </dd>
              </div>
            )}
            {b.fehler_message && (
              <div>
                <dt className="text-xs text-muted-foreground">
                  Fehlermeldung
                </dt>
                <dd className="mt-1">
                  <pre className="max-h-32 overflow-auto whitespace-pre-wrap break-words rounded-md border border-border bg-muted/40 px-3 py-2 text-[11px] font-mono leading-relaxed">
                    {b.fehler_message}
                  </pre>
                </dd>
              </div>
            )}
            {b.fehler_stack && (
              <div>
                <dt className="text-xs text-muted-foreground">Stack-Trace</dt>
                <dd className="mt-1">
                  <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-md border border-border bg-muted/40 px-3 py-2 text-[10px] font-mono leading-relaxed text-muted-foreground">
                    {b.fehler_stack}
                  </pre>
                </dd>
              </div>
            )}
            <div className="flex flex-wrap gap-2 pt-1">
              <dt className="w-24 shrink-0 text-xs text-muted-foreground">
                Zuletzt gemeldet
              </dt>
              <dd className="text-xs">
                {formatDatum(b.letzte_meldung_at)}
              </dd>
            </div>
          </dl>
        </div>
      )}

      {/* Manuelle Beschreibung */}
      {b.quelle === "manuell" && b.beschreibung && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Beschreibung
          </p>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">
            {b.beschreibung}
          </p>
          {b.pfad && (
            <p className="mt-3 text-xs text-muted-foreground">
              Pfad: <span className="font-mono">{b.pfad}</span>
            </p>
          )}
        </div>
      )}

      {/* Beschreibung vom User auch bei Popup-Meldung anzeigen */}
      {b.quelle === "error_popup" && b.beschreibung && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Beschreibung vom Melder
          </p>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">
            {b.beschreibung}
          </p>
        </div>
      )}

      {/* Screenshot */}
      {screenshotUrl && (
        <a
          href={screenshotUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block overflow-hidden rounded-2xl border border-border bg-muted"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={screenshotUrl} alt="Screenshot" className="w-full object-cover" />
        </a>
      )}

      {/* Status setzen */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Status setzen
        </h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {STATUS_LISTE.map((s) => (
            <form key={s} action={setStatus(s)}>
              <button
                type="submit"
                disabled={s === b.status}
                className={
                  s === b.status
                    ? "w-full rounded-lg border-2 border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.06)] px-3 py-2 text-left text-sm font-medium opacity-60"
                    : "w-full rounded-lg border border-border bg-background px-3 py-2 text-left text-sm font-medium transition-colors hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.04)]"
                }
              >
                {BUG_STATUS_LABEL[s]}
                {s === b.status && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    aktuell
                  </span>
                )}
              </button>
            </form>
          ))}
        </div>
      </div>

      {/* Priorität setzen */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Priorität
        </h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-4">
          {PRIO_LISTE.map((p) => (
            <form key={p} action={setPrio(p)}>
              <button
                type="submit"
                disabled={p === b.prioritaet}
                className={
                  p === b.prioritaet
                    ? "w-full rounded-lg border-2 border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.06)] px-3 py-2 text-left text-sm font-medium opacity-60"
                    : "w-full rounded-lg border border-border bg-background px-3 py-2 text-left text-sm font-medium transition-colors hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.04)]"
                }
              >
                {BUG_PRIORITAET_LABEL[p]}
              </button>
            </form>
          ))}
        </div>
      </div>

      {/* Admin-Notiz */}
      <form
        action={notizSpeichern}
        className="space-y-3 rounded-2xl border border-border bg-card p-6"
      >
        <label htmlFor="admin_notiz" className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Admin-Notiz
        </label>
        <textarea
          id="admin_notiz"
          name="admin_notiz"
          rows={4}
          defaultValue={b.admin_notiz ?? ""}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="z.B. „Reproduzierbar in Safari, vermutlich CSS-Bug im Modal"
        />
        <button
          type="submit"
          className="rounded-full bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)]"
        >
          Notiz speichern
        </button>
      </form>

      {b.resolved_at && (
        <p className="text-xs text-muted-foreground">
          Erledigt am {formatDatum(b.resolved_at)}
        </p>
      )}

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold">Eintrag löschen</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Inkl. Screenshot. Kann nicht rückgängig gemacht werden.
        </p>
        <div className="mt-4">
          <LoeschenButton
            action={loeschen}
            label="Bug-Report endgültig löschen"
            bestaetigung="Diesen Bug-Report wirklich löschen?"
          />
        </div>
      </div>
    </div>
  );
}
