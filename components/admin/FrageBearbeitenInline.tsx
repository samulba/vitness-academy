"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SpeichernButton } from "@/components/admin/SpeichernButton";

export function FrageBearbeitenInline({
  action,
  prompt,
  question_type,
}: {
  action: (formData: FormData) => Promise<void> | void;
  prompt: string;
  question_type: "single" | "multiple";
}) {
  const [offen, setOffen] = useState(false);

  if (!offen) {
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => setOffen(true)}
      >
        <Pencil className="h-3.5 w-3.5" />
        Bearbeiten
      </Button>
    );
  }

  return (
    <div className="w-full rounded-md border bg-background p-3">
      <form action={action} className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="prompt">Frage</Label>
          <Input id="prompt" name="prompt" defaultValue={prompt} required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="question_type">Typ</Label>
          <select
            id="question_type"
            name="question_type"
            defaultValue={question_type}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="single">Single Choice (eine Antwort)</option>
            <option value="multiple">Multiple Choice (mehrere Antworten)</option>
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setOffen(false)}
          >
            Abbrechen
          </Button>
          <SpeichernButton label="Speichern" />
        </div>
      </form>
    </div>
  );
}
