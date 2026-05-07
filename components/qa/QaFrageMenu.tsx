"use client";

import { CheckCircle2, RotateCcw, Trash2 } from "lucide-react";
import {
  frageLoeschen,
  frageAlsGeloestMarkieren,
} from "@/app/(app)/lektionen/[id]/qa-actions";

export function QaFrageMenu({
  lessonId,
  questionId,
  resolved,
  istFuehrung,
}: {
  lessonId: string;
  questionId: string;
  resolved: boolean;
  istFuehrung: boolean;
}) {
  const loeschenAction = frageLoeschen.bind(null, lessonId, questionId);
  const markierenAction = frageAlsGeloestMarkieren.bind(
    null,
    lessonId,
    questionId,
    !resolved,
  );

  return (
    <div className="flex items-center gap-1">
      {istFuehrung && (
        <form action={markierenAction}>
          <button
            type="submit"
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title={resolved ? "Wieder offen" : "Als gelöst markieren"}
          >
            {resolved ? (
              <RotateCcw className="h-3.5 w-3.5" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" />
            )}
          </button>
        </form>
      )}
      <form action={loeschenAction}>
        <button
          type="submit"
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          title="Löschen"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}
