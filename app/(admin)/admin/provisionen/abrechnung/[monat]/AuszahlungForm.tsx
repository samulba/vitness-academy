"use client";

import { useState, useTransition } from "react";
import { Banknote, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  auszahlungSetzen,
  auszahlungZuruecksetzen,
} from "../actions";

export function AuszahlungForm({
  payoutId,
  istAusgezahlt,
  ausgezahltAm,
  ausgezahltVia,
  ausgezahltNote,
}: {
  payoutId: string;
  istAusgezahlt: boolean;
  ausgezahltAm: string | null;
  ausgezahltVia: string | null;
  ausgezahltNote: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  if (istAusgezahlt) {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--success)/0.12)] px-2 py-0.5 text-[11px] font-semibold text-[hsl(var(--success))]">
          <Check className="h-3 w-3" />
          {ausgezahltAm} · {ausgezahltVia ?? "—"}
        </span>
        {ausgezahltNote && (
          <span
            title={ausgezahltNote}
            className="cursor-help text-[10px] text-muted-foreground underline decoration-dotted"
          >
            Notiz
          </span>
        )}
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-6 text-[10px]"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await auszahlungZuruecksetzen(payoutId);
            })
          }
        >
          zurücksetzen
        </Button>
      </div>
    );
  }

  if (!open) {
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        className="gap-1.5"
      >
        <Banknote className="h-3.5 w-3.5" />
        Als ausgezahlt markieren
      </Button>
    );
  }

  return (
    <form
      action={auszahlungSetzen.bind(null, payoutId)}
      className="flex flex-wrap items-end gap-2"
    >
      <div className="space-y-0.5">
        <Label htmlFor={`am-${payoutId}`} className="text-[10px]">
          Datum
        </Label>
        <Input
          id={`am-${payoutId}`}
          name="ausgezahlt_am"
          type="date"
          required
          defaultValue={new Date().toISOString().slice(0, 10)}
          className="h-8 w-36 text-xs"
        />
      </div>
      <div className="space-y-0.5">
        <Label htmlFor={`via-${payoutId}`} className="text-[10px]">
          Methode
        </Label>
        <select
          id={`via-${payoutId}`}
          name="ausgezahlt_via"
          defaultValue="ueberweisung"
          className="h-8 rounded-md border border-input bg-background px-2 text-xs"
        >
          <option value="ueberweisung">Überweisung</option>
          <option value="bar">Bar</option>
          <option value="magicline">Magicline</option>
          <option value="lohn">Lohnabrechnung</option>
          <option value="andere">Andere</option>
        </select>
      </div>
      <div className="space-y-0.5">
        <Label htmlFor={`note-${payoutId}`} className="text-[10px]">
          Notiz (optional)
        </Label>
        <Input
          id={`note-${payoutId}`}
          name="ausgezahlt_note"
          className="h-8 w-44 text-xs"
        />
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "…" : "Speichern"}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => setOpen(false)}
      >
        ×
      </Button>
    </form>
  );
}
