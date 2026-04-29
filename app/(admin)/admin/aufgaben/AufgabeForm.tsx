"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Initial = {
  title: string;
  description: string | null;
  assigned_to: string | null;
  due_date: string | null;
  priority: "low" | "normal" | "high";
  recurrence: "none" | "daily" | "weekly";
  active: boolean;
};

export function AufgabeForm({
  action,
  initial,
  modus,
  mitarbeiter,
}: {
  action: (formData: FormData) => Promise<void>;
  initial?: Initial;
  modus: "neu" | "bearbeiten";
  mitarbeiter: { id: string; name: string }[];
}) {
  const i = initial;
  return (
    <form action={action} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Titel</Label>
        <Input
          id="title"
          name="title"
          required
          defaultValue={i?.title ?? ""}
          maxLength={120}
          placeholder="z.B. „Theken-Bereich abwischen“"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Beschreibung (optional)</Label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={i?.description ?? ""}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="assigned_to">Zuweisung</Label>
          <select
            id="assigned_to"
            name="assigned_to"
            defaultValue={i?.assigned_to ?? ""}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Team (alle sichtbar)</option>
            {mitarbeiter.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Priorität</Label>
          <select
            id="priority"
            name="priority"
            defaultValue={i?.priority ?? "normal"}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="low">Niedrig</option>
            <option value="normal">Normal</option>
            <option value="high">Hoch</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="recurrence">Wiederholung</Label>
          <select
            id="recurrence"
            name="recurrence"
            defaultValue={i?.recurrence ?? "none"}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="none">Einmalig</option>
            <option value="daily">Täglich</option>
            <option value="weekly">Wöchentlich</option>
          </select>
          <p className="text-xs text-muted-foreground">
            Bei Wiederholung wird die Aufgabe täglich/wöchentlich automatisch
            generiert (Template-Modus).
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="due_date">
            Fälligkeitsdatum{" "}
            <span className="text-xs font-normal text-muted-foreground">
              (nur einmalig)
            </span>
          </Label>
          <Input
            id="due_date"
            name="due_date"
            type="date"
            defaultValue={i?.due_date ?? ""}
          />
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3">
        <input
          type="checkbox"
          name="active"
          id="active"
          defaultChecked={i?.active ?? true}
          className="mt-1 h-4 w-4 accent-[hsl(var(--primary))]"
        />
        <label htmlFor="active" className="text-sm">
          <span className="font-medium">Aktiv</span>
          <span className="ml-2 text-xs text-muted-foreground">
            Wenn aus, wird die Aufgabe (auch Templates) nicht mehr generiert
            oder angezeigt.
          </span>
        </label>
      </div>

      <div className="flex items-center gap-3 border-t border-border pt-4">
        <Button
          type="submit"
          className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)]"
        >
          {modus === "neu" ? "Aufgabe anlegen" : "Änderungen speichern"}
        </Button>
      </div>
    </form>
  );
}
