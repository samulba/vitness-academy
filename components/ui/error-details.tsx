"use client";

import { useEffect, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  RefreshCw,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { bugAusPopupMelden } from "@/app/(app)/bug-reports/actions";
import { BUG_STATUS_LABEL } from "@/lib/bug-reports-types";

/**
 * Erkennt einen ChunkLoadError -- der tritt klassisch nach einem
 * Vercel-Deploy auf, wenn der Browser eine alte Version der App
 * geöffnet hat und ein neuer Chunk-Hash nicht mehr existiert.
 * In dem Fall reicht ein Hard-Reload (window.location.reload mit
 * cache-busting), um die neueste Version zu laden.
 */
function istChunkLoadError(error: Error): boolean {
  const m = error.message || "";
  return (
    m.includes("Loading chunk") ||
    m.includes("ChunkLoadError") ||
    m.includes("Loading CSS chunk") ||
    error.name === "ChunkLoadError"
  );
}

const RELOAD_FLAG = "__vitness_chunk_reload__";

/**
 * Zeigt die echten Fehler-Details in einer Error-Boundary-Page:
 *   - error.message immer sichtbar (sonst raten wir)
 *   - error.digest klein dazu (Vercel-Log-Lookup)
 *   - error.stack collapsible (default expanded in Dev, collapsed in Prod)
 *   - Copy-Button packt einen kompletten Fehler-Report (URL, Time, UA,
 *     Digest, Message, Stack) in die Zwischenablage -- User kann das
 *     einfach an mich (Entwickler) schicken.
 *
 * SPECIAL CASE: ChunkLoadError. Tritt auf wenn der Browser eine alte
 * App-Version offen hat und nach einem Vercel-Deploy einen gelöschten
 * Chunk laedt. Wir reloaden dann automatisch (1x pro Session via
 * sessionStorage-Flag, sonst Reload-Loop).
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
  const [autoReload, setAutoReload] = useState(false);
  const [reportFormOffen, setReportFormOffen] = useState(false);
  const [reportBeschreibung, setReportBeschreibung] = useState("");
  const [reportPending, setReportPending] = useState(false);
  const [reportErgebnis, setReportErgebnis] = useState<
    | { typ: "neu" }
    | { typ: "bekannt"; status: string; count: number }
    | { typ: "fehler"; message: string }
    | null
  >(null);

  const message = error.message || "Unbekannter Fehler ohne Message";
  const stack = error.stack || "(kein Stack verfuegbar)";
  const istChunk = istChunkLoadError(error);

  // Auto-Reload bei ChunkLoadError -- aber nur 1x pro Session
  // (sessionStorage-Flag), sonst Endlos-Loop wenn der Reload selbst
  // wieder failt. Mit 800ms Delay damit User den Hint kurz sieht.
  useEffect(() => {
    if (!istChunk) return;
    if (typeof window === "undefined") return;
    const schonReloaded = sessionStorage.getItem(RELOAD_FLAG);
    if (schonReloaded) return;
    sessionStorage.setItem(RELOAD_FLAG, "1");
    setAutoReload(true);
    const t = setTimeout(() => {
      // Reload mit Force-Cache-Bust über location.replace
      // (ersetzt History-Eintrag, damit Back-Button nicht zurueck
      // auf die kaputte Page geht).
      window.location.reload();
    }, 800);
    return () => clearTimeout(t);
  }, [istChunk]);

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

  async function fehlerMelden() {
    if (reportPending) return;
    setReportPending(true);
    setReportErgebnis(null);
    try {
      const pfad =
        typeof window !== "undefined" ? window.location.pathname : null;
      const ua =
        typeof navigator !== "undefined" ? navigator.userAgent : null;
      const res = await bugAusPopupMelden({
        digest: error.digest ?? null,
        pfad,
        userAgent: ua,
        message: error.message || null,
        stack: error.stack || null,
        beschreibung: reportBeschreibung.trim() || null,
      });
      if (!res.ok) {
        setReportErgebnis({ typ: "fehler", message: res.message });
      } else if (res.status === "bekannt") {
        setReportErgebnis({
          typ: "bekannt",
          status: BUG_STATUS_LABEL[res.bug_status] ?? res.bug_status,
          count: res.meldungen_count,
        });
      } else {
        setReportErgebnis({ typ: "neu" });
      }
    } catch (e) {
      setReportErgebnis({
        typ: "fehler",
        message:
          e instanceof Error ? e.message : "Unbekannter Fehler beim Senden.",
      });
    } finally {
      setReportPending(false);
    }
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

  // ChunkLoadError-Spezial-View: kompakte "Neue Version" Anzeige
  // statt der vollen Error-Details (wuerde User unnoetig irritieren).
  if (istChunk && autoReload) {
    return (
      <div className="mt-5 flex items-center gap-3 rounded-md border border-[hsl(var(--brand-pink)/0.3)] bg-[hsl(var(--brand-pink)/0.05)] px-4 py-3 text-left">
        <RefreshCw
          className="h-4 w-4 shrink-0 animate-spin text-[hsl(var(--brand-pink))]"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">Neue Version wird geladen…</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Es gibt ein Update der App. Wir laden gerade die aktuelle
            Version.
          </p>
        </div>
      </div>
    );
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

      {/* Bug melden -- direkt aus dem Popup */}
      <div className="pt-1">
        {reportErgebnis?.typ === "bekannt" ? (
          <div className="rounded-md border border-[hsl(var(--brand-pink)/0.3)] bg-[hsl(var(--brand-pink)/0.06)] px-3 py-2.5 text-[11px]">
            <p className="font-semibold text-foreground">
              Dieser Fehler ist uns bereits bekannt.
            </p>
            <p className="mt-1 text-muted-foreground">
              Status: <span className="font-medium text-foreground">{reportErgebnis.status}</span>
              {" · "}
              {reportErgebnis.count}× gemeldet. Wir arbeiten daran.
            </p>
          </div>
        ) : reportErgebnis?.typ === "neu" ? (
          <div className="rounded-md border border-[hsl(var(--success)/0.4)] bg-[hsl(var(--success)/0.1)] px-3 py-2.5 text-[11px]">
            <p className="font-semibold text-[hsl(var(--success))]">
              Danke! Wir kümmern uns drum.
            </p>
            <p className="mt-1 text-muted-foreground">
              Der Fehler wurde gemeldet und erscheint im Admin-Bereich.
            </p>
          </div>
        ) : reportErgebnis?.typ === "fehler" ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2.5 text-[11px]">
            <p className="font-semibold text-destructive">
              Melden fehlgeschlagen
            </p>
            <p className="mt-1 text-muted-foreground">
              {reportErgebnis.message}
            </p>
            <button
              type="button"
              onClick={() => setReportErgebnis(null)}
              className="mt-1.5 text-[10px] font-medium text-muted-foreground underline hover:text-foreground"
            >
              Nochmal versuchen
            </button>
          </div>
        ) : reportFormOffen ? (
          <div className="space-y-2 rounded-md border border-border bg-muted/30 px-3 py-3">
            <label
              htmlFor="bug-beschreibung"
              className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Was wolltest du gerade tun? (optional)
            </label>
            <textarea
              id="bug-beschreibung"
              value={reportBeschreibung}
              onChange={(e) => setReportBeschreibung(e.target.value)}
              rows={3}
              placeholder="z.B. „Wollte einen neuen Kontakt anlegen, beim Speichern kam dieser Fehler"
              className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={fehlerMelden}
                disabled={reportPending}
                className="inline-flex items-center gap-1.5 rounded-md bg-[hsl(var(--primary))] px-3 py-1.5 text-[11px] font-semibold text-[hsl(var(--primary-foreground))] transition-colors hover:bg-[hsl(var(--primary)/0.9)] disabled:opacity-60"
              >
                <Send className="h-3 w-3" />
                {reportPending ? "Wird gesendet…" : "Senden"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setReportFormOffen(false);
                  setReportBeschreibung("");
                }}
                className="rounded-md border border-border bg-background px-3 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground"
              >
                Abbrechen
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setReportFormOffen(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-[hsl(var(--primary))] px-3 py-1.5 text-[11px] font-semibold text-[hsl(var(--primary-foreground))] transition-colors hover:bg-[hsl(var(--primary)/0.9)]"
          >
            <Send className="h-3 w-3" />
            Diesen Fehler melden
          </button>
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
