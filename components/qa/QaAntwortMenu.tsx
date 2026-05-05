"use client";

import { Trash2 } from "lucide-react";
import { antwortLoeschen } from "@/app/(app)/lektionen/[id]/qa-actions";

export function QaAntwortMenu({
  lessonId,
  answerId,
}: {
  lessonId: string;
  answerId: string;
}) {
  const action = antwortLoeschen.bind(null, lessonId, answerId);
  return (
    <form action={action}>
      <button
        type="submit"
        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        title="Antwort löschen"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </form>
  );
}
