"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { anmelden } from "./actions";

function AbsendenButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="lg"
      className="w-full brand-gradient text-white shadow-lg"
      disabled={pending}
    >
      {pending ? "Anmelden …" : "Anmelden"}
    </Button>
  );
}

export function LoginFormular({
  weiter,
  fehler,
}: {
  weiter?: string;
  fehler?: string;
}) {
  return (
    <form action={anmelden} className="space-y-4">
      {weiter ? <input type="hidden" name="weiter" value={weiter} /> : null}

      <div className="space-y-2">
        <Label htmlFor="email">E-Mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="vorname.nachname@studio.de"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Passwort</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>

      {fehler ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {fehler === "credentials"
            ? "Anmeldung fehlgeschlagen. Bitte E-Mail und Passwort prüfen."
            : "Es ist ein Fehler aufgetreten. Bitte erneut versuchen."}
        </p>
      ) : null}

      <AbsendenButton />
    </form>
  );
}
