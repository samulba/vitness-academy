"use client";

import { useTransition } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { bookmarkUmschalten } from "@/app/(app)/wissen/actions";

type Props = {
  articleId: string;
  istGespeichert: boolean;
  /** "icon" = nur Stern (klein), "label" = Stern + Text */
  variant?: "icon" | "label";
};

export function BookmarkButton({
  articleId,
  istGespeichert,
  variant = "icon",
}: Props) {
  const [pending, startTransition] = useTransition();

  function umschalten(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      await bookmarkUmschalten(articleId, istGespeichert);
    });
  }

  const Icon = istGespeichert ? BookmarkCheck : Bookmark;
  const label = istGespeichert ? "Gespeichert" : "Speichern";

  if (variant === "label") {
    return (
      <button
        type="button"
        onClick={umschalten}
        disabled={pending}
        aria-pressed={istGespeichert}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
          istGespeichert
            ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]"
            : "border-border bg-background text-muted-foreground hover:border-[hsl(var(--primary))] hover:text-foreground",
          pending && "opacity-60",
        )}
      >
        <Icon className={cn("h-4 w-4", istGespeichert && "fill-current")} />
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={umschalten}
      disabled={pending}
      aria-label={label}
      aria-pressed={istGespeichert}
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-background transition-colors",
        istGespeichert
          ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))]"
          : "border-border text-muted-foreground hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]",
        pending && "opacity-60",
      )}
    >
      <Icon className={cn("h-4 w-4", istGespeichert && "fill-current")} />
    </button>
  );
}
