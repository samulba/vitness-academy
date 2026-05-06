"use client";

import { useEffect } from "react";

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

  return (
    <html lang="de">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          background: "#fafafa",
          color: "#0a0a0a",
        }}
      >
        <div
          style={{
            maxWidth: "28rem",
            width: "100%",
            textAlign: "center",
            border: "1px solid #e5e5e5",
            borderRadius: "1rem",
            padding: "2rem",
            background: "#ffffff",
          }}
        >
          <h1 style={{ fontSize: "1.25rem", fontWeight: 600, marginTop: 0 }}>
            Vitness Crew
          </h1>
          <p style={{ color: "#525252", fontSize: "0.875rem" }}>
            Es ist ein unerwarteter Fehler aufgetreten. Bitte lade die Seite neu.
          </p>
          {error.digest && (
            <p
              style={{
                fontFamily: "monospace",
                fontSize: "0.625rem",
                color: "#737373",
                marginTop: "0.75rem",
              }}
            >
              Code: {error.digest}
            </p>
          )}
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
