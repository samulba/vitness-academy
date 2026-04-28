"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { CheckSquare, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

function SubmitBereit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      <CheckSquare className="h-4 w-4" />
      {pending ? "Meldet …" : "Bereit zur Freigabe melden"}
    </Button>
  );
}

function SubmitZurueck() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="sm"
      variant="outline"
      disabled={pending}
    >
      <RotateCcw className="h-4 w-4" />
      {pending ? "Zieht zurück …" : "Meldung zurückziehen"}
    </Button>
  );
}

export function BereitMeldenForm({
  action,
  modus,
}: {
  action: (formData: FormData) => void | Promise<void>;
  modus: "melden" | "zurueckziehen";
}) {
  const [open, setOpen] = useState(false);

  if (modus === "zurueckziehen") {
    return (
      <form action={action}>
        <SubmitZurueck />
      </form>
    );
  }

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        <CheckSquare className="h-4 w-4" />
        Bereit zur Freigabe melden
      </Button>
    );
  }

  return (
    <form action={action} className="space-y-2">
      <textarea
        name="note"
        placeholder="Notiz für die Führungskraft (optional) – z.B. wann/wo/mit wem du es geübt hast"
        rows={3}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <div className="flex flex-wrap gap-2">
        <SubmitBereit />
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setOpen(false)}
        >
          Abbrechen
        </Button>
      </div>
    </form>
  );
}
