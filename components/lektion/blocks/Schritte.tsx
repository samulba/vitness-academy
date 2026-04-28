"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Footprints, Lightbulb } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import type { SchritteContent } from "@/lib/lektion";

export function Schritte({ content }: { content: SchritteContent }) {
  const [aktuell, setAktuell] = useState(0);
  const [fertig, setFertig] = useState(false);

  const total = content.schritte.length;
  if (total === 0) return null;
  const schritt = content.schritte[Math.min(aktuell, total - 1)];
  const istLetzter = aktuell === total - 1;
  const fortschritt = ((aktuell + 1) / total) * 100;

  function weiter() {
    if (istLetzter) {
      setFertig(true);
      return;
    }
    setAktuell((a) => Math.min(a + 1, total - 1));
  }

  function zurueck() {
    setAktuell((a) => Math.max(a - 1, 0));
    setFertig(false);
  }

  function nochmal() {
    setAktuell(0);
    setFertig(false);
  }

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-[hsl(var(--brand-lime)/0.3)] bg-card">
      {/* Header */}
      <div className="border-b border-border bg-[hsl(var(--brand-lime)/0.06)] px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--brand-lime)/0.2)] text-[hsl(var(--primary))]">
            <Footprints className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--brand-pink))]">
              Schritt für Schritt
            </p>
            <p className="text-base font-semibold text-foreground sm:text-lg">
              {content.titel}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
            {Math.min(aktuell + 1, total)} / {total}
          </span>
        </div>

        {/* Progress */}
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="brand-gradient h-full rounded-full transition-all duration-500"
            style={{ width: fertig ? "100%" : `${fortschritt}%` }}
          />
        </div>
      </div>

      {/* Body */}
      {fertig ? (
        <div className="space-y-4 p-6 text-center sm:p-8">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]">
            <CheckCircle2 className="h-7 w-7" />
          </span>
          <p className="text-lg font-semibold text-foreground">
            Alle Schritte durchgegangen — top!
          </p>
          <button
            type="button"
            onClick={nochmal}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
          >
            Nochmal von vorn
          </button>
        </div>
      ) : (
        <div className="space-y-4 p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Schritt {aktuell + 1}
          </p>
          <h4 className="text-xl font-semibold text-foreground sm:text-2xl">
            {schritt.titel}
          </h4>
          <div className="prose-vitness text-sm sm:text-base">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {schritt.body_markdown}
            </ReactMarkdown>
          </div>

          {schritt.hinweis && (
            <div className="flex gap-3 rounded-lg border border-[hsl(var(--brand-lime)/0.4)] bg-[hsl(var(--brand-lime)/0.08)] p-3 text-sm">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--primary))]" />
              <span className="text-foreground">{schritt.hinweis}</span>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      {!fertig && (
        <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/30 px-5 py-3">
          <button
            type="button"
            onClick={zurueck}
            disabled={aktuell === 0}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium transition-colors",
              aktuell === 0
                ? "cursor-not-allowed text-muted-foreground/50"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Zurück
          </button>
          <button
            type="button"
            onClick={weiter}
            className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--primary))] px-5 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] shadow-sm transition-all hover:bg-[hsl(var(--primary)/0.9)]"
          >
            {istLetzter ? "Fertig" : "Weiter"}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
