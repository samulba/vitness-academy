"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, Inbox, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Status } from "@/lib/maengel-types";

type FilterEintrag = {
  value: Status | "meine" | null;
  label: string;
  count: number;
  icon: typeof Inbox;
};

export function FilterSidebar({
  eintraege,
  aktiv,
}: {
  eintraege: FilterEintrag[];
  aktiv: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setFilter(value: string | null) {
    const sp = new URLSearchParams(searchParams.toString());
    if (value === null) sp.delete("filter");
    else sp.set("filter", value);
    const qs = sp.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`);
  }

  return (
    <section>
      <p className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Filter
      </p>
      <ul className="space-y-0.5">
        {eintraege.map((e) => {
          const Icon = e.icon;
          const istAktiv = aktiv === (e.value ?? null);
          return (
            <li key={e.value ?? "alle"}>
              <button
                type="button"
                onClick={() => setFilter(e.value)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                  istAktiv
                    ? "bg-[hsl(var(--primary)/0.1)] font-medium text-[hsl(var(--primary))]"
                    : "text-foreground hover:bg-muted/60",
                )}
              >
                <span
                  className={cn(
                    "shrink-0",
                    istAktiv
                      ? "text-[hsl(var(--primary))]"
                      : "text-muted-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <span className="flex-1 truncate">{e.label}</span>
                <span
                  className={cn(
                    "tabular-nums text-xs",
                    istAktiv
                      ? "text-[hsl(var(--primary))]"
                      : "text-muted-foreground",
                  )}
                >
                  {e.count}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export const FILTER_ICONS = {
  Inbox,
  Clock,
  Wrench,
  CheckCircle2,
};
