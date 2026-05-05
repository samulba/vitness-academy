"use client";

import { useState, useTransition } from "react";
import { Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { abschlussStornieren } from "./actions";

/**
 * Two-Step-Storno-Button: Klick öffnet kleine Inline-Form mit Pflicht-
 * Begründung. Submit erzeugt Storno-Eintrag mit Negativ-Beträgen und
 * setzt Original auf 'storniert'.
 */
export function StornoButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [grund, setGrund] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (grund.trim().length < 3) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("storno_grund", grund);
      await abschlussStornieren(id, fd);
    });
  };

  if (!open) {
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        className="h-7 gap-1 border-amber-300 text-amber-700 hover:bg-amber-50"
      >
        <Undo2 className="h-3 w-3" />
        Storno
      </Button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="flex items-center gap-1.5"
      onClick={(e) => e.stopPropagation()}
    >
      <input
        autoFocus
        required
        minLength={3}
        value={grund}
        onChange={(e) => setGrund(e.target.value)}
        placeholder="Grund …"
        className="h-7 w-44 rounded-md border border-border bg-background px-2 text-xs focus-visible:border-[hsl(var(--ring))] focus-visible:outline-none"
      />
      <Button
        type="submit"
        size="sm"
        variant="destructive"
        disabled={pending || grund.trim().length < 3}
        className="h-7"
      >
        {pending ? "…" : "OK"}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => {
          setOpen(false);
          setGrund("");
        }}
        disabled={pending}
        className="h-7"
      >
        ×
      </Button>
    </form>
  );
}
