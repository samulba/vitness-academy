"use client";

import { useState } from "react";
import { Check, MessagesSquare, RotateCcw, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import type { SzenarioContent } from "@/lib/lektion";

export function Szenario({ content }: { content: SzenarioContent }) {
  const [gewaehlt, setGewaehlt] = useState<number | null>(null);

  function waehlen(i: number) {
    if (gewaehlt !== null) return;
    setGewaehlt(i);
  }

  function zuruecksetzen() {
    setGewaehlt(null);
  }

  const auswahl = gewaehlt !== null ? content.optionen[gewaehlt] : null;

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-[hsl(var(--brand-pink)/0.3)] bg-card">
      {/* Situation */}
      <div className="border-b border-border bg-[hsl(var(--brand-pink)/0.06)] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--brand-pink)/0.18)] text-[hsl(var(--brand-pink))]">
            <MessagesSquare className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--brand-pink))]">
              Szenario · Was würdest du tun?
            </p>
            <div className="prose-vitness mt-2 text-sm sm:text-base">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content.situation_markdown}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>

      {/* Optionen */}
      <div className="space-y-2 p-5 sm:p-6">
        {content.optionen.map((opt, i) => {
          const istGewaehlt = gewaehlt === i;
          const zeigeRichtigStatus = gewaehlt !== null && istGewaehlt;

          return (
            <button
              key={i}
              type="button"
              onClick={() => waehlen(i)}
              disabled={gewaehlt !== null}
              className={cn(
                "group flex w-full items-start gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all",
                gewaehlt === null &&
                  "border-border bg-background hover:border-[hsl(var(--brand-pink))] hover:bg-[hsl(var(--brand-pink)/0.06)]",
                zeigeRichtigStatus &&
                  opt.korrekt &&
                  "border-[hsl(var(--success))] bg-[hsl(var(--success)/0.1)]",
                zeigeRichtigStatus &&
                  !opt.korrekt &&
                  "border-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.08)]",
                gewaehlt !== null &&
                  !istGewaehlt &&
                  "border-border bg-background opacity-50",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
                  gewaehlt === null &&
                    "border-muted-foreground/40 bg-background text-muted-foreground group-hover:border-[hsl(var(--brand-pink))] group-hover:text-[hsl(var(--brand-pink))]",
                  zeigeRichtigStatus &&
                    opt.korrekt &&
                    "border-[hsl(var(--success))] bg-[hsl(var(--success))] text-white",
                  zeigeRichtigStatus &&
                    !opt.korrekt &&
                    "border-[hsl(var(--destructive))] bg-[hsl(var(--destructive))] text-white",
                  gewaehlt !== null &&
                    !istGewaehlt &&
                    "border-muted-foreground/30 text-muted-foreground",
                )}
              >
                {zeigeRichtigStatus && opt.korrekt ? (
                  <Check className="h-3 w-3" strokeWidth={3} />
                ) : zeigeRichtigStatus && !opt.korrekt ? (
                  <X className="h-3 w-3" strokeWidth={3} />
                ) : (
                  String.fromCharCode(65 + i)
                )}
              </span>
              <span className="flex-1 text-sm font-medium text-foreground sm:text-base">
                {opt.text}
              </span>
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {auswahl && (
        <div
          className={cn(
            "border-t-2 p-5 sm:p-6",
            auswahl.korrekt
              ? "border-[hsl(var(--success))] bg-[hsl(var(--success)/0.08)]"
              : "border-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.06)]",
          )}
        >
          <div className="flex items-start gap-3">
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                auswahl.korrekt
                  ? "bg-[hsl(var(--success))] text-white"
                  : "bg-[hsl(var(--destructive))] text-white",
              )}
            >
              {auswahl.korrekt ? (
                <Check className="h-4 w-4" strokeWidth={3} />
              ) : (
                <X className="h-4 w-4" strokeWidth={3} />
              )}
            </span>
            <div className="flex-1">
              <p
                className={cn(
                  "text-sm font-semibold",
                  auswahl.korrekt
                    ? "text-[hsl(var(--success))]"
                    : "text-[hsl(var(--destructive))]",
                )}
              >
                {auswahl.korrekt ? "Gute Wahl!" : "Nicht die beste Wahl"}
              </p>
              <div className="prose-vitness mt-1 text-sm sm:text-base">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {auswahl.feedback_markdown}
                </ReactMarkdown>
              </div>
              <button
                type="button"
                onClick={zuruecksetzen}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
              >
                <RotateCcw className="h-3 w-3" /> Andere Antwort wählen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
