"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { abschlussLoeschen } from "./actions";

export function LoeschenButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    if (!confirm("Diesen Abschluss wirklich löschen?")) return;
    setError(null);
    startTransition(async () => {
      const res = await abschlussLoeschen(id);
      if (res.ok) router.refresh();
      else setError(res.message);
    });
  }

  return (
    <span className="inline-flex items-center gap-2">
      {error && (
        <span className="text-[10px] text-[hsl(var(--destructive))]">
          {error}
        </span>
      )}
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-destructive disabled:opacity-50"
        aria-label="Löschen"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}
