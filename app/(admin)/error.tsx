"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorDetails } from "@/components/ui/error-details";

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
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-5 sm:p-8">
        <div className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--destructive)/0.12)] text-[hsl(var(--destructive))]">
            <AlertTriangle className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-balance text-lg font-semibold tracking-tight sm:text-xl">
            Etwas ist schiefgelaufen
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Versuch es nochmal. Wenn der Fehler bleibt, kopier den Report unten
            und schick ihn an den Entwickler.
          </p>
        </div>

        <div className="mt-5 grid gap-2 sm:flex sm:flex-wrap sm:justify-center">
          <Button onClick={reset} className="w-full gap-2 sm:w-auto">
            <RotateCw className="h-4 w-4" />
            Nochmal versuchen
          </Button>
          <Button asChild variant="outline" className="w-full gap-2 sm:w-auto">
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4" />
              Zurück zur Übersicht
            </Link>
          </Button>
        </div>

        <ErrorDetails error={error} />
      </div>
    </div>
  );
}
