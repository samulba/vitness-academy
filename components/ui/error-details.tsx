"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronUp, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Zeigt die echten Fehler-Details in einer Error-Boundary-Page:
 *   - error.message immer sichtbar (sonst raten wir)
 *   - error.digest klein dazu (Vercel-Log-Lookup)
 *   - error.stack collapsible (default expanded in Dev, collapsed in Prod)
 *   - Copy-Button packt einen kompletten Fehler-Report (URL, Time, UA,
 *     Digest, Message, Stack) in die Zwischenablage -- User kann das
 *     einfach an mich (Entwickler) schicken.
 *
 * Eingebaut in app/(admin)/error.tsx, app/(app)/error.tsx,
 * app/global-error.tsx.
 */
export function ErrorDetails({
  error,
}: {
  error: Error & { digest?: string };
}) {
  const istDev = process.env.NODE_ENV !== "production";
  const [stackOffen, setStackOffen] = useState(istDev);
  const [kopiert, setKopiert] = useState(false);

  const message = error.message || "Unbekannter Fehler ohne Message";
  const stack = error.stack || "(kein Stack verfuegbar)";

  function reportText(): string {
    const url =
      typeof window !== "undefined" ? window.location.href : "(server)";
    const ua =
      typeof navigator !== "undefined" ? navigator.userAgent : "(server)";
    const time = new Date().toISOString();
    return [
      `URL:       ${url}`,
      `Time:      ${time}`,
      `UserAgent: ${ua}`,
      `Digest:    ${error.digest ?? "(none)"}`,
      `Message:   ${message}`,
      `Stack:`,
      stack,
    ].join("\n");
  }

  async function kopieren() {
    try {
      await navigator.clipboard.writeText(reportText());
      setKopiert(true);
      setTimeout(() => setKopiert(false), 2000);
    } catch {
      // Fallback: Text in einen visible Textarea legen, manuell kopieren lassen
      // (rare path -- Browser ohne Clipboard-API)
      window.prompt("Fehler-Report kopieren:", reportText());
    }
  }

  return (
    <div className="mt-5 space-y-2 text-left">
      {/* Message immer sichtbar */}
      <div>
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Fehlermeldung
        </p>
        <pre className="max-h-32 overflow-auto whitespace-pre-wrap break-words rounded-md border border-border bg-muted/40 px-3 py-2 text-[11px] font-mono leading-relaxed text-foreground">
          {message}
        </pre>
      </div>

      {/* Digest klein */}
      {error.digest && (
        <p className="text-[10px] text-muted-foreground">
          Digest:{" "}
          <span className="font-mono text-[10px]">{error.digest}</span>
        </p>
      )}

      {/* Stack collapsible */}
      <div>
        <button
          type="button"
          onClick={() => setStackOffen((v) => !v)}
          className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
        >
          {stackOffen ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
          Stack-Trace {stackOffen ? "verbergen" : "anzeigen"}
        </button>
        {stackOffen && (
          <pre className="mt-1.5 max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-md border border-border bg-muted/40 px-3 py-2 text-[10px] font-mono leading-relaxed text-muted-foreground">
            {stack}
          </pre>
        )}
      </div>

      {/* Copy-Button */}
      <button
        type="button"
        onClick={kopieren}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[11px] font-medium transition-colors",
          kopiert
            ? "border-[hsl(var(--success)/0.4)] bg-[hsl(var(--success)/0.1)] text-[hsl(var(--success))]"
            : "border-border bg-background text-muted-foreground hover:border-[hsl(var(--brand-pink)/0.4)] hover:text-foreground",
        )}
      >
        {kopiert ? (
          <>
            <Check className="h-3 w-3" />
            Kopiert
          </>
        ) : (
          <>
            <Copy className="h-3 w-3" />
            Fehler-Report kopieren
          </>
        )}
      </button>
    </div>
  );
}
