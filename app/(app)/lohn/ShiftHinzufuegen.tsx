"use client";

import { useState } from "react";
import { AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormAction } from "@/lib/hooks/use-form-action";
import { shiftAnlegen } from "./actions";
import { StandortPicker, type StandortOption } from "./StandortPicker";

/**
 * Quick-Add-Form für Schichten. Kollabiert standardmaessig zu einem
 * "+ Schicht hinzufügen"-Button. Aufgeklappt zeigt es die 5 Felder
 * in einer kompakten Reihe (Mobile: gestapelt).
 *
 * Datum-Default = letztes manuell gewähltes Datum oder heute.
 */
export function ShiftHinzufuegen({
  monat,
  standorte,
  aktiverStandortId,
}: {
  monat: string;
  standorte: StandortOption[];
  aktiverStandortId: string | null;
}) {
  const [offen, setOffen] = useState(false);

  const { run, pending, state, formRef } = useFormAction(shiftAnlegen, {
    successToast: "Schicht hinzugefügt",
    resetForm: true,
  });

  const message = state && !state.ok ? state.message : null;

  // Default-Datum: heute wenn im aktuellen Monat, sonst Monatserster
  const heute = new Date();
  const heuteISO = `${heute.getFullYear()}-${String(heute.getMonth() + 1).padStart(2, "0")}-${String(heute.getDate()).padStart(2, "0")}`;
  const defaultDatum = heuteISO.startsWith(monat) ? heuteISO : `${monat}-01`;

  if (!offen) {
    return (
      <button
        type="button"
        onClick={() => setOffen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-background/40 px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-[hsl(var(--primary)/0.5)] hover:bg-[hsl(var(--primary)/0.04)] hover:text-foreground"
      >
        <Plus className="h-4 w-4" />
        Schicht hinzufügen
      </button>
    );
  }

  const labelKlass =
    "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground";

  return (
    <form
      ref={formRef}
      action={run}
      className="space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-5"
    >
      <StandortPicker
        standorte={standorte}
        aktiverStandortId={aktiverStandortId}
      />

      <div>
        <Label htmlFor="datum" className={labelKlass}>
          Datum
        </Label>
        <Input
          id="datum"
          name="datum"
          type="date"
          required
          defaultValue={defaultDatum}
          className="mt-1 h-11 rounded-lg sm:h-10"
        />
      </div>

      {/* Von / Bis nebeneinander auch auf Mobile (kurze Zeit-Felder) */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="von_zeit" className={labelKlass}>
            Von
          </Label>
          <Input
            id="von_zeit"
            name="von_zeit"
            type="time"
            required
            className="mt-1 h-11 rounded-lg tabular-nums sm:h-10"
          />
        </div>
        <div>
          <Label htmlFor="bis_zeit" className={labelKlass}>
            Bis
          </Label>
          <Input
            id="bis_zeit"
            name="bis_zeit"
            type="time"
            required
            className="mt-1 h-11 rounded-lg tabular-nums sm:h-10"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="pause_minuten" className={labelKlass}>
          Pause (Minuten)
        </Label>
        <Input
          id="pause_minuten"
          name="pause_minuten"
          type="number"
          inputMode="numeric"
          min={0}
          step={5}
          defaultValue={0}
          className="mt-1 h-11 rounded-lg tabular-nums sm:h-10"
        />
      </div>

      <div>
        <Label htmlFor="notiz" className={labelKlass}>
          Notiz (optional)
        </Label>
        <Input
          id="notiz"
          name="notiz"
          type="text"
          placeholder="z.B. Theke + Reha-Vertretung, Überstunden …"
          className="mt-1 h-11 rounded-lg sm:h-10"
        />
      </div>

      {message && (
        <p className="inline-flex items-center gap-2 rounded-lg border border-[hsl(var(--destructive)/0.3)] bg-[hsl(var(--destructive)/0.08)] px-3 py-2 text-xs font-medium text-[hsl(var(--destructive))]">
          <AlertCircle className="h-3.5 w-3.5" />
          {message}
        </p>
      )}

      {/* Mobile: Buttons full-width gestapelt. Desktop: rechts. */}
      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={() => setOffen(false)}
          className="h-11 rounded-lg border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted sm:h-10"
        >
          Abbrechen
        </button>
        <Button
          type="submit"
          disabled={pending}
          className="h-11 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)] sm:h-10"
        >
          {pending ? "Speichere…" : "Schicht speichern"}
        </Button>
      </div>
    </form>
  );
}
