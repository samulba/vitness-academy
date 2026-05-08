"use client";

import { useActionState } from "react";
import { Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitOverlay } from "@/components/ui/submit-overlay";
import { profilAktualisieren, type AktionsErgebnis } from "./actions";

export function ProfilForm({
  initialFirstName,
  initialLastName,
  initialPhone,
}: {
  initialFirstName: string;
  initialLastName: string;
  initialPhone: string;
}) {
  const [state, action, pending] = useActionState<
    AktionsErgebnis | null,
    FormData
  >(profilAktualisieren, null);

  return (
    <form action={action} className="space-y-5">
      <SubmitOverlay pending={pending} message="Profil wird gespeichert …" />
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="first_name">Vorname</Label>
          <Input
            id="first_name"
            name="first_name"
            defaultValue={initialFirstName}
            maxLength={60}
            autoComplete="given-name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Nachname</Label>
          <Input
            id="last_name"
            name="last_name"
            defaultValue={initialLastName}
            maxLength={60}
            autoComplete="family-name"
          />
        </div>
      </div>

      <div className="space-y-2 max-w-md">
        <Label htmlFor="phone">
          Telefon{" "}
          <span className="text-xs font-normal text-muted-foreground">
            (optional)
          </span>
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={initialPhone}
          maxLength={40}
          autoComplete="tel"
          placeholder="+49 …"
        />
        <p className="text-xs text-muted-foreground">
          Damit dich die Studioleitung im Notfall erreichen kann.
        </p>
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
        {pending ? "Speichern…" : "Speichern"}
      </Button>
    </form>
  );
}
