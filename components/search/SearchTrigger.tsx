"use client";

import { Search } from "lucide-react";

export function SearchTrigger() {
  function open() {
    window.dispatchEvent(new CustomEvent("vitness:open-search"));
  }

  return (
    <button
      type="button"
      onClick={open}
      className="group flex w-full items-center gap-3 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-[hsl(var(--primary))] hover:text-foreground"
    >
      <Search className="h-4 w-4" strokeWidth={1.75} />
      <span>Suchen</span>
      <span className="ml-auto rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
        ⌘K
      </span>
    </button>
  );
}
