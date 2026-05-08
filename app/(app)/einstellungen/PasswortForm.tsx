"use client";

import { useActionState, useRef } from "react";
import { Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitOverlay } from "@/components/ui/submit-overlay";
import { passwortAendern, type AktionsErgebnis } from "./actions";

export function PasswortForm() {
  const ref = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<
    AktionsErgebnis | null,
    FormData
  >(async (prev, fd) => {
    const result = await passwortAendern(prev, fd);
    if (result.ok) ref.current?.reset();
    return result;
  }, null);

  return (
    <form ref={ref} action={action} className="space-y-5">
      <SubmitOverlay pending={pending} message="Passwort wird geändert …" />
      <div className="grid gap-5 sm:grid-cols-2 sm:max-w-xl">
        <div className="space-y-2">
          <Label htmlFor="neu">Neues Passwort</Label>
          <Input
            id="neu"
            name="neu"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Mindestens 8 Zeichen"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="wiederholung">Neues Passwort wiederholen</Label>
          <Input
            id="wiederholung"
            name="wiederholung"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
      </div>

      {state?.message && (
        <p
          className={
            state.ok
              ? "inline-flex items-center gap-2 rounded-md bg-[hsl(var(--success)/0.12)] px-3 py-2 text-xs font-medium text-[hsl(var(--success))]"
              : "inline-flex items-center gap-2 rounded-md bg-[hsl(var(--destructive)/0.1)] px-3 py-2 text-xs font-medium text-[hsl(var(--destructive))]"
          }
        >
          {state.ok ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <AlertCircle className="h-3.5 w-3.5" />
          )}
          {state.message}
        </p>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)]"
      >
        {pending ? "Speichern…" : "Passwort ändern"}
      </Button>
    </form>
  );
}
