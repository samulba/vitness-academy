"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { HelpCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { frageStellen } from "@/app/(app)/lektionen/[id]/qa-actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      <Send className="h-4 w-4" />
      {pending ? "Wird gestellt …" : "Frage stellen"}
    </Button>
  );
}

export function QaFrageStellen({ lessonId }: { lessonId: string }) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  if (!open) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        className="border-[hsl(var(--brand-pink)/0.4)] text-[hsl(var(--brand-pink))] hover:bg-[hsl(var(--brand-pink)/0.06)]"
      >
        <HelpCircle className="h-4 w-4" />
        Frage stellen
      </Button>
    );
  }

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await frageStellen(lessonId, formData);
        formRef.current?.reset();
        setOpen(false);
      }}
      className="space-y-2 rounded-2xl border border-[hsl(var(--brand-pink)/0.3)] bg-[hsl(var(--brand-pink)/0.04)] p-4"
    >
      <label className="text-sm font-medium">Deine Frage</label>
      <textarea
        name="body"
        required
        minLength={5}
        maxLength={2000}
        rows={4}
        autoFocus
        placeholder="Was ist unklar? Je praeziser, desto besser kann jemand antworten."
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
