"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type AkkordeonItemEntry = {
  frage: string;
  antwort_markdown: string;
};

export function AkkordeonItemsEditor({
  initial,
  hiddenName,
}: {
  initial: AkkordeonItemEntry[];
  hiddenName: string;
}) {
  const [items, setItems] = useState<AkkordeonItemEntry[]>(
    initial.length > 0
      ? initial
      : [
          { frage: "", antwort_markdown: "" },
          { frage: "", antwort_markdown: "" },
        ],
  );

  function update(i: number, patch: Partial<AkkordeonItemEntry>) {
    setItems((alt) => alt.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }

  function entfernen(i: number) {
    setItems((alt) => alt.filter((_, idx) => idx !== i));
  }

  function hinzufuegen() {
    setItems((alt) => [...alt, { frage: "", antwort_markdown: "" }]);
  }

  return (
    <div className="space-y-3">
      <Label>Einträge</Label>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div
            key={i}
            className="space-y-2 rounded-lg border border-border bg-muted/30 p-3"
          >
            <div className="flex items-start gap-2">
              <Input
                value={it.frage}
                onChange={(e) => update(i, { frage: e.target.value })}
                placeholder={`Frage / Titel ${i + 1}`}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => entfernen(i)}
                aria-label="Eintrag entfernen"
                disabled={items.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <textarea
              value={it.antwort_markdown}
              onChange={(e) => update(i, { antwort_markdown: e.target.value })}
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Antwort als Markdown (Listen, **fett**, _kursiv_)"
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
        Eintrag hinzufügen
      </Button>
      <input type="hidden" name={hiddenName} value={JSON.stringify(items)} />
    </div>
  );
}
