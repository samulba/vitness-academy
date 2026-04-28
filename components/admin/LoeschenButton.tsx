"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" variant="destructive" disabled={pending}>
      {pending ? "Lösche …" : label}
    </Button>
  );
}

/**
 * Zwei-Klick-Loeschen mit Bestaetigung.
 * action: Server-Action (bereits gebunden mit der ID).
 */
export function LoeschenButton({
  action,
  label = "Löschen",
  bestaetigung = "Wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.",
  size = "sm",
}: {
  action: () => Promise<void> | void;
  label?: string;
  bestaetigung?: string;
  size?: "sm" | "default";
}) {
  const [bestaetigt, setBestaetigt] = useState(false);

  if (!bestaetigt) {
    return (
      <Button
        type="button"
        size={size}
        variant="outline"
        onClick={() => setBestaetigt(true)}
        className="border-destructive/40 text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="h-4 w-4" />
        {label}
      </Button>
    );
  }

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-destructive">{bestaetigung}</span>
      <Submit label={label} />
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => setBestaetigt(false)}
      >
        Abbrechen
      </Button>
    </form>
  );
}
