"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type SzenarioOptionItem = {
  text: string;
  korrekt: boolean;
  feedback_markdown: string;
};

export function SzenarioOptionenEditor({
  initial,
  hiddenName,
}: {
  initial: SzenarioOptionItem[];
  hiddenName: string;
}) {
  const [optionen, setOptionen] = useState<SzenarioOptionItem[]>(
    initial.length > 0
      ? initial
      : [
          { text: "", korrekt: true, feedback_markdown: "" },
          { text: "", korrekt: false, feedback_markdown: "" },
          { text: "", korrekt: false, feedback_markdown: "" },
        ],
  );

  function update(i: number, patch: Partial<SzenarioOptionItem>) {
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
      { text: "", korrekt: false, feedback_markdown: "" },
    ]);
  }

  return (
    <div className="space-y-3">
      <Label>Antwort-Optionen</Label>
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
                placeholder={`Option ${String.fromCharCode(65 + i)}: kurze Aktion`}
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
                <span>richtige / gewünschte Reaktion</span>
              </label>
            </div>
            <textarea
              value={opt.feedback_markdown}
              onChange={(e) => update(i, { feedback_markdown: e.target.value })}
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Feedback nach Klick — warum gut/schlecht? (Markdown)"
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
