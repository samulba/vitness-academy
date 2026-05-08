"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { shiftAnlegen, type Ergebnis } from "./actions";

/**
 * Quick-Add-Form fuer Schichten. Kollabiert standardmaessig zu einem
 * "+ Schicht hinzufuegen"-Button. Aufgeklappt zeigt es die 5 Felder
 * in einer kompakten Reihe (Mobile: gestapelt).
 *
 * Datum-Default = letztes manuell gewaehltes Datum oder heute.
 */
export function ShiftHinzufuegen({ monat }: { monat: string }) {
  const router = useRouter();
  const [offen, setOffen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const [state, runAction, pending] = useActionState<Ergebnis | null, FormData>(
    async (_prev, fd) => shiftAnlegen(fd),
    null,
  );

  useEffect(() => {
    if (state?.ok) {
      toast.success("Schicht hinzugefügt");
      formRef.current?.reset();
      router.refresh();
    }
  }, [state, router]);

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

  return (
    <form
      ref={formRef}
      action={runAction}
      className="rounded-xl border border-border bg-card p-4 sm:p-5"
    >
      <div className="grid gap-3 sm:grid-cols-[1fr_120px_120px_100px]">
        <div>
          <Label htmlFor="datum" className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Datum
          </Label>
          <Input
            id="datum"
            name="datum"
            type="date"
            required
            defaultValue={defaultDatum}
            className="mt-1 h-10 rounded-lg"
          />
        </div>
        <div>
          <Label htmlFor="von_zeit" className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Von
          </Label>
          <Input
            id="von_zeit"
            name="von_zeit"
            type="time"
            required
            className="mt-1 h-10 rounded-lg"
          />
        </div>
        <div>
          <Label htmlFor="bis_zeit" className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Bis
          </Label>
          <Input
            id="bis_zeit"
            name="bis_zeit"
            type="time"
            required
            className="mt-1 h-10 rounded-lg"
          />
        </div>
        <div>
          <Label htmlFor="pause_minuten" className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Pause (Min)
          </Label>
          <Input
            id="pause_minuten"
            name="pause_minuten"
            type="number"
            min={0}
            step={5}
            defaultValue={0}
            className="mt-1 h-10 rounded-lg"
          />
        </div>
      </div>

      <div className="mt-3">
        <Label htmlFor="notiz" className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Notiz (optional)
        </Label>
        <Input
          id="notiz"
          name="notiz"
          type="text"
          placeholder="z.B. Theke + Reha-Vertretung, Überstunden für Putzen…"
          className="mt-1 h-10 rounded-lg"
        />
      </div>

      {message && (
        <p className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[hsl(var(--destructive)/0.3)] bg-[hsl(var(--destructive)/0.08)] px-3 py-2 text-xs font-medium text-[hsl(var(--destructive))]">
          <AlertCircle className="h-3.5 w-3.5" />
          {message}
        </p>
      )}

      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setOffen(false)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          Abbrechen
        </button>
        <Button
          type="submit"
          disabled={pending}
          className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)]"
        >
          {pending ? "Speichere…" : "Speichern"}
        </Button>
      </div>
    </form>
  );
}
