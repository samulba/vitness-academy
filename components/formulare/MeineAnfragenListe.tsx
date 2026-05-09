"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  MessageCircle,
  Palmtree,
  Stethoscope,
  User,
  X,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusPill, type PillTon } from "@/components/admin/StatusPill";
import { formatDatum, formatDatumUhrzeitBerlin } from "@/lib/format";
import {
  istFileWert,
  istVertretungsPlan,
  STATUS_LABEL,
  type FormField,
  type Submission,
  type SubmissionStatus,
  type VertretungsTag,
} from "@/lib/formulare-types";

const STATUS_TON: Record<SubmissionStatus, PillTon> = {
  eingereicht: "primary",
  in_bearbeitung: "warn",
  erledigt: "success",
  abgelehnt: "danger",
};

const SLUG_VISUAL: Record<
  string,
  { icon: typeof Stethoscope; tint: string }
> = {
  krankmeldung: {
    icon: Stethoscope,
    tint: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  },
  urlaubsantrag: {
    icon: Palmtree,
    tint: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
};

const FALLBACK_VISUAL = {
  icon: ClipboardList,
  tint: "bg-[hsl(var(--brand-pink)/0.12)] text-[hsl(var(--brand-pink))]",
};

function visualFor(slug: string | null) {
  if (slug && SLUG_VISUAL[slug]) return SLUG_VISUAL[slug];
  return FALLBACK_VISUAL;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Sucht in den Submission-Daten nach Feldern vom Typ "date" und
 * extrahiert daraus einen Datumsbereich (min..max bei mehreren) oder
 * ein einzelnes Datum. Fallback: null -- Page faellt dann auf
 * submitted_at zurueck.
 */
function datumsbereich(
  fields: FormField[],
  data: Record<string, unknown>,
): { von: string; bis: string | null } | null {
  const dateFelder = fields.filter((f) => f.type === "date");
  const werte: string[] = [];
  for (const f of dateFelder) {
    const v = data[f.name];
    if (typeof v === "string" && ISO_DATE.test(v)) werte.push(v);
  }
  if (werte.length === 0) return null;
  if (werte.length === 1) return { von: werte[0], bis: null };
  const sortiert = [...werte].sort();
  return { von: sortiert[0], bis: sortiert[sortiert.length - 1] };
}

/**
 * Liste der eigenen Anfragen mit Klick-Detail-Dialog. Wird auf
 * `/dashboard` (nur offene Anfragen, kompakt) und `/formulare`
 * ("Deine Einreichungen", alle Status) verwendet.
 *
 * Visuell: pro Anfrage eine Card mit Icon-Box (slug-spezifisch),
 * Titel, Datumsbereich (falls Template Datumsfelder hatte, sonst
 * Eingangsdatum) und Status-Pill. Hover-Lift + Magenta-Border.
 */
export function MeineAnfragenListe({
  submissions,
}: {
  submissions: Submission[];
}) {
  const [offen, setOffen] = useState<Submission | null>(null);

  if (submissions.length === 0) return null;

  return (
    <>
      <ul className="select-none space-y-2 sm:space-y-2.5">
        {submissions.map((s) => {
          const v = visualFor(s.template_slug);
          const Icon = v.icon;
          const range = datumsbereich(s.template_fields, s.data);
          const ton = STATUS_TON[s.status];
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => setOffen(s)}
                className="group relative flex w-full items-center gap-3 overflow-hidden rounded-xl border border-border bg-card p-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-[hsl(var(--primary)/0.45)] hover:shadow-[0_12px_32px_-16px_hsl(var(--primary)/0.25)] sm:gap-4 sm:p-4"
              >
                {/* Severity-Leiste links je nach Status */}
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-0 top-0 h-full w-1",
                    s.status === "abgelehnt"
                      ? "bg-[hsl(var(--destructive))]"
                      : s.status === "erledigt"
                        ? "bg-[hsl(var(--success))]"
                        : s.status === "in_bearbeitung"
                          ? "bg-amber-500"
                          : "bg-[hsl(var(--brand-pink))]",
                  )}
                />
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11",
                    v.tint,
                  )}
                >
                  <Icon className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold leading-tight sm:text-[15px]">
                    {s.template_title ?? "Anfrage"}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground sm:text-xs">
                    {range
                      ? range.bis
                        ? `${formatDatum(range.von)} – ${formatDatum(range.bis)}`
                        : formatDatum(range.von)
                      : `Eingereicht am ${formatDatum(s.submitted_at)}`}
                  </p>
                </div>
                <StatusPill
                  ton={ton}
                  dot={s.status === "eingereicht"}
                  className="shrink-0"
                >
                  {STATUS_LABEL[s.status]}
                </StatusPill>
              </button>
            </li>
          );
        })}
      </ul>

      {offen && (
        <SubmissionDetailDialog
          submission={offen}
          onClose={() => setOffen(null)}
        />
      )}
    </>
  );
}

/* -------------------------------------------------------------------- */
/* Detail-Dialog: zeigt alle Submission-Daten mit Field-Labels         */
/* -------------------------------------------------------------------- */

function SubmissionDetailDialog({
  submission: s,
  onClose,
}: {
  submission: Submission;
  onClose: () => void;
}) {
  // Esc-Key + Body-Scroll-Lock
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const v = visualFor(s.template_slug);
  const Icon = v.icon;
  const ton = STATUS_TON[s.status];
  const range = datumsbereich(s.template_fields, s.data);

  // Felder mit Wert auflisten (in Template-Reihenfolge)
  const eintraege = s.template_fields
    .map((f) => ({ field: f, wert: s.data[f.name] }))
    .filter(({ wert }) => !istLeer(wert));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="submission-dialog-title"
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-end justify-center bg-[hsl(var(--brand-ink)/0.55)] p-0 backdrop-blur-sm sm:items-center sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-2xl sm:max-w-lg sm:rounded-2xl"
      >
        {/* Header */}
        <div className="flex items-start gap-3 border-b border-border px-5 py-4 sm:px-6 sm:py-5">
          <span
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
              v.tint,
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <h2
              id="submission-dialog-title"
              className="select-text truncate text-[15px] font-semibold leading-tight sm:text-base"
            >
              {s.template_title ?? "Anfrage"}
            </h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <StatusPill ton={ton} dot={s.status === "eingereicht"}>
                {STATUS_LABEL[s.status]}
              </StatusPill>
              <span className="text-[11px] text-muted-foreground">
                {formatDatumUhrzeitBerlin(s.submitted_at)}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="-m-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body (scrollable) */}
        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
          {/* Datumsbereich prominent (falls vorhanden) */}
          {range && (
            <div className="select-none rounded-xl border border-border bg-muted/40 px-4 py-3">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {range.bis ? "Zeitraum" : "Datum"}
              </div>
              <p className="mt-1 select-text font-mono text-[15px] font-semibold tabular-nums">
                {range.bis
                  ? `${formatDatum(range.von)} – ${formatDatum(range.bis)}`
                  : formatDatum(range.von)}
              </p>
            </div>
          )}

          {/* Felder */}
          {eintraege.length > 0 && (
            <dl className="mt-4 divide-y divide-border">
              {eintraege.map(({ field, wert }) => (
                <FeldZeile key={field.name} field={field} wert={wert} />
              ))}
            </dl>
          )}

          {/* Admin-Note */}
          {s.admin_note && s.admin_note.trim().length > 0 && (
            <div
              className={cn(
                "mt-4 rounded-xl border px-4 py-3",
                s.status === "abgelehnt"
                  ? "border-[hsl(var(--destructive)/0.35)] bg-[hsl(var(--destructive)/0.05)]"
                  : s.status === "erledigt"
                    ? "border-[hsl(var(--success)/0.35)] bg-[hsl(var(--success)/0.05)]"
                    : "border-[hsl(var(--brand-pink)/0.3)] bg-[hsl(var(--brand-pink)/0.05)]",
              )}
            >
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {s.status === "abgelehnt" ? (
                  <XCircle className="h-3 w-3" />
                ) : s.status === "erledigt" ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <MessageCircle className="h-3 w-3" />
                )}
                Antwort der Studioleitung
              </div>
              <p className="mt-1.5 select-text whitespace-pre-wrap text-sm leading-relaxed">
                {s.admin_note}
              </p>
            </div>
          )}

          {/* Meta-Footer */}
          <div className="mt-4 space-y-1.5 text-[11px] text-muted-foreground">
            {s.processed_at && s.processed_by_name && (
              <p className="flex items-center gap-1.5">
                <User className="h-3 w-3" />
                Bearbeitet von {s.processed_by_name} ·{" "}
                <span className="tabular-nums">
                  {formatDatumUhrzeitBerlin(s.processed_at)}
                </span>
              </p>
            )}
            <p className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              Eingereicht am{" "}
              <span className="tabular-nums">
                {formatDatumUhrzeitBerlin(s.submitted_at)}
              </span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-background/60 px-5 py-3 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-full items-center justify-center rounded-lg border border-border bg-background text-sm font-medium transition-colors hover:bg-muted sm:w-auto sm:px-5"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}

function istLeer(v: unknown): boolean {
  if (v === null || v === undefined) return true;
  if (typeof v === "string" && v.trim().length === 0) return true;
  if (Array.isArray(v) && v.length === 0) return true;
  return false;
}

function FeldZeile({ field, wert }: { field: FormField; wert: unknown }) {
  return (
    <div className="select-none py-3 first:pt-0 last:pb-0">
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {field.label}
      </dt>
      <dd className="mt-1 select-text text-sm leading-relaxed">
        <FeldWert field={field} wert={wert} />
      </dd>
    </div>
  );
}

function FeldWert({ field, wert }: { field: FormField; wert: unknown }) {
  if (field.type === "date" && typeof wert === "string" && ISO_DATE.test(wert)) {
    return (
      <span className="font-mono tabular-nums">{formatDatum(wert)}</span>
    );
  }
  if (field.type === "checkbox") {
    return <span>{wert ? "Ja" : "Nein"}</span>;
  }
  if (field.type === "file" && istFileWert(wert)) {
    return (
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        <FileText className="h-3 w-3" />
        {wert.name}
      </span>
    );
  }
  if (field.type === "vertretungs_plan" && istVertretungsPlan(wert)) {
    return <VertretungsPlanCompact eintraege={wert} />;
  }
  if (field.type === "textarea" && typeof wert === "string") {
    return <span className="whitespace-pre-wrap">{wert}</span>;
  }
  if (typeof wert === "string" || typeof wert === "number") {
    return <span>{wert}</span>;
  }
  // Fallback fuer unerwartete Shapes
  return (
    <span className="text-muted-foreground">{JSON.stringify(wert)}</span>
  );
}

function VertretungsPlanCompact({
  eintraege,
}: {
  eintraege: VertretungsTag[];
}) {
  // Pauschal-Mode: ein Eintrag mit tag = ""
  if (eintraege.length === 1 && eintraege[0].tag === "") {
    return <span>{eintraege[0].person}</span>;
  }
  return (
    <ul className="space-y-1 text-xs">
      {eintraege.map((e) => (
        <li key={e.tag} className="flex items-center justify-between gap-3">
          <span className="font-mono tabular-nums text-muted-foreground">
            {formatDatum(e.tag)}
          </span>
          <span className="truncate text-right">
            {e.frei ? (
              <span className="text-muted-foreground italic">arbeitsfrei</span>
            ) : (
              e.person || (
                <span className="text-muted-foreground italic">offen</span>
              )
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
