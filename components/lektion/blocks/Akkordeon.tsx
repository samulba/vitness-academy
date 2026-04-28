"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import type { AkkordeonContent } from "@/lib/lektion";

export function Akkordeon({ content }: { content: AkkordeonContent }) {
  const [offen, setOffen] = useState<Set<number>>(new Set());

  function toggle(i: number) {
    setOffen((alt) => {
      const neu = new Set(alt);
      if (neu.has(i)) neu.delete(i);
      else neu.add(i);
      return neu;
    });
  }

  return (
    <div>
      {content.einleitung && (
        <div className="prose-vitness mb-4 text-sm sm:text-base">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content.einleitung}
          </ReactMarkdown>
        </div>
      )}

      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        {content.items.map((item, i) => {
          const istOffen = offen.has(i);
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => toggle(i)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors",
                  istOffen
                    ? "bg-[hsl(var(--brand-lime)/0.06)]"
                    : "hover:bg-muted/50",
                )}
              >
                <span className="text-sm font-semibold text-foreground sm:text-base">
                  {item.frage}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300",
                    istOffen && "rotate-180 text-[hsl(var(--brand-teal))]",
                  )}
                />
              </button>
              <div
                className={cn(
                  "grid transition-all duration-300 ease-out",
                  istOffen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0",
                )}
              >
                <div className="overflow-hidden">
                  <div className="prose-vitness px-5 pb-5 text-sm sm:text-base">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {item.antwort_markdown}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
