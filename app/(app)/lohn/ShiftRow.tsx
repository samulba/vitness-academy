"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MapPin, Pencil, Sparkles, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormAction } from "@/lib/hooks/use-form-action";
import { formatDatum } from "@/lib/format";
import {
  formatStunden,
  shiftStunden,
  shiftWo,
  type Shift,
} from "@/lib/lohn-types";
import { shiftAktualisieren, shiftLoeschen } from "./actions";
import { StandortPicker, type StandortOption } from "./StandortPicker";

const WOCHENTAGE_KURZ = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"] as const;

function wochentag(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return WOCHENTAGE_KURZ[d.getDay()];
}

function zeitKurz(z: string): string {
  // "HH:MM:SS" → "HH:MM"
  return z.slice(0, 5);
}

/**
 * Eine Schicht-Zeile mit Inline-Edit-Modus + Lösch-Confirm.
 * Mobile: stapelt vertikal, Desktop: 7-Spalten-Grid (Datum/Wo/Von/Bis/
 * Stunden/Notiz/Actions).
 */
export function ShiftRow({
  shift,
  standorte,
  aktiverStandortId,
}: {
  shift: Shift;
  standorte: StandortOption[];
  aktiverStandortId: string | null;
}) {
  const [edit, setEdit] = useState(false);
  const stunden = shiftStunden(shift);
  const woLabel = shiftWo(shift);
  const istSonstiges = !shift.location_id && !!shift.bereich;

  if (edit) {
    return (
      <ShiftEditForm
        shift={shift}
        standorte={standorte}
        aktiverStandortId={aktiverStandortId}
        onCancel={() => setEdit(false)}
        onSaved={() => setEdit(false)}
      />
    );
  }

  return (
    <>
      {/* Mobile: cleane Card-Optik mit klarer Hierarchie */}
      <div className="px-4 py-3 sm:hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {/* Top-Zeile: Wochentag · Datum + Stunden-Pill */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--brand-pink))]">
                {wochentag(shift.datum)}
              </span>
              <span className="text-sm font-semibold tabular-nums">
                {formatDatum(shift.datum)}
              </span>
              <span className="ml-auto inline-flex items-center gap-1 rounded-md bg-[hsl(var(--primary)/0.08)] px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-[hsl(var(--primary))]">
                {formatStunden(stunden)}
              </span>
            </div>

            {/* Mid-Zeile: Zeit + Pause */}
            <p className="mt-1 text-sm tabular-nums text-muted-foreground">
              {zeitKurz(shift.von_zeit)} – {zeitKurz(shift.bis_zeit)}
              {shift.pause_minuten > 0 && (
                <span className="ml-1 text-[11px]">
                  · {shift.pause_minuten}m Pause
                </span>
              )}
            </p>

            {/* Wo + Notiz */}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
              <span className="inline-flex items-center gap-1">
                {istSonstiges ? (
                  <Sparkles className="h-3 w-3 text-[hsl(var(--brand-pink))]" />
                ) : (
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                )}
                <span className="truncate font-medium">{woLabel}</span>
              </span>
              {shift.notiz && (
                <span className="truncate text-muted-foreground">
                  · {shift.notiz}
                </span>
              )}
            </div>
          </div>

          {/* Actions: kompakte Vertikal-Gruppe */}
          <div className="flex shrink-0 flex-col gap-1">
            <button
              type="button"
              onClick={() => setEdit(true)}
              aria-label="Bearbeiten"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <DeleteButton shiftId={shift.id} />
          </div>
        </div>
      </div>

      {/* Desktop: Tabellen-Layout */}
      <div className="hidden items-center gap-3 px-4 py-3 sm:grid sm:grid-cols-[110px_140px_90px_90px_70px_1fr_60px]">
        <div className="flex flex-col items-start">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {wochentag(shift.datum)}
          </span>
          <span className="text-sm font-medium tabular-nums">
            {formatDatum(shift.datum)}
          </span>
        </div>

        <span className="inline-flex items-center gap-1.5 truncate text-sm">
          {istSonstiges ? (
            <Sparkles className="h-3 w-3 shrink-0 text-[hsl(var(--brand-pink))]" />
          ) : (
            <MapPin className="h-3 w-3 shrink-0 text-muted-foreground" />
          )}
          <span className="truncate font-medium">{woLabel}</span>
        </span>

        <span className="text-sm tabular-nums">
          {zeitKurz(shift.von_zeit)}
        </span>
        <span className="text-sm tabular-nums">
          {zeitKurz(shift.bis_zeit)}
        </span>

        <span className="text-right text-sm font-semibold tabular-nums">
          {formatStunden(stunden)}
        </span>

        <span className="truncate text-sm text-muted-foreground">
          {shift.notiz || "—"}
        </span>

        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => setEdit(true)}
            aria-label="Bearbeiten"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <DeleteButton shiftId={shift.id} />
        </div>
      </div>
    </>
  );
}

function DeleteButton({ shiftId }: { shiftId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function loeschen() {
    if (!confirm("Schicht wirklich löschen?")) return;
    startTransition(async () => {
      const r = await shiftLoeschen(shiftId);
      if (r.ok) {
        toast.success("Schicht gelöscht");
        router.refresh();
      } else {
        toast.error(r.message);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={loeschen}
      disabled={pending}
      aria-label="Löschen"
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-[hsl(var(--destructive)/0.08)] hover:text-[hsl(var(--destructive))] disabled:opacity-50"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}

function ShiftEditForm({
  shift,
  standorte,
  aktiverStandortId,
  onCancel,
  onSaved,
}: {
  shift: Shift;
  standorte: StandortOption[];
  aktiverStandortId: string | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const { run, pending, state, formRef } = useFormAction(
    (fd: FormData) => shiftAktualisieren(shift.id, fd),
    {
      successToast: "Schicht aktualisiert",
      onSuccess: onSaved,
    },
  );

  return (
    <form
      ref={formRef}
      action={run}
      className="border-l-2 border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.04)] p-4"
    >
      <StandortPicker
        standorte={standorte}
        defaultLocationId={shift.location_id}
        defaultBereich={shift.bereich}
        aktiverStandortId={aktiverStandortId}
        size="sm"
      />

      <div className="mt-3 space-y-3">
        <div>
          <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Datum
          </Label>
          <Input
            name="datum"
            type="date"
            defaultValue={shift.datum}
            required
            className="mt-1 h-10 rounded-lg sm:h-9"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Von
            </Label>
            <Input
              name="von_zeit"
              type="time"
              defaultValue={shift.von_zeit.slice(0, 5)}
              required
              className="mt-1 h-10 rounded-lg tabular-nums sm:h-9"
            />
          </div>
          <div>
            <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Bis
            </Label>
            <Input
              name="bis_zeit"
              type="time"
              defaultValue={shift.bis_zeit.slice(0, 5)}
              required
              className="mt-1 h-10 rounded-lg tabular-nums sm:h-9"
            />
          </div>
        </div>
        <div>
          <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Pause (Minuten)
          </Label>
          <Input
            name="pause_minuten"
            type="number"
            inputMode="numeric"
            min={0}
            step={5}
            defaultValue={shift.pause_minuten}
            className="mt-1 h-10 rounded-lg tabular-nums sm:h-9"
          />
        </div>
        <div>
          <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Notiz
          </Label>
          <Input
            name="notiz"
            type="text"
            defaultValue={shift.notiz ?? ""}
            className="mt-1 h-10 rounded-lg sm:h-9"
          />
        </div>
      </div>
      {state && !state.ok && (
        <p className="mt-2 text-xs text-[hsl(var(--destructive))]">
          {state.message}
        </p>
      )}
      <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-10 items-center justify-center gap-1 rounded-lg border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted sm:h-9"
        >
          <X className="h-3.5 w-3.5" />
          Abbrechen
        </button>
        <Button
          type="submit"
          disabled={pending}
          className="h-10 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)] sm:h-9"
        >
          {pending ? "Speichere…" : "Speichern"}
        </Button>
      </div>
    </form>
  );
}
