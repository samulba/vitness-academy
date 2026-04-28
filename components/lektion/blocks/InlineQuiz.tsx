"use client";

import { useState } from "react";
import { Check, HelpCircle, RotateCcw, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import type { InlineQuizContent } from "@/lib/lektion";

export function InlineQuiz({ content }: { content: InlineQuizContent }) {
  const [auswahl, setAuswahl] = useState<Set<number>>(new Set());
  const [geprueft, setGeprueft] = useState(false);

  const istMultiple = content.typ === "multiple";

  function toggle(i: number) {
    if (geprueft) return;
    setAuswahl((alt) => {
      const neu = new Set(alt);
      if (istMultiple) {
        if (neu.has(i)) neu.delete(i);
        else neu.add(i);
      } else {
        neu.clear();
        neu.add(i);
      }
      return neu;
    });
  }

  function pruefen() {
    if (auswahl.size === 0) return;
    setGeprueft(true);
  }

  function zuruecksetzen() {
    setAuswahl(new Set());
    setGeprueft(false);
  }

  const allesRichtig =
    geprueft &&
    content.optionen.every((opt, i) => opt.korrekt === auswahl.has(i));

  return (
    <div className="rounded-2xl border-2 border-[hsl(var(--brand-pink)/0.3)] bg-[hsl(var(--brand-pink)/0.04)] p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--brand-pink)/0.15)] text-[hsl(var(--brand-pink))]">
          <HelpCircle className="h-4 w-4" />
        </span>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--brand-pink))]">
            Mini-Quiz · {istMultiple ? "Mehrere Antworten möglich" : "Eine Antwort"}
          </p>
          <p className="mt-1 text-base font-semibold text-foreground sm:text-lg">
            {content.frage}
          </p>
        </div>
      </div>

      <ul className="mt-5 space-y-2">
        {content.optionen.map((opt, i) => {
          const istGewaehlt = auswahl.has(i);
          const zeigeAlsRichtig = geprueft && opt.korrekt;
          const zeigeAlsFalsch = geprueft && istGewaehlt && !opt.korrekt;

          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => toggle(i)}
                disabled={geprueft}
                className={cn(
                  "group flex w-full items-start gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all",
                  !geprueft &&
                    !istGewaehlt &&
                    "border-border bg-background hover:border-[hsl(var(--brand-pink))] hover:bg-[hsl(var(--brand-pink)/0.06)]",
                  !geprueft &&
                    istGewaehlt &&
                    "border-[hsl(var(--brand-pink))] bg-[hsl(var(--brand-pink)/0.1)]",
                  zeigeAlsRichtig &&
                    "border-[hsl(var(--success))] bg-[hsl(var(--success)/0.1)]",
                  zeigeAlsFalsch &&
                    "border-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.08)]",
                  geprueft &&
                    !zeigeAlsRichtig &&
                    !zeigeAlsFalsch &&
                    "border-border bg-background opacity-60",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border-2 transition-colors",
                    istMultiple ? "rounded-md" : "rounded-full",
                    !geprueft &&
                      !istGewaehlt &&
                      "border-muted-foreground/40 bg-background",
                    !geprueft &&
                      istGewaehlt &&
                      "border-[hsl(var(--brand-pink))] bg-[hsl(var(--brand-pink))]",
                    zeigeAlsRichtig &&
                      "border-[hsl(var(--success))] bg-[hsl(var(--success))]",
                    zeigeAlsFalsch &&
                      "border-[hsl(var(--destructive))] bg-[hsl(var(--destructive))]",
                  )}
                >
                  {zeigeAlsRichtig && (
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                  )}
                  {zeigeAlsFalsch && (
                    <X className="h-3 w-3 text-white" strokeWidth={3} />
                  )}
                  {!geprueft && istGewaehlt && (
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                  )}
                </span>
                <span className="flex-1">
                  <span className="text-sm font-medium text-foreground sm:text-base">
                    {opt.text}
                  </span>
                  {geprueft && opt.erklaerung && (zeigeAlsRichtig || zeigeAlsFalsch) && (
                    <span className="prose-vitness mt-1.5 block text-xs text-muted-foreground sm:text-sm">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {opt.erklaerung}
                      </ReactMarkdown>
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 flex items-center gap-3">
        {!geprueft ? (
          <button
            type="button"
            onClick={pruefen}
            disabled={auswahl.size === 0}
            className="rounded-full bg-[hsl(var(--primary))] px-5 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] shadow-sm transition-all hover:bg-[hsl(var(--primary)/0.9)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Antwort prüfen
          </button>
        ) : (
          <>
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold",
                allesRichtig
                  ? "bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]"
                  : "bg-[hsl(var(--destructive)/0.12)] text-[hsl(var(--destructive))]",
              )}
            >
              {allesRichtig ? (
                <>
                  <Check className="h-4 w-4" /> Richtig!
                </>
              ) : (
                <>
                  <X className="h-4 w-4" /> Nicht ganz
                </>
              )}
            </span>
            <button
              type="button"
              onClick={zuruecksetzen}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Nochmal
            </button>
          </>
        )}
      </div>
    </div>
  );
}
