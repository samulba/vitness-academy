"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function FreigebenSubmit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="success" size="sm" disabled={pending}>
      <CheckCircle2 className="h-4 w-4" />
      {pending ? "Speichere …" : "Freigeben"}
    </Button>
  );
}

function AblehnenSubmit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="destructive" size="sm" disabled={pending}>
      <XCircle className="h-4 w-4" />
      {pending ? "Speichere …" : "Ablehnen"}
    </Button>
  );
}

export function EntscheidungsForm({
  freigeben,
  ablehnen,
}: {
  freigeben: (formData: FormData) => void | Promise<void>;
  ablehnen: (formData: FormData) => void | Promise<void>;
}) {
  const [modus, setModus] = useState<"none" | "freigeben" | "ablehnen">(
    "none",
  );

  if (modus === "none") {
    return (
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="success" onClick={() => setModus("freigeben")}>
          <CheckCircle2 className="h-4 w-4" />
          Freigeben
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setModus("ablehnen")}
          className="border-destructive/40 text-destructive hover:bg-destructive/10"
        >
          <XCircle className="h-4 w-4" />
          Ablehnen
        </Button>
      </div>
    );
  }

  const action = modus === "freigeben" ? freigeben : ablehnen;
  const platzhalter =
    modus === "freigeben"
      ? "Optionale Notiz, z.B. „Sehr gut umgesetzt, Blickkontakt klappt jetzt sicher.“"
      : "Bitte Grund angeben, damit der Mitarbeiter weiß, woran er arbeiten soll.";

  return (
    <form action={action} className="space-y-2">
      <textarea
        name="reviewer_note"
        rows={3}
        placeholder={platzhalter}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        required={modus === "ablehnen"}
      />
      <div className="flex flex-wrap gap-2">
        {modus === "freigeben" ? <FreigebenSubmit /> : <AblehnenSubmit />}
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setModus("none")}
        >
          Abbrechen
        </Button>
      </div>
    </form>
  );
}
