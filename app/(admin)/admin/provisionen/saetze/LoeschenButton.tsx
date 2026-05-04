"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";

export function LoeschenButton({ action }: { action: () => Promise<void> }) {
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (!confirm("Diesen Satz endgültig löschen?")) return;
    startTransition(async () => {
      await action();
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-destructive disabled:opacity-50"
      aria-label="Löschen"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}
