"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CalendarRange } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const PRESETS = [
  { key: "week", label: "Woche" },
  { key: "30days", label: "30 Tage" },
  { key: "90days", label: "90 Tage" },
  { key: "year", label: "Jahr" },
] as const;

/**
 * Range-Filter für die Auswertung. Schreibt URL-Params
 *   ?range=week|30days|90days|year|custom&von=YYYY-MM-DD&bis=YYYY-MM-DD
 * Server-Component lebt asynchronously von diesen URL-Params.
 */
export function RangeFilter({
  aktivRange,
  aktivVon,
  aktivBis,
}: {
  aktivRange: string;
  aktivVon: string;
  aktivBis: string;
}) {
  const router = useRouter();
  const search = useSearchParams();

  function preset(key: string) {
    const params = new URLSearchParams(search.toString());
    params.set("range", key);
    params.delete("von");
    params.delete("bis");
    router.push(`?${params.toString()}`);
  }

  function customDatum(name: "von" | "bis", value: string) {
    const params = new URLSearchParams(search.toString());
    params.set("range", "custom");
    if (value) params.set(name, value);
    else params.delete(name);
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-3">
      <div className="inline-flex flex-wrap gap-1">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => preset(p.key)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              aktivRange === p.key
                ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <CalendarRange className="h-3.5 w-3.5" />
        <span>Custom:</span>
        <Input
          type="date"
          value={aktivVon}
          onChange={(e) => customDatum("von", e.target.value)}
          className="h-9 w-auto"
        />
        <span>–</span>
        <Input
          type="date"
          value={aktivBis}
          onChange={(e) => customDatum("bis", e.target.value)}
          className="h-9 w-auto"
        />
      </div>
    </div>
  );
}
