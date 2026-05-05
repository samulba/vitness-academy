"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ListChecks } from "lucide-react";
import type { ChecklistItemMitProgress } from "@/lib/onboarding-checklist-types";
import { checklistTogglen } from "@/app/(admin)/admin/benutzer/actions";
import { formatDatum } from "@/lib/format";

export function OnboardingChecklist({
  benutzerId,
  items,
}: {
  benutzerId: string;
  items: ChecklistItemMitProgress[];
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
        <ListChecks className="mx-auto h-6 w-6 text-muted-foreground/40" />
        <p className="mt-2">
          Noch keine Checklist-Items angelegt.
        </p>
        <p className="mt-1 text-[11px]">
          Items werden in den Onboarding-Templates gepflegt.
        </p>
      </div>
    );
  }

  const erledigt = items.filter((i) => i.erledigt_am !== null).length;
  const prozent = (erledigt / items.length) * 100;

  return (
    <div className="space-y-3">
      {/* Progress-Bar */}
      <div>
        <div className="mb-1.5 flex items-baseline justify-between gap-2 text-xs">
          <span className="font-medium">Fortschritt</span>
          <span className="tabular-nums">
            <strong>{erledigt}</strong>{" "}
            <span className="text-muted-foreground">
              / {items.length} (
              {Math.round(prozent)}&nbsp;%)
            </span>
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className={
              prozent >= 100
                ? "h-full bg-[hsl(var(--success))] transition-all"
                : "h-full bg-[hsl(var(--brand-pink))] transition-all"
            }
            style={{ width: `${Math.min(100, prozent)}%` }}
          />
        </div>
      </div>

      {/* Liste */}
      <ul className="space-y-1.5">
        {items.map((item) => (
          <ChecklistRow key={item.id} item={item} benutzerId={benutzerId} />
        ))}
      </ul>
    </div>
  );
}

function ChecklistRow({
  item,
  benutzerId,
}: {
  item: ChecklistItemMitProgress;
  benutzerId: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const istErledigt = item.erledigt_am !== null;

  const toggle = () => {
    startTransition(async () => {
      await checklistTogglen(item.id, benutzerId);
      router.refresh();
    });
  };

  return (
    <li className="flex items-start gap-3 rounded-lg border border-border bg-card px-3 py-2.5 transition-colors hover:bg-muted/40">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-label={istErledigt ? "Als offen markieren" : "Als erledigt markieren"}
        className={
          istErledigt
            ? "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[hsl(var(--success))] text-white transition-transform hover:scale-110"
            : "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-border bg-background transition-colors hover:border-[hsl(var(--primary))]"
        }
      >
        {istErledigt && <Check className="h-3 w-3" strokeWidth={3} />}
      </button>
      <div className="min-w-0 flex-1">
        <p
          className={
            istErledigt
              ? "text-sm text-muted-foreground line-through"
              : "text-sm font-medium"
          }
        >
          {item.label}
        </p>
        {item.beschreibung && (
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {item.beschreibung}
          </p>
        )}
        {istErledigt && item.erledigt_am && (
          <p className="mt-1 text-[10px] text-muted-foreground">
            erledigt am {formatDatum(item.erledigt_am)}
            {item.erledigt_von_name && ` von ${item.erledigt_von_name}`}
          </p>
        )}
      </div>
    </li>
  );
}
