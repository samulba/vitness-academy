"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CalendarRange,
  Check,
  Paperclip,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  return (
    <form action={runAction} className="space-y-6">
      {fields.map((f) => (
        <FieldRenderer key={f.name} field={f} error={errors[f.name]} />
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
          className="bg-[hsl(var(--primary))] px-6 text-[hsl(var(--primary-foreground))] shadow-[0_4px_14px_-4px_hsl(var(--primary)/0.5)] hover:bg-[hsl(var(--primary)/0.9)]"
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
}: {
  field: FormField;
  error?: string;
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
    return <VertretungsPlanRenderer field={f} error={error} />;
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
            className="group flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card px-3.5 py-2.5 transition-colors has-[:checked]:border-[hsl(var(--primary))] has-[:checked]:bg-[hsl(var(--primary)/0.06)] hover:border-[hsl(var(--primary)/0.4)]"
          >
            <input
              type="radio"
              name={f.name}
              value={o}
              required={required}
              className="h-4 w-4 accent-[hsl(var(--primary))]"
            />
            <span className="text-sm">{o}</span>
          </label>
        ))}
      </div>
    );
  } else if (f.type === "date") {
    input = <DateInputMitLoeschen field={f} />;
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
 * Date-Input mit "Löschen"-Knopf rechts. Browser füllen leere Date-
 * Inputs gerne mit dem heutigen Datum auf (besonders Safari beim
 * ersten Klick). Optionale Felder bekommen daher einen × Button
 * der den Wert wieder leert.
 */
function DateInputMitLoeschen({ field }: { field: FormField }) {
  const ref = useRef<HTMLInputElement>(null);
  const [hatWert, setHatWert] = useState(false);

  function aktualisieren() {
    setHatWert(Boolean(ref.current?.value));
  }

  function loeschen() {
    if (!ref.current) return;
    ref.current.value = "";
    // change-Event manuell triggern damit eventuelle Listener
    // (z.B. VertretungsPlanRenderer auf von/bis) reagieren.
    ref.current.dispatchEvent(new Event("change", { bubbles: true }));
    setHatWert(false);
  }

  return (
    <div className="relative">
      <Input
        ref={ref}
        id={field.name}
        name={field.name}
        type="date"
        required={field.required}
        placeholder={field.placeholder}
        onChange={aktualisieren}
        onInput={aktualisieren}
        className={cn(
          "h-11 rounded-lg px-3.5 transition-colors focus-visible:border-[hsl(var(--primary)/0.5)] focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary)/0.15)]",
          hatWert && !field.required && "pr-10",
        )}
      />
      {hatWert && !field.required && (
        <button
          type="button"
          onClick={loeschen}
          aria-label="Datum löschen"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

const PAUSCHAL_THRESHOLD_TAGE = 30;

function VertretungsPlanRenderer({
  field: f,
  error,
}: {
  field: FormField;
  error?: string;
}) {
  const fromName = f.linked_dates?.from ?? "von";
  const toName = f.linked_dates?.to ?? "bis";

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [von, setVon] = useState("");
  const [bis, setBis] = useState("");
  const [pauschal, setPauschal] = useState(false);

  // Liest die aktuellen Werte der zwei date-Inputs aus der Form
  // und re-rendert wenn sie sich aendern. Uncontrolled-Pattern:
  // wir greifen aktiv via querySelector statt Lift-State-Refactor.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const form = wrapper.closest("form");
    if (!form) return;

    const fromInput = form.elements.namedItem(fromName) as
      | HTMLInputElement
      | null;
    const toInput = form.elements.namedItem(toName) as HTMLInputElement | null;
    if (!fromInput || !toInput) return;

    function lesen() {
      setVon(fromInput!.value || "");
      setBis(toInput!.value || "");
    }
    lesen();
    fromInput.addEventListener("change", lesen);
    fromInput.addEventListener("input", lesen);
    toInput.addEventListener("change", lesen);
    toInput.addEventListener("input", lesen);
    return () => {
      fromInput.removeEventListener("change", lesen);
      fromInput.removeEventListener("input", lesen);
      toInput.removeEventListener("change", lesen);
      toInput.removeEventListener("input", lesen);
    };
  }, [fromName, toName]);

  const tage = useMemo(() => taglistVonBis(von, bis), [von, bis]);
  const beideGesetzt = von.length > 0 && bis.length > 0;
  const rangeOk = tage.length > 0;
  const langerRange = tage.length > PAUSCHAL_THRESHOLD_TAGE;

  return (
    <div ref={wrapperRef} className="space-y-2">
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

      {rangeOk && langerRange && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[hsl(var(--brand-pink)/0.3)] bg-[hsl(var(--brand-pink)/0.06)] px-4 py-3 text-xs">
          <span className="text-muted-foreground">
            Längerer Zeitraum ({tage.length} Tage). Pro Tag eintragen oder
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
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {tage.map((tag) => (
            <li
              key={tag}
              className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:gap-4"
            >
              <div className="flex items-center gap-2 sm:w-32 sm:shrink-0">
                <span className="rounded-full bg-[hsl(var(--brand-pink)/0.12)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--brand-pink))]">
                  {wochentagKurz(tag)}
                </span>
                <span className="text-sm font-medium tabular-nums">
                  {formatDatum(tag)}
                </span>
              </div>
              <Input
                name={`${f.name}__${tag}`}
                type="text"
                placeholder="Vertretung (Name) — leer wenn noch unklar"
                className="h-10 flex-1 rounded-lg px-3.5"
              />
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className="text-xs font-medium text-[hsl(var(--destructive))]">
          {error}
        </p>
      )}
    </div>
  );
}
