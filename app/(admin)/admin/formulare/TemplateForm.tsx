"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormField, Status } from "@/lib/formulare";
import { FieldsEditor } from "./FieldsEditor";

type Initial = {
  title: string;
  description: string | null;
  status: Status;
  sort_order: number;
  fields: FormField[];
};

export function TemplateForm({
  action,
  initial,
  modus,
}: {
  action: (formData: FormData) => Promise<void>;
  initial?: Initial;
  modus: "neu" | "bearbeiten";
}) {
  return (
    <form action={action} className="space-y-8">
      <div className="space-y-5 rounded-2xl border border-border bg-card p-6">
        <div className="space-y-2">
          <Label htmlFor="title">Titel</Label>
          <Input
            id="title"
            name="title"
            required
            defaultValue={initial?.title ?? ""}
            placeholder="z.B. „Krankmeldung“"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Beschreibung (optional)</Label>
          <textarea
            id="description"
            name="description"
            rows={2}
            defaultValue={initial?.description ?? ""}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Erklärung was das Formular ist und wann es eingereicht wird"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              defaultValue={initial?.status ?? "aktiv"}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="entwurf">Entwurf (nur Admin sichtbar)</option>
              <option value="aktiv">Aktiv (Mitarbeiter sehen es)</option>
              <option value="archiviert">Archiviert</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sort_order">Sortierung</Label>
            <Input
              id="sort_order"
              name="sort_order"
              type="number"
              defaultValue={initial?.sort_order ?? 0}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <FieldsEditor
          initial={initial?.fields ?? []}
          hiddenName="fields_json"
        />
      </div>

      <div className="flex items-center gap-3 border-t border-border pt-4">
        <Button
          type="submit"
          className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)]"
        >
          {modus === "neu" ? "Formular anlegen" : "Änderungen speichern"}
        </Button>
      </div>
    </form>
  );
}
