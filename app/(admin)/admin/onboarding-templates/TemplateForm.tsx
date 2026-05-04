"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Rolle } from "@/lib/rollen";

const FELD = "h-10 rounded-lg";

const ROLE_LABELS: Record<Rolle, string> = {
  mitarbeiter: "Mitarbeiter",
  fuehrungskraft: "Führungskraft",
  admin: "Admin",
  superadmin: "Superadmin",
};

type Pfad = { id: string; title: string; description: string | null };

type Initial = {
  name: string;
  beschreibung: string | null;
  role: Rolle;
  lernpfad_ids: string[];
};

export function TemplateForm({
  action,
  initial,
  modus,
  lernpfade,
}: {
  action: (formData: FormData) => Promise<void>;
  initial?: Initial;
  modus: "neu" | "bearbeiten";
  lernpfade: Pfad[];
}) {
  const [role, setRole] = useState<Rolle>(initial?.role ?? "mitarbeiter");

  return (
    <form action={action} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">
          Template-Name
        </Label>
        <Input
          id="name"
          name="name"
          required
          maxLength={80}
          defaultValue={initial?.name ?? ""}
          placeholder='z.B. "Trainer-Onboarding"'
          className={FELD}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="beschreibung" className="text-sm font-medium">
          Beschreibung{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <textarea
          id="beschreibung"
          name="beschreibung"
          rows={2}
          maxLength={300}
          defaultValue={initial?.beschreibung ?? ""}
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm shadow-sm focus-visible:border-[hsl(var(--primary)/0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary)/0.2)]"
          placeholder="Wofür wird das Template verwendet?"
        />
      </div>

      <div className="space-y-2 max-w-sm">
        <Label className="text-sm font-medium">Standard-Rolle</Label>
        <input type="hidden" name="role" value={role} />
        <Select value={role} onValueChange={(v) => setRole(v as Rolle)}>
          <SelectTrigger className={FELD}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(ROLE_LABELS) as Rolle[]).map((r) => (
              <SelectItem key={r} value={r}>
                {ROLE_LABELS[r]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Wird beim Anlegen vorausgewählt — Admin kann beim Anlegen ändern.
        </p>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">Lernpfade vorauswählen</Label>
        {lernpfade.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            Noch keine aktiven Lernpfade vorhanden.
          </p>
        ) : (
          <ul className="space-y-2">
            {lernpfade.map((p) => (
              <li key={p.id}>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-background px-4 py-3 transition-colors hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.04)]">
                  <input
                    type="checkbox"
                    name="lernpfade"
                    value={p.id}
                    defaultChecked={initial?.lernpfad_ids.includes(p.id)}
                    className="mt-1 h-4 w-4 accent-[hsl(var(--primary))]"
                  />
                  <span className="flex-1">
                    <span className="block text-sm font-semibold">
                      {p.title}
                    </span>
                    {p.description && (
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {p.description}
                      </span>
                    )}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex justify-end border-t border-border pt-4">
        <Button
          type="submit"
          className="h-10 gap-2 rounded-lg bg-[hsl(var(--primary))] font-medium text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)]"
        >
          {modus === "neu" ? "Template anlegen" : "Änderungen speichern"}
        </Button>
      </div>
    </form>
  );
}
