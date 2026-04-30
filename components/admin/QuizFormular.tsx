"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SpeichernButton } from "@/components/admin/SpeichernButton";

type Lektion = { id: string; title: string };
type Modul = { id: string; title: string };

type Werte = {
  title?: string;
  description?: string | null;
  passing_score?: number;
  lesson_id?: string | null;
  module_id?: string | null;
  status?: string;
};

type Bindung = "lesson" | "module";

const SELECT_CLASS =
  "h-9 w-full rounded-md border border-border bg-background px-3 text-[13px] focus-visible:border-[hsl(var(--ring))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export function QuizFormular({
  action,
  lektionen,
  module,
  werte,
  modus,
}: {
  action: (formData: FormData) => Promise<void> | void;
  lektionen: Lektion[];
  module: Modul[];
  werte?: Werte;
  modus: "anlegen" | "bearbeiten";
}) {
  const initial: Bindung = werte?.module_id ? "module" : "lesson";
  const [bindung, setBindung] = useState<Bindung>(initial);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="title">Titel</Label>
        <Input
          id="title"
          name="title"
          required
          maxLength={200}
          defaultValue={werte?.title ?? ""}
          placeholder="z.B. Quiz: Begrüßung am Empfang"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Beschreibung</Label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={werte?.description ?? ""}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] focus-visible:border-[hsl(var(--ring))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          placeholder="Was wird im Quiz geprüft?"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="passing_score">Bestehensgrenze (%)</Label>
          <Input
            id="passing_score"
            name="passing_score"
            type="number"
            min={0}
            max={100}
            defaultValue={werte?.passing_score ?? 80}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={werte?.status ?? "aktiv"}
            className={SELECT_CLASS}
          >
            <option value="entwurf">Entwurf</option>
            <option value="aktiv">Aktiv</option>
            <option value="archiviert">Archiviert</option>
          </select>
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
        <Label>Bindung</Label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-[13px]">
            <input
              type="radio"
              name="bindung_radio"
              checked={bindung === "lesson"}
              onChange={() => setBindung("lesson")}
              className="accent-[hsl(var(--primary))]"
            />
            An eine Lektion
          </label>
          <label className="flex items-center gap-2 text-[13px]">
            <input
              type="radio"
              name="bindung_radio"
              checked={bindung === "module"}
              onChange={() => setBindung("module")}
              className="accent-[hsl(var(--primary))]"
            />
            An ein ganzes Modul
          </label>
        </div>

        {bindung === "lesson" ? (
          <div className="space-y-1.5">
            <Label htmlFor="lesson_id" className="sr-only">
              Lektion
            </Label>
            <select
              id="lesson_id"
              name="lesson_id"
              required
              defaultValue={werte?.lesson_id ?? ""}
              className={SELECT_CLASS}
            >
              <option value="">Lektion wählen …</option>
              {lektionen.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </select>
            <input type="hidden" name="module_id" value="" />
          </div>
        ) : (
          <div className="space-y-1.5">
            <Label htmlFor="module_id" className="sr-only">
              Modul
            </Label>
            <select
              id="module_id"
              name="module_id"
              required
              defaultValue={werte?.module_id ?? ""}
              className={SELECT_CLASS}
            >
              <option value="">Modul wählen …</option>
              {module.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
            <input type="hidden" name="lesson_id" value="" />
          </div>
        )}
      </div>

      <div className="flex justify-end pt-1">
        <SpeichernButton
          label={modus === "anlegen" ? "Quiz anlegen" : "Quiz speichern"}
        />
      </div>
    </form>
  );
}
