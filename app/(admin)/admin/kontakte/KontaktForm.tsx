"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Initial = {
  first_name: string | null;
  last_name: string | null;
  role_tags: string[];
  phone: string | null;
  email: string | null;
  notes: string | null;
  sort_order: number;
};

export function KontaktForm({
  action,
  initial,
  modus,
}: {
  action: (formData: FormData) => Promise<void>;
  initial?: Initial;
  modus: "neu" | "bearbeiten";
}) {
  const i = initial;

  return (
    <form action={action} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="first_name">Vorname</Label>
          <Input
            id="first_name"
            name="first_name"
            defaultValue={i?.first_name ?? ""}
            maxLength={60}
            autoComplete="given-name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Nachname</Label>
          <Input
            id="last_name"
            name="last_name"
            defaultValue={i?.last_name ?? ""}
            maxLength={60}
            autoComplete="family-name"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role_tags">
          Rollen{" "}
          <span className="text-xs font-normal text-muted-foreground">
            (mit Komma trennen — z.B. „Trainer, Service“)
          </span>
        </Label>
        <Input
          id="role_tags"
          name="role_tags"
          defaultValue={(i?.role_tags ?? []).join(", ")}
          placeholder="Vertrieb, Trainer, Service …"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Telefon</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={i?.phone ?? ""}
            placeholder="+49 …"
            autoComplete="tel"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-Mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={i?.email ?? ""}
            autoComplete="email"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notiz (optional)</Label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={i?.notes ?? ""}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Erreichbar Mo–Fr, vertretungsweise …"
        />
      </div>

      <div className="space-y-2 max-w-xs">
        <Label htmlFor="sort_order">
          Sortierung{" "}
          <span className="text-xs font-normal text-muted-foreground">
            (kleiner = weiter oben)
          </span>
        </Label>
        <Input
          id="sort_order"
          name="sort_order"
          type="number"
          defaultValue={i?.sort_order ?? 0}
        />
      </div>

      <div className="flex items-center gap-3 border-t border-border pt-4">
        <Button
          type="submit"
          className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)]"
        >
          {modus === "neu" ? "Kontakt anlegen" : "Änderungen speichern"}
        </Button>
      </div>
    </form>
  );
}
