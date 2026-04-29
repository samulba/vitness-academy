"use client";

import { useActionState } from "react";
import { Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  profilAktualisieren,
  type AktionsErgebnis,
} from "./actions";

export function ProfilForm({ initialName }: { initialName: string }) {
  const [state, action, pending] = useActionState<
    AktionsErgebnis | null,
    FormData
  >(profilAktualisieren, null);

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="full_name">Vollständiger Name</Label>
        <Input
          id="full_name"
          name="full_name"
          defaultValue={initialName}
          required
          minLength={2}
          maxLength={80}
          className="max-w-md"
        />
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
        {pending ? "Speichern…" : "Name speichern"}
      </Button>
    </form>
  );
}
