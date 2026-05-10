import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatusPill } from "@/components/admin/StatusPill";
import { requirePermission } from "@/lib/auth";
import {
  istFileWert,
  istVertretungsPlan,
  ladeSubmission,
  ladeTemplate,
  STATUS_LABEL,
  type SubmissionStatus,
} from "@/lib/formulare";
import { formatDatum } from "@/lib/format";
import { DownloadLink } from "@/components/formulare/DownloadLink";
import { VertretungsPlanTabelle } from "@/components/formulare/VertretungsPlanTabelle";
import { submissionStatusSetzen } from "../../actions";

function StatusBadge({ status }: { status: SubmissionStatus }) {
  if (status === "eingereicht")
    return (
      <StatusPill ton="primary" dot>
        {STATUS_LABEL[status]}
      </StatusPill>
    );
  if (status === "in_bearbeitung")
    return <StatusPill ton="warn">{STATUS_LABEL[status]}</StatusPill>;
  if (status === "erledigt")
    return <StatusPill ton="success">{STATUS_LABEL[status]}</StatusPill>;
  return <StatusPill ton="neutral">{STATUS_LABEL[status]}</StatusPill>;
}

export default async function EingangsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("formulare", "view");
  const { id } = await params;
  const s = await ladeSubmission(id);
  if (!s) notFound();
  const tpl = await ladeTemplate(s.template_id);

  const setStatus = (next: SubmissionStatus) =>
    submissionStatusSetzen.bind(null, id, next);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Verwaltung", href: "/admin" },
          { label: "Formulare", href: "/admin/formulare" },
          { label: "Eingänge", href: "/admin/formulare/eingaenge" },
          { label: s.template_title ?? "Eingang" },
        ]}
        eyebrow="Einreichung"
        title={s.template_title ?? "Formular"}
        description={`Eingereicht von ${s.submitted_by_name ?? "—"} am ${formatDatum(s.submitted_at)}.`}
        meta={<StatusBadge status={s.status} />}
      />

      {/* Antworten */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-[14px] font-semibold tracking-tight">
            Antworten
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Was die Person ausgefüllt hat.
          </p>
        </div>
        <dl className="grid gap-x-6 gap-y-4 p-5 sm:grid-cols-2">
          {(tpl?.fields ?? []).map((f) => {
            const wert = s.data[f.name];
            const istDatei = f.type === "file" || istFileWert(wert);
            const istPlan =
              f.type === "vertretungs_plan" && istVertretungsPlan(wert);
            return (
              <div
                key={f.name}
                className={istPlan ? "sm:col-span-2" : undefined}
              >
                <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {f.label}
                </dt>
                <dd className="mt-1 break-words text-[13px] font-medium">
                  {istPlan ? (
                    <VertretungsPlanTabelle eintraege={wert} />
                  ) : istDatei ? (
                    istFileWert(wert) ? (
                      <DownloadLink wert={wert} />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )
                  ) : wert === null || wert === undefined || wert === "" ? (
                    "—"
                  ) : wert === true ? (
                    "Ja"
                  ) : wert === false ? (
                    "Nein"
                  ) : (
                    String(wert)
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>

      {/* Status setzen */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-[14px] font-semibold tracking-tight">
            Status setzen
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Mit Notiz, die der Mitarbeiter sieht.
          </p>
        </div>
        <div className="space-y-5 p-5">
          <div className="grid gap-2 sm:grid-cols-2">
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
                      ? "w-full rounded-md border border-[hsl(var(--brand-pink)/0.4)] bg-[hsl(var(--brand-pink)/0.06)] px-3 py-2 text-left text-[13px] font-medium opacity-70"
                      : "w-full rounded-md border border-border bg-background px-3 py-2 text-left text-[13px] font-medium transition-colors hover:border-[hsl(var(--brand-pink)/0.4)] hover:bg-muted/40"
                  }
                >
                  {STATUS_LABEL[next]}
                  {next === s.status && (
                    <span className="ml-1.5 text-[11px] text-muted-foreground">
                      · aktuell
                    </span>
                  )}
                </button>
              </form>
            ))}
          </div>

          {/* Notiz */}
          <form action={setStatus(s.status)} className="space-y-2">
            <label
              htmlFor="admin_note"
              className="text-[12px] font-medium text-muted-foreground"
            >
              Antwort / Notiz (für den Mitarbeiter sichtbar)
            </label>
            <textarea
              id="admin_note"
              name="admin_note"
              rows={3}
              defaultValue={s.admin_note ?? ""}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] focus-visible:border-[hsl(var(--ring))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="z.B. „Genehmigt, gute Erholung!"
            />
            <div className="flex justify-end">
              <Button type="submit" variant="primary">
                Notiz speichern
              </Button>
            </div>
          </form>

          {s.processed_at && (
            <p className="text-xs text-muted-foreground">
              Bearbeitet am {formatDatum(s.processed_at)}
              {s.processed_by_name && <> von {s.processed_by_name}</>}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
