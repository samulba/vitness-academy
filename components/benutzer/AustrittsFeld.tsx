"use client";

import { useState } from "react";
import { CalendarOff, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Toggle + Date-Field fuer Austrittsdatum.
 *
 * Hintergrund: Ein leeres <input type="date"> kann je nach Browser
 * (vor allem Safari) beim Submit das aktuelle Datum mitschicken,
 * was dazu fuehrt, dass aktive Mitarbeiter versehentlich als
 * ausgetreten markiert werden.
 *
 * Loesung: Default ist "Aktiv", das Date-Field rendert dann gar
 * nicht. Ein verstecktes input mit leerem Wert sorgt dafuer, dass
 * austritt_am sicher null wird. Nur wenn der Admin den Toggle
 * aktiviert, erscheint das echte Date-Field.
 */
export function AustrittsFeld({
  initial,
}: {
  /** ISO-Datum (YYYY-MM-DD) oder null wenn aktiv. */
  initial: string | null;
}) {
  const [aktiv, setAktiv] = useState<boolean>(Boolean(initial));
  const [wert, setWert] = useState<string>(initial ?? "");

  if (!aktiv) {
    return (
      <div className="space-y-2">
        <Label>Austritt</Label>
        <input type="hidden" name="austritt_am" value="" />
        <button
          type="button"
          onClick={() => setAktiv(true)}
          className="flex h-9 w-full items-center gap-2 rounded-md border border-dashed border-border bg-background px-3 text-sm text-muted-foreground transition-colors hover:border-[hsl(var(--primary))] hover:text-foreground"
        >
          <CalendarOff className="h-3.5 w-3.5" />
          Aktiver Mitarbeiter — Austritt vermerken
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="austritt_am">
          Austritt am
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            (optional)
          </span>
        </Label>
        <button
          type="button"
          onClick={() => {
            setAktiv(false);
            setWert("");
          }}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-3 w-3" />
          Zurücksetzen
        </button>
      </div>
      <Input
        id="austritt_am"
        name="austritt_am"
        type="date"
        value={wert}
        onChange={(e) => setWert(e.target.value)}
      />
    </div>
  );
}
