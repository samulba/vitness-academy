import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Printer,
  Trash2,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import {
  ladeProtokoll,
  ladeTemplateMitSections,
} from "@/lib/putzprotokoll";
import { formatDatum } from "@/lib/format";
import { ProtokollSectionsAnzeige } from "@/components/putzprotokoll/ProtokollSectionsAnzeige";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/admin/StatusPill";
import { ColoredAvatar } from "@/components/admin/ColoredAvatar";
import { PutzprotokolleNav } from "@/components/admin/PutzprotokolleNav";
import { protokollLoeschen, protokollReviewen } from "../actions";

export const dynamic = "force-dynamic";

export default async function ProtokollDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["fuehrungskraft", "admin", "superadmin"]);
  const { id } = await params;
  const protokoll = await ladeProtokoll(id);
  if (!protokoll) notFound();

  // Original-Aufgabenliste pro Section fuer "alle Aufgaben"-Anzeige
  const tpl = await ladeTemplateMitSections(protokoll.location_id);
  const aufgabenMap = new Map<string, string[]>();
  if (tpl) {
    for (const s of tpl.sections) aufgabenMap.set(s.id, s.aufgaben);
  }

  const submittedAt = new Date(protokoll.submitted_at);
  const reviewedAction = protokollReviewen.bind(null, protokoll.id);
  const loeschenAction = protokollLoeschen.bind(null, protokoll.id);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/putzprotokolle"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zu allen Protokollen
      </Link>

      <PutzprotokolleNav />

      {/* Hero */}
      <header className="rounded-2xl border border-border bg-card p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <ColoredAvatar
              name={protokoll.submitted_by_name ?? "?"}
              size="md"
            />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))]">
                Putzprotokoll
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                {formatDatum(protokoll.datum)} · {protokoll.location_name ?? "—"}
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Eingereicht von{" "}
                <span className="font-medium text-foreground">
                  {protokoll.submitted_by_name ?? "Mitarbeiter:in"}
                </span>{" "}
                · <Clock className="-mt-0.5 inline h-3.5 w-3.5" />{" "}
                {submittedAt.toLocaleTimeString("de-DE", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                Uhr
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {protokoll.status === "reviewed" ? (
              <StatusPill ton="success">Reviewed</StatusPill>
            ) : (
              <StatusPill ton="warn">Offen</StatusPill>
            )}
            <Link
              href={`/putzprotokoll/${protokoll.id}/print`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
            >
              <Printer className="h-3.5 w-3.5" />
              Drucken / PDF
            </Link>
          </div>
        </div>

        {protokoll.status === "reviewed" && protokoll.reviewed_at && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-[hsl(var(--success)/0.3)] bg-[hsl(var(--success)/0.05)] p-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--success))]" />
            <div className="flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--success))]">
                Reviewed
              </p>
              <p className="text-xs text-muted-foreground">
                Von{" "}
                <span className="font-medium text-foreground">
                  {protokoll.reviewed_by_name ?? "Studioleitung"}
                </span>{" "}
                am{" "}
                {new Date(protokoll.reviewed_at).toLocaleString("de-DE", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </p>
              {protokoll.review_note && (
                <p className="mt-1.5 whitespace-pre-wrap text-sm">
                  {protokoll.review_note}
                </p>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Sections */}
      <ProtokollSectionsAnzeige
        protokoll={protokoll}
        alleAufgabenProSection={aufgabenMap}
      />

      {/* Review-Form */}
      {protokoll.status === "eingereicht" && (
        <form
          action={reviewedAction}
          className="rounded-2xl border border-border bg-card p-5 sm:p-6"
        >
          <h2 className="text-base font-semibold tracking-tight">
            Als reviewed markieren
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Optional: Notiz an die Frühschicht (z.B. &bdquo;Gut gemacht, danke&ldquo;)
          </p>
          <textarea
            name="review_note"
            rows={2}
            placeholder="Optionale Notiz …"
            className="mt-3 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:border-[hsl(var(--primary)/0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary)/0.15)]"
          />
          <div className="mt-3 flex items-center gap-2">
            <Button
              type="submit"
              className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)]"
            >
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              Als reviewed markieren
            </Button>
          </div>
        </form>
      )}

      {/* Danger-Zone */}
      <details className="rounded-xl border border-border bg-card p-4">
        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Gefahrenzone
        </summary>
        <form action={loeschenAction} className="mt-3">
          <p className="text-xs text-muted-foreground">
            Protokoll endgültig löschen (alle Photos werden im Storage
            gelassen, müssen ggf. separat aufgeräumt werden).
          </p>
          <button
            type="submit"
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-[hsl(var(--destructive)/0.4)] bg-background px-3 py-1.5 text-xs font-medium text-[hsl(var(--destructive))] transition-colors hover:bg-[hsl(var(--destructive)/0.08)]"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Löschen
          </button>
        </form>
      </details>
    </div>
  );
}
