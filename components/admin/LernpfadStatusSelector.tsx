"use client";

import { useState } from "react";
import { Archive, FileEdit, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

const OPTIONEN = [
  {
    value: "entwurf",
    label: "Entwurf",
    icon: FileEdit,
    beschreibung: "Nur für Admins sichtbar",
  },
  {
    value: "aktiv",
    label: "Aktiv",
    icon: Sparkles,
    beschreibung: "Live für Mitarbeiter",
  },
  {
    value: "archiviert",
    label: "Archiviert",
    icon: Archive,
    beschreibung: "Ausgeblendet",
  },
] as const;

/**
 * iOS-Segmented-Control Pattern für Lernpfad-Status. Native Radio-
 * Inputs (sr-only) damit Form-Submit funktioniert; Visualisierung
 * via React-State, damit der Klick sofort sichtbar wird.
 */
export function LernpfadStatusSelector({
  name = "status",
  defaultValue,
}: {
  name?: string;
  defaultValue: string;
}) {
  const [selected, setSelected] = useState(defaultValue);
  return (
    <div className="space-y-2">
      <Label>Status</Label>
      <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-muted/50 p-1.5">
        {OPTIONEN.map((opt) => {
          const Icon = opt.icon;
          const aktiv = selected === opt.value;
          return (
            <label
              key={opt.value}
              className={cn(
                "group relative flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-center transition-all",
                aktiv
                  ? "border-[hsl(var(--primary)/0.4)] bg-card shadow-sm"
                  : "border-transparent hover:bg-card/60",
              )}
            >
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={aktiv}
                onChange={() => setSelected(opt.value)}
                className="sr-only"
              />
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
                  aktiv
                    ? "bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))]"
                    : "bg-background text-muted-foreground group-hover:text-foreground",
                )}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
              </span>
              <div className="space-y-0.5">
                <span
                  className={cn(
                    "block text-[12px] font-semibold leading-none",
                    aktiv ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {opt.label}
                </span>
                <span className="block text-[10px] leading-tight text-muted-foreground">
                  {opt.beschreibung}
                </span>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
