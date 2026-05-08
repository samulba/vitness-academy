"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDatum } from "@/lib/format";
import {
  formatStunden,
  shiftStunden,
  type Shift,
} from "@/lib/lohn-types";
import {
  shiftAktualisieren,
  shiftLoeschen,
  type Ergebnis,
} from "./actions";

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
 * Mobile: stapelt vertikal, Desktop: 6-Spalten-Grid.
 */
export function ShiftRow({ shift }: { shift: Shift }) {
  const [edit, setEdit] = useState(false);
  const stunden = shiftStunden(shift);

  if (edit) {
    return (
      <ShiftEditForm
        shift={shift}
        onCancel={() => setEdit(false)}
        onSaved={() => setEdit(false)}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 items-center gap-2 px-4 py-3 sm:grid-cols-[120px_120px_120px_80px_1fr_60px] sm:gap-3">
      {/* Datum */}
      <div className="flex items-baseline gap-2 sm:flex-col sm:items-start sm:gap-0">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {wochentag(shift.datum)}
        </span>
        <span className="text-sm font-medium tabular-nums">
          {formatDatum(shift.datum)}
        </span>
      </div>

      {/* Von - Bis */}
      <span className="text-sm tabular-nums sm:hidden">
        {zeitKurz(shift.von_zeit)} – {zeitKurz(shift.bis_zeit)}
        {shift.pause_minuten > 0 && (
          <span className="ml-2 text-xs text-muted-foreground">
            ({shift.pause_minuten}m Pause)
          </span>
        )}
      </span>
      <span className="hidden text-sm tabular-nums sm:block">
        {zeitKurz(shift.von_zeit)}
      </span>
      <span className="hidden text-sm tabular-nums sm:block">
        {zeitKurz(shift.bis_zeit)}
      </span>

      {/* Stunden */}
      <span className="text-sm font-semibold tabular-nums sm:text-right">
        <span className="text-muted-foreground sm:hidden">Stunden: </span>
        {formatStunden(stunden)}
      </span>

      {/* Notiz */}
      <span className="text-xs text-muted-foreground sm:text-sm">
        {shift.notiz || "—"}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1 sm:justify-end">
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
  );
}

function DeleteButton({ shiftId }: { shiftId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function loeschen() {
    if (!confirm("Schicht wirklich löschen?")) return;
    setPending(true);
    const r = await shiftLoeschen(shiftId);
    setPending(false);
    if (r.ok) {
      toast.success("Schicht gelöscht");
      router.refresh();
    } else {
      toast.error(r.message);
    }
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
  onCancel,
  onSaved,
}: {
  shift: Shift;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, runAction, pending] = useActionState<Ergebnis | null, FormData>(
    async (_prev, fd) => shiftAktualisieren(shift.id, fd),
    null,
  );

  useEffect(() => {
    if (state?.ok) {
      toast.success("Schicht aktualisiert");
      router.refresh();
      onSaved();
    }
  }, [state, router, onSaved]);

  return (
    <form
      ref={formRef}
      action={runAction}
      className="border-l-2 border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.04)] p-4"
    >
      <div className="grid gap-3 sm:grid-cols-[1fr_120px_120px_100px]">
        <div>
          <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Datum
          </Label>
          <Input
            name="datum"
            type="date"
            defaultValue={shift.datum}
            required
            className="mt-1 h-9 rounded-lg"
          />
        </div>
        <div>
          <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Von
          </Label>
          <Input
            name="von_zeit"
            type="time"
            defaultValue={shift.von_zeit.slice(0, 5)}
            required
            className="mt-1 h-9 rounded-lg"
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
            className="mt-1 h-9 rounded-lg"
          />
        </div>
        <div>
          <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Pause (Min)
          </Label>
          <Input
            name="pause_minuten"
            type="number"
            min={0}
            step={5}
            defaultValue={shift.pause_minuten}
            className="mt-1 h-9 rounded-lg"
          />
        </div>
      </div>
      <div className="mt-3">
        <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Notiz
        </Label>
        <Input
          name="notiz"
          type="text"
          defaultValue={shift.notiz ?? ""}
          className="mt-1 h-9 rounded-lg"
        />
      </div>
      {state && !state.ok && (
        <p className="mt-2 text-xs text-[hsl(var(--destructive))]">
          {state.message}
        </p>
      )}
      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
        >
          <X className="h-3.5 w-3.5" />
          Abbrechen
        </button>
        <Button
          type="submit"
          disabled={pending}
          className="h-9 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)]"
        >
          {pending ? "Speichere…" : "Speichern"}
        </Button>
      </div>
    </form>
  );
}
