"use client";

import { useState } from "react";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import type { AufdeckKarteContent } from "@/lib/lektion";

export function AufdeckKarte({ content }: { content: AufdeckKarteContent }) {
  const [aufgedeckt, setAufgedeckt] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setAufgedeckt((v) => !v)}
      className={cn(
        "group relative w-full overflow-hidden rounded-2xl border-2 p-6 text-left transition-all",
        aufgedeckt
          ? "border-[hsl(var(--brand-lime))] bg-[hsl(var(--brand-lime)/0.08)]"
          : "border-dashed border-border bg-card hover:border-[hsl(var(--brand-pink))] hover:bg-[hsl(var(--brand-pink)/0.04)]",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors",
            aufgedeckt
              ? "bg-[hsl(var(--brand-lime))] text-[hsl(var(--brand-ink))]"
              : "bg-muted text-muted-foreground group-hover:bg-[hsl(var(--brand-pink)/0.15)] group-hover:text-[hsl(var(--brand-pink))]",
          )}
        >
          {aufgedeckt ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
        </span>

        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {aufgedeckt ? "Antwort" : "Klick zum Aufdecken"}
          </p>
          <p className="mt-1 text-base font-semibold text-foreground sm:text-lg">
            {content.frage}
          </p>

          <div
            className={cn(
              "grid transition-all duration-500 ease-out",
              aufgedeckt
                ? "mt-4 grid-rows-[1fr] opacity-100"
                : "mt-0 grid-rows-[0fr] opacity-0",
            )}
          >
            <div className="overflow-hidden">
              <div className="prose-vitness text-sm sm:text-base">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content.antwort_markdown}
                </ReactMarkdown>
              </div>
            </div>
          </div>

          {!aufgedeckt && (
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--brand-pink))]">
              <Eye className="h-3.5 w-3.5" />
              Tippen zum Aufdecken
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
