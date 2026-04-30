"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  archivieren: () => Promise<{ ok: true } | { ok: false; message: string }>;
};

export function ArchivierenButton({ archivieren }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    if (
      !confirm(
        "Rolle archivieren? Sie kann nicht mehr ausgewählt werden, bestehende Permissions bleiben aber bestehen.",
      )
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await archivieren();
      if (res.ok) {
        router.push("/admin/rollen");
      } else {
        setError(res.message);
      }
    });
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        onClick={onClick}
        disabled={pending}
        className="text-muted-foreground hover:text-destructive"
      >
        <Archive />
        {pending ? "Wird archiviert…" : "Rolle archivieren"}
      </Button>
      {error && (
        <p className="rounded-md bg-[hsl(var(--destructive)/0.1)] px-2.5 py-1.5 text-xs font-medium text-[hsl(var(--destructive))]">
          {error}
        </p>
      )}
    </div>
  );
}
