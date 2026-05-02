"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { INFO_KATEGORIEN, type InfoKategorie } from "@/lib/infos-types";

type Initial = {
  title: string;
  body: string;
  importance: "info" | "warning" | "critical";
  category: InfoKategorie;
  location_id: string | null;
  pinned: boolean;
  published: boolean;
};

type Standort = { id: string; name: string };

export function InfoForm({
  action,
  initial,
  modus,
  standorte,
}: {
  action: (formData: FormData) => Promise<void>;
  initial?: Initial;
  modus: "neu" | "bearbeiten";
  standorte: Standort[];
}) {
  return (
    <form action={action} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Titel</Label>
        <Input
          id="title"
          name="title"
          required
          defaultValue={initial?.title ?? ""}
          maxLength={120}
          placeholder="z.B. „Studio am Freitag ab 14 Uhr geschlossen"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="body">
          Inhalt{" "}
          <span className="text-xs font-normal text-muted-foreground">
            (Markdown unterstützt)
          </span>
        </Label>
        <textarea
          id="body"
          name="body"
          rows={6}
          defaultValue={initial?.body ?? ""}
          className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Details, Listen, **fett**, _kursiv_…"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category">Kategorie</Label>
          <select
            id="category"
            name="category"
            defaultValue={initial?.category ?? "allgemein"}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {INFO_KATEGORIEN.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location_id">Standort</Label>
          <select
            id="location_id"
            name="location_id"
            defaultValue={initial?.location_id ?? ""}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Alle Standorte</option>
            {standorte.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="importance">Wichtigkeit</Label>
          <select
            id="importance"
            name="importance"
            defaultValue={initial?.importance ?? "info"}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="info">Info</option>
            <option value="warning">Wichtig (warnt)</option>
            <option value="critical">Dringend (Banner)</option>
          </select>
          <p className="text-xs text-muted-foreground">
            „Dringend&ldquo; erscheint ungelesen als Dashboard-Banner.
          </p>
        </div>
        <div className="space-y-3 pt-1">
          <label className="flex cursor-pointer items-start gap-2 text-sm">
            <input
              type="checkbox"
              name="pinned"
              defaultChecked={initial?.pinned ?? false}
              className="mt-1 h-4 w-4 accent-[hsl(var(--primary))]"
            />
            <span>
              <span className="font-medium">Anheften</span>
              <br />
              <span className="text-xs text-muted-foreground">
                Bleibt oben in der Liste
              </span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-2 text-sm">
            <input
              type="checkbox"
              name="published"
              defaultChecked={initial?.published ?? true}
              className="mt-1 h-4 w-4 accent-[hsl(var(--primary))]"
            />
            <span>
              <span className="font-medium">Veröffentlicht</span>
              <br />
              <span className="text-xs text-muted-foreground">
                Wenn aus, sichtbar nur für Admins
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-border pt-4">
        <Button
          type="submit"
          className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)]"
        >
          {modus === "neu" ? "Info veröffentlichen" : "Änderungen speichern"}
        </Button>
      </div>
    </form>
  );
}
