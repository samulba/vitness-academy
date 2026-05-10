"use client";

import { useEffect } from "react";
import { ErrorDetails } from "@/components/ui/error-details";

/**
 * Wird gerendert wenn der Root-Layout-Render selbst crasht. Muss eigene
 * <html> und <body> rendern (Next.js-Vorgabe). Wir importieren Tailwind
 * via globals.css indirekt -- Next.js inlined es trotzdem im global-error
 * Render.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global error boundary]", error);
  }, [error]);

  // Inline-Styles weil global-error potenziell vor CSS-Loaded gerendert
  // werden kann. Wir bleiben minimal aber zeigen die Details.
  return (
    <html lang="de">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          background: "#fafafa",
          color: "#0a0a0a",
        }}
      >
        <div
          style={{
            maxWidth: "32rem",
            width: "100%",
            border: "1px solid #e5e5e5",
            borderRadius: "1rem",
            padding: "1.75rem",
            background: "#ffffff",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 600, marginTop: 0 }}>
              Vitness Crew
            </h1>
            <p style={{ color: "#525252", fontSize: "0.875rem", margin: "0.5rem 0 0" }}>
              Es ist ein unerwarteter Fehler aufgetreten. Kopier den Report
              unten und schick ihn an die Studioleitung.
            </p>
          </div>

          {/* ErrorDetails nutzt Tailwind-Klassen -- in global-error wird
              globals.css meist mitgeladen, für den seltenen Fall dass
              nicht: die Inline-Styles oben sorgen für minimum Layout. */}
          <ErrorDetails error={error} />

          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              justifyContent: "center",
              marginTop: "1.5rem",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={reset}
              style={{
                background: "#b50f5f",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                padding: "0.5rem 1rem",
                fontWeight: 500,
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              Nochmal versuchen
            </button>
            <a
              href="/dashboard"
              style={{
                background: "white",
                color: "#0a0a0a",
                border: "1px solid #e5e5e5",
                borderRadius: "0.5rem",
                padding: "0.5rem 1rem",
                fontWeight: 500,
                fontSize: "0.875rem",
                textDecoration: "none",
              }}
            >
              Zum Dashboard
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
