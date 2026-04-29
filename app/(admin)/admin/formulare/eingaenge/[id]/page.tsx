import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import {
  ladeSubmission,
  ladeTemplate,
  STATUS_LABEL,
  type SubmissionStatus,
} from "@/lib/formulare";
import { formatDatum } from "@/lib/format";
import { submissionStatusSetzen } from "../../actions";

export default async function EingangsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["fuehrungskraft", "admin", "superadmin"]);
  const { id } = await params;
  const s = await ladeSubmission(id);
  if (!s) notFound();
  const tpl = await ladeTemplate(s.template_id);

  const setStatus = (next: SubmissionStatus) =>
    submissionStatusSetzen.bind(null, id, next);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link
        href="/admin/formulare/eingaenge"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zu allen Eingängen
      </Link>

      <header className="space-y-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))]">
          Studio · Formulare
        </p>
        <h1 className="text-balance font-semibold leading-[1.1] tracking-[-0.025em] text-[clamp(1.875rem,3vw,2.5rem)]">
          {s.template_title ?? "Formular"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Eingereicht von <strong>{s.submitted_by_name ?? "—"}</strong> am{" "}
          {formatDatum(s.submitted_at)}
        </p>
        <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {STATUS_LABEL[s.status]}
        </span>
      </header>

      {/* Antworten */}
      <div className="space-y-3 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Antworten
        </h2>
        <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
          {(tpl?.fields ?? []).map((f) => {
            const wert = s.data[f.name];
            return (
              <div key={f.name}>
                <dt className="text-xs text-muted-foreground">{f.label}</dt>
                <dd className="mt-1 break-words text-sm font-medium">
                  {wert === null || wert === undefined || wert === ""
                    ? "—"
                    : wert === true
                    ? "Ja"
                    : wert === false
                    ? "Nein"
                    : String(wert)}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>

      {/* Status setzen */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Status setzen
        </h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {(
            [
              "eingereicht",
              "in_bearbeitung",
              "erledigt",
              "abgelehnt",
            ] as const
          ).map((next) => (
            <form key={next} action={setStatus(next)}>
              <input
                type="hidden"
                name="admin_note"
                value={s.admin_note ?? ""}
              />
              <button
                type="submit"
                disabled={next === s.status}
                className={
                  next === s.status
                    ? "w-full rounded-lg border-2 border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.06)] px-4 py-3 text-left text-sm font-medium opacity-60"
                    : "w-full rounded-lg border border-border bg-background px-4 py-3 text-left text-sm font-medium transition-colors hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.04)]"
                }
              >
                {STATUS_LABEL[next]}
                {next === s.status && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    aktuell
                  </span>
                )}
              </button>
            </form>
          ))}
        </div>

        {/* Notiz fuer den Mitarbeiter */}
        <form action={setStatus(s.status)} className="mt-6 space-y-3">
          <label htmlFor="admin_note" className="text-sm font-medium">
            Antwort / Notiz (für den Mitarbeiter sichtbar)
          </label>
          <textarea
            id="admin_note"
            name="admin_note"
            rows={3}
            defaultValue={s.admin_note ?? ""}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="z.B. „Genehmigt, gute Erholung!“"
          />
          <button
            type="submit"
            className="rounded-full bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)]"
          >
            Notiz speichern
          </button>
        </form>

        {s.processed_at && (
          <p className="mt-4 text-xs text-muted-foreground">
            Bearbeitet am {formatDatum(s.processed_at)}
            {s.processed_by_name && <> von {s.processed_by_name}</>}
          </p>
        )}
      </div>
    </div>
  );
}
