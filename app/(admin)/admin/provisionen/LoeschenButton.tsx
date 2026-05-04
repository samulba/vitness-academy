"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { abschlussLoeschenAdmin } from "@/app/(app)/provisionen/actions";

export function LoeschenButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (!confirm("Diesen Abschluss endgültig löschen?")) return;
    startTransition(async () => {
      await abschlussLoeschenAdmin(id);
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
