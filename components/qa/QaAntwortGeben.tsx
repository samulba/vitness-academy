"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Send, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { antwortGeben } from "@/app/(app)/lektionen/[id]/qa-actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      <Send className="h-4 w-4" />
      {pending ? "Sendet …" : "Antworten"}
    </Button>
  );
}

export function QaAntwortGeben({
  lessonId,
  questionId,
}: {
  lessonId: string;
  questionId: string;
}) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-[hsl(var(--brand-pink))]"
      >
        <Reply className="h-3.5 w-3.5" />
        Antworten
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await antwortGeben(lessonId, questionId, formData);
        formRef.current?.reset();
        setOpen(false);
      }}
      className="space-y-2"
    >
      <textarea
        name="body"
        required
        minLength={2}
        maxLength={4000}
        rows={3}
        autoFocus
        placeholder="Deine Antwort …"
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <div className="flex flex-wrap gap-2">
        <Submit />
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setOpen(false)}
        >
          Abbrechen
        </Button>
      </div>
    </form>
  );
}
