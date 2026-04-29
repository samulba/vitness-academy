"use client";

import { useActionState } from "react";
import { Check, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { emailAendern, type AktionsErgebnis } from "./actions";

export function EmailForm({ aktuelleEmail }: { aktuelleEmail: string }) {
  const [state, action, pending] = useActionState<
    AktionsErgebnis | null,
    FormData
  >(emailAendern, null);

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-2 max-w-md">
        <Label htmlFor="email">Neue E-Mail-Adresse</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={aktuelleEmail}
        />
      </div>

      <div className="flex items-start gap-2 rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(var(--brand-pink))]" />
        <span>
          Du bekommst eine Bestätigungsmail an die alte UND die neue Adresse.
          Erst wenn du beide bestätigst, ist der Wechsel aktiv.
        </span>
      </div>

      {state?.message && (
        <p
          className={
            state.ok
              ? "inline-flex items-start gap-2 rounded-md bg-[hsl(var(--success)/0.12)] px-3 py-2 text-xs font-medium text-[hsl(var(--success))]"
              : "inline-flex items-start gap-2 rounded-md bg-[hsl(var(--destructive)/0.1)] px-3 py-2 text-xs font-medium text-[hsl(var(--destructive))]"
          }
        >
          {state.ok ? (
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          )}
          <span>{state.message}</span>
        </p>
      )}

      <Button
        type="submit"
        disabled={pending}
        variant="outline"
      >
        {pending ? "Senden…" : "E-Mail wechseln"}
      </Button>
    </form>
  );
}
