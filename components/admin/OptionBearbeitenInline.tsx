"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SpeichernButton } from "@/components/admin/SpeichernButton";

export function OptionBearbeitenInline({
  action,
  label,
  is_correct,
}: {
  action: (formData: FormData) => Promise<void> | void;
  label: string;
  is_correct: boolean;
}) {
  const [offen, setOffen] = useState(false);

  if (!offen) {
    return (
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => setOffen(true)}
        aria-label="Bearbeiten"
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
    );
  }

  return (
    <form
      action={action}
      className="flex w-full flex-wrap items-center gap-2 rounded-md border bg-background p-2"
    >
      <Input name="label" defaultValue={label} required className="flex-1 min-w-[200px]" />
      <label className="flex items-center gap-1 text-xs">
        <input
          type="checkbox"
          name="is_correct"
          defaultChecked={is_correct}
          className="h-4 w-4 accent-success"
        />
        Richtig
      </label>
      <SpeichernButton label="Speichern" />
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => setOffen(false)}
      >
        Abbrechen
      </Button>
    </form>
  );
}
