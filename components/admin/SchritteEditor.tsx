"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type SchrittEntry = {
  titel: string;
  body_markdown: string;
  hinweis?: string | null;
};

export function SchritteEditor({
  initial,
  hiddenName,
}: {
  initial: SchrittEntry[];
  hiddenName: string;
}) {
  const [schritte, setSchritte] = useState<SchrittEntry[]>(
    initial.length > 0
      ? initial
      : [
          { titel: "", body_markdown: "", hinweis: "" },
          { titel: "", body_markdown: "", hinweis: "" },
        ],
  );

  function update(i: number, patch: Partial<SchrittEntry>) {
    setSchritte((alt) =>
      alt.map((s, idx) => (idx === i ? { ...s, ...patch } : s)),
    );
  }

  function entfernen(i: number) {
    setSchritte((alt) => alt.filter((_, idx) => idx !== i));
  }

  function hinzufuegen() {
    setSchritte((alt) => [
      ...alt,
      { titel: "", body_markdown: "", hinweis: "" },
    ]);
  }

  return (
    <div className="space-y-3">
      <Label>Schritte</Label>
      <div className="space-y-2">
        {schritte.map((s, i) => (
          <div
            key={i}
            className="space-y-2 rounded-lg border border-border bg-muted/30 p-3"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {i + 1}
              </span>
              <Input
                value={s.titel}
                onChange={(e) => update(i, { titel: e.target.value })}
                placeholder={`Titel von Schritt ${i + 1}`}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => entfernen(i)}
                aria-label="Schritt entfernen"
                disabled={schritte.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <textarea
              value={s.body_markdown}
              onChange={(e) => update(i, { body_markdown: e.target.value })}
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Was ist in diesem Schritt zu tun? (Markdown)"
            />
            <Input
              value={s.hinweis ?? ""}
              onChange={(e) => update(i, { hinweis: e.target.value })}
              placeholder="Optionaler Tipp / Lampen-Hinweis"
            />
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={hinzufuegen}
        className="gap-1.5"
      >
        <Plus className="h-3.5 w-3.5" />
        Schritt hinzufügen
      </Button>
      <input
        type="hidden"
        name={hiddenName}
        value={JSON.stringify(
          schritte.map((s) => ({
            ...s,
            hinweis: s.hinweis?.trim() ? s.hinweis : null,
          })),
        )}
      />
    </div>
  );
}
