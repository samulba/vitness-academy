"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type QuizOptionItem = {
  text: string;
  korrekt: boolean;
  erklaerung?: string;
};

export function QuizOptionenEditor({
  initial,
  hiddenName,
}: {
  initial: QuizOptionItem[];
  hiddenName: string;
}) {
  const [optionen, setOptionen] = useState<QuizOptionItem[]>(
    initial.length > 0
      ? initial
      : [
          { text: "", korrekt: false, erklaerung: "" },
          { text: "", korrekt: false, erklaerung: "" },
        ],
  );

  function update(i: number, patch: Partial<QuizOptionItem>) {
    setOptionen((alt) =>
      alt.map((o, idx) => (idx === i ? { ...o, ...patch } : o)),
    );
  }

  function entfernen(i: number) {
    setOptionen((alt) => alt.filter((_, idx) => idx !== i));
  }

  function hinzufuegen() {
    setOptionen((alt) => [
      ...alt,
      { text: "", korrekt: false, erklaerung: "" },
    ]);
  }

  return (
    <div className="space-y-3">
      <Label>Antwortoptionen</Label>
      <div className="space-y-2">
        {optionen.map((opt, i) => (
          <div
            key={i}
            className="space-y-2 rounded-lg border border-border bg-muted/30 p-3"
          >
            <div className="flex items-start gap-2">
              <Input
                value={opt.text}
                onChange={(e) => update(i, { text: e.target.value })}
                placeholder={`Option ${i + 1}`}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => entfernen(i)}
                aria-label="Option entfernen"
                disabled={optionen.length <= 2}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={opt.korrekt}
                  onChange={(e) => update(i, { korrekt: e.target.checked })}
                  className="h-4 w-4"
                />
                <span>richtige Antwort</span>
              </label>
            </div>
            <Input
              value={opt.erklaerung ?? ""}
              onChange={(e) => update(i, { erklaerung: e.target.value })}
              placeholder="Erklärung (optional, wird nach Klick gezeigt)"
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
        Option hinzufügen
      </Button>
      <input type="hidden" name={hiddenName} value={JSON.stringify(optionen)} />
    </div>
  );
}
