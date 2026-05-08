"use client";

import { useActionState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { passwortSetzen, type SetPasswordErgebnis } from "./actions";

export function SetPasswordForm({ email }: { email: string | null }) {
  const [state, action, pending] = useActionState<
    SetPasswordErgebnis | null,
    FormData
  >(passwortSetzen, null);

  return (
    <form action={action} className="space-y-4">
      {email && (
        <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          Account: <span className="font-medium text-foreground">{email}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="passwort">Neues Passwort</Label>
        <Input
          id="passwort"
          name="passwort"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Mindestens 8 Zeichen"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="wiederholung">Passwort wiederholen</Label>
        <Input
          id="wiederholung"
          name="wiederholung"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>

      {state && !state.ok && (
        <p className="inline-flex items-center gap-2 rounded-lg border border-[hsl(var(--destructive)/0.3)] bg-[hsl(var(--destructive)/0.08)] px-3 py-2 text-xs font-medium text-[hsl(var(--destructive))]">
          <AlertCircle className="h-3.5 w-3.5" />
          {state.message}
        </p>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="w-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)]"
      >
        {pending ? "Speichere…" : "Passwort speichern und loslegen"}
      </Button>
    </form>
  );
}
