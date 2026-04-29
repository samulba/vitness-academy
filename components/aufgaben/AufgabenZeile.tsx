"use client";

import { useTransition } from "react";
import { Check, Clock, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { aufgabeAbhaken } from "@/app/(app)/aufgaben/actions";
import type { Aufgabe } from "@/lib/aufgaben";

const PRIO_STYLE = {
  low: "bg-muted text-muted-foreground",
  normal: "bg-[hsl(var(--brand-pink)/0.12)] text-[hsl(var(--brand-pink))]",
  high: "bg-[hsl(var(--destructive)/0.12)] text-[hsl(var(--destructive))]",
} as const;

const PRIO_LABEL = {
  low: "Niedrig",
  normal: "Normal",
  high: "Hoch",
} as const;

export function AufgabenZeile({ a }: { a: Aufgabe }) {
  const [pending, startTransition] = useTransition();
  const istErledigt = !!a.completed_at;

  function toggle() {
    startTransition(async () => {
      await aufgabeAbhaken(a.id, istErledigt);
    });
  }

  return (
    <div
      className={cn(
        "flex items-start gap-4 px-5 py-4 transition-colors hover:bg-muted/30",
        istErledigt && "opacity-60",
      )}
    >
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={istErledigt}
        className={cn(
          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
          istErledigt
            ? "border-[hsl(var(--success))] bg-[hsl(var(--success))] text-white"
            : "border-border bg-background hover:border-[hsl(var(--primary))]",
        )}
      >
        {istErledigt && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p
            className={cn(
              "text-sm font-semibold leading-tight sm:text-base",
              istErledigt && "line-through",
            )}
          >
            {a.title}
          </p>
          {a.priority !== "normal" && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                PRIO_STYLE[a.priority],
              )}
            >
              {PRIO_LABEL[a.priority]}
            </span>
          )}
        </div>
        {a.description && (
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
            {a.description}
          </p>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            {a.assigned_to ? (
              <>
                <User className="h-3 w-3" />
                {a.assigned_to_name ?? "Person"}
              </>
            ) : (
              <>
                <Users className="h-3 w-3" />
                Team
              </>
            )}
          </span>
          {a.due_date && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {a.due_date}
            </span>
          )}
          {istErledigt && a.completed_by_name && (
            <span className="text-[hsl(var(--success))]">
              ✓ {a.completed_by_name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
