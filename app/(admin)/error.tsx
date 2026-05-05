"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin error boundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--destructive)/0.12)] text-[hsl(var(--destructive))]">
          <AlertTriangle className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-xl font-semibold tracking-tight">
          Etwas ist schiefgelaufen
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Die Seite konnte nicht geladen werden. Versuch es nochmal — wenn der
          Fehler bleibt, melde dich bei der Studioleitung.
        </p>
        {error.digest && (
          <p className="mt-3 inline-block rounded-md bg-muted px-2 py-1 font-mono text-[10px] text-muted-foreground">
            Code: {error.digest}
          </p>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button onClick={reset} className="gap-2">
            <RotateCw className="h-4 w-4" />
            Nochmal versuchen
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4" />
              Zurück zur Übersicht
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
