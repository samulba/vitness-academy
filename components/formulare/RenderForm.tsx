"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CalendarPlus,
  CalendarRange,
  Check,
  Paperclip,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitOverlay } from "@/components/ui/submit-overlay";
import { cn } from "@/lib/utils";
import { formatDatum } from "@/lib/format";
import { taglistVonBis, wochentagKurz } from "@/lib/datum";
import type { FormField } from "@/lib/formulare";
import {
  submissionAnlegen,
  type Ergebnis,
} from "@/app/(app)/formulare/actions";

export function RenderForm({
  fields,
  templateSlug,
}: {
  fields: FormField[];
  templateSlug: string;
}) {
  const action = submissionAnlegen.bind(null, templateSlug);
  const [state, runAction, pending] = useActionState<
    Ergebnis | null,
    FormData
  >(async (_prev, fd) => action(fd), null);

  const errors = state && !state.ok ? state.errors ?? {} : {};
  const message = state && !state.ok ? state.message : null;

  // Sammle alle Date-Field-Namen die von einem vertretungs_plan via
  // linked_dates referenziert werden — fuer DIE muessen wir
  // controlled-state fuehren, damit der Plan-Renderer die aktuellen
  // Werte direkt aus React bekommt (statt unzuverlaessigem DOM-Polling).
  const trackedDateNames = useMemo(() => {
    const set = new Set<string>();
    for (const f of fields) {
      if (f.type === "vertretungs_plan") {
        const ld = f.linked_dates ?? { from: "von", to: "bis" };
        set.add(ld.from);
        set.add(ld.to);
      }
    }
    return set;
  }, [fields]);

  const [trackedValues, setTrackedValues] = useState<Record<string, string>>(
    {},
  );

  function setTracked(name: string, value: string) {
    setTrackedValues((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <form action={runAction} className="space-y-6">
      <SubmitOverlay pending={pending} message="Wird eingereicht …" />
      {fields.map((f) => (
        <FieldRenderer
          key={f.name}
          field={f}
          error={errors[f.name]}
          trackedDateNames={trackedDateNames}
          trackedValues={trackedValues}
          setTracked={setTracked}
        />
      ))}

      {message && (
        <p className="inline-flex items-center gap-2 rounded-lg border border-[hsl(var(--destructive)/0.3)] bg-[hsl(var(--destructive)/0.08)] px-3 py-2 text-xs font-medium text-[hsl(var(--destructive))]">
          <AlertCircle className="h-3.5 w-3.5" />
          {message}
        </p>
      )}

      <div className="flex items-center gap-3 border-t border-border pt-5">
        <Button
          type="submit"
          disabled={pending}
          className="bg-[hsl(var(--primary))] px-6 py-2.5 text-[hsl(var(--primary-foreground))] shadow-[0_8px_24px_-6px_hsl(var(--primary)/0.55)] transition-all hover:bg-[hsl(var(--primary)/0.9)] hover:shadow-[0_16px_40px_-10px_hsl(var(--primary)/0.7)]"
        >
          {pending ? "Sende …" : "Absenden"}
        </Button>
      </div>
    </form>
  );
}

function FieldRenderer({
  field: f,
  error,
  trackedDateNames,
  trackedValues,
  setTracked,
}: {
  field: FormField;
  error?: string;
  trackedDateNames: Set<string>;
  trackedValues: Record<string, string>;
  setTracked: (name: string, value: string) => void;
}) {
  const required = f.required;

  // Checkbox bekommt Card-Toggle-Look, NICHT die Standard Label-oben Struktur
  if (f.type === "checkbox") {
    return (
      <CheckboxCard field={f} error={error} />
    );
  }

  // File bekommt eine eigene Drop-Zone-Optik
  if (f.type === "file") {
    return <FileDropzone field={f} error={error} />;
  }

  // Vertretungs-Plan: pro Tag im verlinkten Datum-Range eine Reihe
  if (f.type === "vertretungs_plan") {
    return (
      <VertretungsPlanRenderer
        field={f}
        error={error}
        trackedValues={trackedValues}
      />
    );
  }

  const labelEl = (
    <Label htmlFor={f.name} className="text-sm font-medium">
      {f.label}
      {required && <span className="ml-1 text-[hsl(var(--destructive))]">*</span>}
    </Label>
  );

  let input: React.ReactNode;
  if (f.type === "textarea") {
    input = (
      <textarea
        id={f.name}
        name={f.name}
        required={required}
        placeholder={f.placeholder}
        rows={4}
        className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 shadow-sm transition-colors focus-visible:border-[hsl(var(--primary)/0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary)/0.15)]"
      />
    );
  } else if (f.type === "select") {
    input = (
      <select
        id={f.name}
        name={f.name}
        required={required}
        defaultValue=""
        className="h-11 w-full rounded-lg border border-input bg-background px-3.5 transition-colors focus-visible:border-[hsl(var(--primary)/0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary)/0.15)]"
      >
        <option value="">— bitte wählen —</option>
        {(f.options ?? []).map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    );
  } else if (f.type === "radio") {
    input = (
      <div className="grid gap-2">
        {(f.options ?? []).map((o) => (
          <label
            key={o}
            className="group relative flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-all has-[:checked]:border-[hsl(var(--primary))] has-[:checked]:bg-[hsl(var(--primary)/0.05)] has-[:checked]:shadow-[0_2px_8px_-2px_hsl(var(--primary)/0.25)] hover:border-[hsl(var(--primary)/0.4)]"
          >
            <input
              type="radio"
              name={f.name}
              value={o}
              required={required}
              className="peer sr-only"
            />
            {/* Custom-Radio-Indicator: hohler Kreis → gefuellter
                Magenta-Punkt bei Auswahl */}
            <span
              aria-hidden
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-input bg-background transition-colors group-has-[:checked]:border-[hsl(var(--primary))]"
            >
              <span className="h-2.5 w-2.5 scale-0 rounded-full bg-[hsl(var(--primary))] transition-transform duration-150 group-has-[:checked]:scale-100" />
            </span>
            <span className="text-sm font-medium group-has-[:checked]:text-[hsl(var(--primary))]">
              {o}
            </span>
          </label>
        ))}
      </div>
    );
  } else if (f.type === "date") {
    const istTracked = trackedDateNames.has(f.name);
    if (istTracked) {
      input = (
        <Input
          id={f.name}
          name={f.name}
          type="date"
          required={f.required}
          placeholder={f.placeholder}
          value={trackedValues[f.name] ?? ""}
          onChange={(e) => setTracked(f.name, e.target.value)}
          className="h-11 rounded-lg px-3.5 transition-colors focus-visible:border-[hsl(var(--primary)/0.5)] focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary)/0.15)]"
        />
      );
    } else if (f.required) {
      input = (
        <Input
          id={f.name}
          name={f.name}
          type="date"
          required
          placeholder={f.placeholder}
          className="h-11 rounded-lg px-3.5 transition-colors focus-visible:border-[hsl(var(--primary)/0.5)] focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary)/0.15)]"
        />
      );
    } else {
      input = <OptionalesDatum field={f} />;
    }
  } else if (f.type === "number") {
    input = (
      <Input
        id={f.name}
        name={f.name}
        type="number"
        required={required}
        placeholder={f.placeholder}
        className="h-11 rounded-lg px-3.5"
      />
    );
  } else {
    input = (
      <Input
        id={f.name}
        name={f.name}
        type="text"
        required={required}
        placeholder={f.placeholder}
        className="h-11 rounded-lg px-3.5 transition-colors focus-visible:border-[hsl(var(--primary)/0.5)] focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary)/0.15)]"
      />
    );
  }

  return (
    <div className="space-y-2">
      {labelEl}
      {input}
      {f.help && (
        <p className="text-xs leading-relaxed text-muted-foreground">{f.help}</p>
      )}
      {error && (
        <p className="text-xs font-medium text-[hsl(var(--destructive))]">
          {error}
        </p>
      )}
    </div>
  );
}

function CheckboxCard({
  field: f,
  error,
}: {
  field: FormField;
  error?: string;
}) {
  return (
    <div className="space-y-1">
      <label
        htmlFor={f.name}
        className="group flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors has-[:checked]:border-[hsl(var(--primary))] has-[:checked]:bg-[hsl(var(--primary)/0.05)] hover:border-[hsl(var(--primary)/0.4)]"
      >
        <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-input bg-background transition-colors group-has-[:checked]:border-[hsl(var(--primary))] group-has-[:checked]:bg-[hsl(var(--primary))]">
          <input
            type="checkbox"
            id={f.name}
            name={f.name}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
          <Check className="h-3 w-3 text-white opacity-0 transition-opacity group-has-[:checked]:opacity-100" strokeWidth={3} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-tight">{f.label}</p>
          {f.help && (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {f.help}
            </p>
          )}
        </div>
      </label>
      {error && (
        <p className="text-xs font-medium text-[hsl(var(--destructive))]">
          {error}
        </p>
      )}
    </div>
  );
}

function FileDropzone({
  field: f,
  error,
}: {
  field: FormField;
  error?: string;
}) {
  const accept = f.accept ?? "application/pdf,image/jpeg,image/png,image/webp";
  const maxMb = f.max_size_mb ?? 5;
  const [datei, setDatei] = useState<File | null>(null);

  const acceptKurz = accept
    .replace(/application\/pdf/g, "PDF")
    .replace(/image\/jpeg/g, "JPG")
    .replace(/image\/png/g, "PNG")
    .replace(/image\/webp/g, "WEBP")
    .replace(/image\//g, "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="space-y-2">
      <Label htmlFor={f.name} className="text-sm font-medium">
        {f.label}
        {f.required && (
          <span className="ml-1 text-[hsl(var(--destructive))]">*</span>
        )}
      </Label>

      <label
        htmlFor={f.name}
        className={cn(
          "group relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-card px-4 py-6 text-center transition-colors hover:border-[hsl(var(--primary)/0.5)] hover:bg-[hsl(var(--primary)/0.03)]",
          datei ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.04)]" : "border-input",
        )}
      >
        <input
          id={f.name}
          name={f.name}
          type="file"
          required={f.required}
          accept={accept}
          onChange={(e) => setDatei(e.target.files?.[0] ?? null)}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
        {datei ? (
          <>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))]">
              <Paperclip className="h-4 w-4" />
            </span>
            <p className="text-sm font-semibold leading-tight">{datei.name}</p>
            <p className="text-[11px] text-muted-foreground">
              {formatBytes(datei.size)} · {datei.type || "Datei"}
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDatei(null);
                const inp = document.getElementById(f.name) as HTMLInputElement | null;
                if (inp) inp.value = "";
              }}
              className="mt-1 inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-[hsl(var(--destructive)/0.4)] hover:text-[hsl(var(--destructive))]"
            >
              <X className="h-3 w-3" />
              Entfernen
            </button>
          </>
        ) : (
          <>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-[hsl(var(--primary)/0.12)] group-hover:text-[hsl(var(--primary))]">
              <Upload className="h-4 w-4" />
            </span>
            <p className="text-sm font-medium">
              Datei wählen <span className="text-muted-foreground">oder hier ablegen</span>
            </p>
            <p className="text-[11px] text-muted-foreground">
              {acceptKurz} · max. {maxMb} MB
            </p>
          </>
        )}
      </label>

      {f.help && (
        <p className="text-xs leading-relaxed text-muted-foreground">{f.help}</p>
      )}
      {error && (
        <p className="text-xs font-medium text-[hsl(var(--destructive))]">
          {error}
        </p>
      )}
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Optional-Date-Input mit explizitem Aktivieren-Schritt. Default-State
 * zeigt KEIN Input-Feld sondern einen dashed-Button "Datum eintragen".
 * Erst nach Klick erscheint das echte Date-Input — so kann der User
 * gar nicht erst "aus Versehen" mit dem Browser-Default-Datum (heute)
 * abschicken.
 *
 * Wenn aktiviert: zusaetzlicher "Entfernen"-Button daneben um wieder
 * in den leeren Default-Zustand zurueckzukommen.
 */
function OptionalesDatum({ field }: { field: FormField }) {
  const [aktiviert, setAktiviert] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  function aktivieren() {
    setAktiviert(true);
    // Nach Render Focus + nativen Picker oeffnen (mobile-friendly)
    setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      el.focus();
      // showPicker() ist relativ neu, in Try/Catch wegen Browser-Support
      try {
        el.showPicker?.();
      } catch {
        // ignore
      }
    }, 0);
  }

  function deaktivieren() {
    if (ref.current) {
      ref.current.value = "";
      // change-Event triggern damit VertretungsPlanRenderer (linked_dates)
      // den Wert verliert
      ref.current.dispatchEvent(new Event("change", { bubbles: true }));
    }
    setAktiviert(false);
  }

  if (!aktiviert) {
    return (
      <button
        type="button"
        onClick={aktivieren}
        className="group flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-input bg-background/40 text-sm text-muted-foreground transition-colors hover:border-[hsl(var(--primary)/0.5)] hover:bg-[hsl(var(--primary)/0.04)] hover:text-foreground"
      >
        <CalendarPlus className="h-4 w-4" />
        <span>Datum eintragen</span>
      </button>
    );
  }

  return (
    <div className="flex gap-2">
      <Input
        ref={ref}
        id={field.name}
        name={field.name}
        type="date"
        placeholder={field.placeholder}
        className="h-11 flex-1 rounded-lg px-3.5 transition-colors focus-visible:border-[hsl(var(--primary)/0.5)] focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary)/0.15)]"
      />
      <button
        type="button"
        onClick={deaktivieren}
        title="Datum wieder entfernen"
        className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-[hsl(var(--destructive)/0.4)] hover:text-[hsl(var(--destructive))]"
      >
        <X className="h-3.5 w-3.5" />
        Entfernen
      </button>
    </div>
  );
}

const PAUSCHAL_THRESHOLD_TAGE = 30;

function VertretungsPlanRenderer({
  field: f,
  error,
  trackedValues,
}: {
  field: FormField;
  error?: string;
  trackedValues: Record<string, string>;
}) {
  const fromName = f.linked_dates?.from ?? "von";
  const toName = f.linked_dates?.to ?? "bis";

  // von/bis kommen jetzt direkt aus dem RenderForm-Parent-State.
  // Kein DOM-Polling mehr noetig — die linked-Date-Inputs sind
  // controlled und schreiben in trackedValues bei jedem onChange.
  const von = trackedValues[fromName] ?? "";
  const bis = trackedValues[toName] ?? "";
  const [pauschal, setPauschal] = useState(false);
  // Pro Tag: explizit als "frei" markiert (= "Arbeite ich nicht"). Default
  // ist "offen" (Arbeitstag, Vertretung evtl. noch nicht gesetzt).
  const [freiTage, setFreiTage] = useState<Set<string>>(new Set());

  function toggleTagFrei(tag: string) {
    setFreiTage((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }

  const tage = useMemo(() => taglistVonBis(von, bis), [von, bis]);
  const beideGesetzt = von.length > 0 && bis.length > 0;
  const rangeOk = tage.length > 0;
  const langerRange = tage.length > PAUSCHAL_THRESHOLD_TAGE;
  const arbeitstageImRange = tage.filter((t) => !freiTage.has(t)).length;

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {f.label}
        {f.required && (
          <span className="ml-1 text-[hsl(var(--destructive))]">*</span>
        )}
      </Label>

      {f.help && (
        <p className="text-xs leading-relaxed text-muted-foreground">
          {f.help}
        </p>
      )}

      {!beideGesetzt && (
        <div className="flex items-start gap-3 rounded-xl border border-dashed border-border bg-muted/30 p-4">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--brand-pink)/0.12)] text-[hsl(var(--brand-pink))]">
            <CalendarRange className="h-4 w-4" />
          </span>
          <div className="text-xs leading-relaxed text-muted-foreground">
            Erst <span className="font-semibold text-foreground">Datum von</span>{" "}
            und <span className="font-semibold text-foreground">Datum bis</span>{" "}
            ausfüllen — dann erscheint hier eine Reihe pro Tag.
          </div>
        </div>
      )}

      {beideGesetzt && !rangeOk && (
        <div className="rounded-xl border border-[hsl(var(--warning)/0.4)] bg-[hsl(var(--warning)/0.06)] px-4 py-3 text-xs text-muted-foreground">
          <span className="font-semibold text-[hsl(var(--warning))]">
            Hinweis:
          </span>{" "}
          &bdquo;Bis&ldquo;-Datum liegt vor &bdquo;Von&ldquo;-Datum.
        </div>
      )}

      {rangeOk && (
        <p className="text-[11px] text-muted-foreground">
          Pro Tag eintragen wer dich vertritt — oder &bdquo;Frei&ldquo; wenn
          du an dem Tag eh nicht arbeitest. Zeile leer lassen heißt: Tag ist
          ein Arbeitstag, Vertretung steht aber noch nicht fest.
        </p>
      )}

      {rangeOk && langerRange && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[hsl(var(--brand-pink)/0.3)] bg-[hsl(var(--brand-pink)/0.06)] px-4 py-3 text-xs">
          <span className="text-muted-foreground">
            Längerer Zeitraum ({tage.length} Tage, davon{" "}
            {arbeitstageImRange} Arbeitstage). Pro Tag eintragen oder
            pauschal?
          </span>
          <button
            type="button"
            onClick={() => setPauschal((p) => !p)}
            className="rounded-full border border-[hsl(var(--brand-pink)/0.4)] bg-background px-3 py-1 font-semibold text-[hsl(var(--brand-pink))] transition-colors hover:bg-[hsl(var(--brand-pink)/0.08)]"
          >
            {pauschal ? "Pro Tag eintragen" : "Pauschal eintragen"}
          </button>
        </div>
      )}

      {rangeOk && pauschal && (
        <div className="rounded-xl border border-border bg-card p-4">
          <Label
            htmlFor={`${f.name}__pauschal`}
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Vertretung pauschal
          </Label>
          <Input
            id={`${f.name}__pauschal`}
            name={`${f.name}__pauschal`}
            type="text"
            placeholder="z.B. Tom übernimmt alle Schichten"
            className="mt-2 h-11 rounded-lg px-3.5"
          />
        </div>
      )}

      {rangeOk && !pauschal && (
        <>
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {tage.map((tag) => {
              const frei = freiTage.has(tag);
              return (
                <li
                  key={tag}
                  className={cn(
                    "flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:gap-4",
                    frei && "bg-muted/30",
                  )}
                >
                  <div className="flex items-center gap-2 sm:w-32 sm:shrink-0">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        frei
                          ? "bg-muted text-muted-foreground"
                          : "bg-[hsl(var(--brand-pink)/0.12)] text-[hsl(var(--brand-pink))]",
                      )}
                    >
                      {wochentagKurz(tag)}
                    </span>
                    <span
                      className={cn(
                        "text-sm tabular-nums",
                        frei ? "text-muted-foreground" : "font-medium",
                      )}
                    >
                      {formatDatum(tag)}
                    </span>
                  </div>

                  {frei ? (
                    <>
                      <input
                        type="hidden"
                        name={`${f.name}__${tag}__frei`}
                        value="on"
                      />
                      <span className="flex-1 text-xs italic text-muted-foreground">
                        Arbeite ich nicht
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleTagFrei(tag)}
                        className="shrink-0 rounded-md border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        Doch arbeiten
                      </button>
                    </>
                  ) : (
                    <>
                      <Input
                        name={`${f.name}__${tag}`}
                        type="text"
                        placeholder="Wer vertritt dich? (leer = noch offen)"
                        className="h-10 flex-1 rounded-lg px-3.5"
                      />
                      <button
                        type="button"
                        onClick={() => toggleTagFrei(tag)}
                        className="shrink-0 rounded-md border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        Frei
                      </button>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}

      {error && (
        <p className="text-xs font-medium text-[hsl(var(--destructive))]">
          {error}
        </p>
      )}
    </div>
  );
}
