"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormField, FieldType } from "@/lib/formulare";

const TYP_LABEL: Record<FieldType, string> = {
  text: "Einzeiliger Text",
  textarea: "Mehrzeiliger Text",
  date: "Datum",
  number: "Zahl",
  select: "Dropdown",
  radio: "Radio (Single Choice)",
  checkbox: "Checkbox (Ja/Nein)",
};

function leeresFeld(): FormField {
  return {
    name: "",
    label: "Neues Feld",
    type: "text",
    required: false,
    options: [],
  };
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
}

export function FieldsEditor({
  initial,
  hiddenName,
}: {
  initial: FormField[];
  hiddenName: string;
}) {
  const [fields, setFields] = useState<FormField[]>(
    initial.length > 0 ? initial : [],
  );

  function update(i: number, patch: Partial<FormField>) {
    setFields((alt) =>
      alt.map((f, idx) => (idx === i ? { ...f, ...patch } : f)),
    );
  }

  function entfernen(i: number) {
    setFields((alt) => alt.filter((_, idx) => idx !== i));
  }

  function hinzufuegen() {
    setFields((alt) => [...alt, leeresFeld()]);
  }

  function move(i: number, dir: "up" | "down") {
    setFields((alt) => {
      const ziel = dir === "up" ? i - 1 : i + 1;
      if (ziel < 0 || ziel >= alt.length) return alt;
      const neu = alt.slice();
      [neu[i], neu[ziel]] = [neu[ziel], neu[i]];
      return neu;
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <Label>Felder</Label>
        <span className="text-xs text-muted-foreground">
          {fields.length} {fields.length === 1 ? "Feld" : "Felder"}
        </span>
      </div>

      {fields.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
          Noch keine Felder. Klick auf „Feld hinzufügen“ unten.
        </div>
      ) : (
        <ul className="space-y-3">
          {fields.map((f, i) => (
            <li
              key={i}
              className="space-y-3 rounded-xl border border-border bg-muted/30 p-4"
            >
              <div className="flex items-start gap-2">
                <span className="mt-2 font-mono text-xs text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="grid flex-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor={`f-${i}-label`} className="text-xs">
                      Label (was sieht der User)
                    </Label>
                    <Input
                      id={`f-${i}-label`}
                      value={f.label}
                      onChange={(e) => {
                        const label = e.target.value;
                        update(i, {
                          label,
                          name: f.name || slugify(label),
                        });
                      }}
                      placeholder="z.B. „Datum von“"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`f-${i}-name`} className="text-xs">
                      Feld-Schlüssel (intern, snake_case)
                    </Label>
                    <Input
                      id={`f-${i}-name`}
                      value={f.name}
                      onChange={(e) =>
                        update(i, { name: slugify(e.target.value) })
                      }
                      placeholder="datum_von"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`f-${i}-type`} className="text-xs">
                      Typ
                    </Label>
                    <select
                      id={`f-${i}-type`}
                      value={f.type}
                      onChange={(e) =>
                        update(i, { type: e.target.value as FieldType })
                      }
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      {(Object.keys(TYP_LABEL) as FieldType[]).map((t) => (
                        <option key={t} value={t}>
                          {TYP_LABEL[t]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`f-${i}-placeholder`} className="text-xs">
                      Placeholder (optional)
                    </Label>
                    <Input
                      id={`f-${i}-placeholder`}
                      value={f.placeholder ?? ""}
                      onChange={(e) =>
                        update(i, { placeholder: e.target.value })
                      }
                    />
                  </div>
                  {(f.type === "select" || f.type === "radio") && (
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor={`f-${i}-options`} className="text-xs">
                        Optionen (eine pro Zeile)
                      </Label>
                      <textarea
                        id={`f-${i}-options`}
                        rows={3}
                        value={(f.options ?? []).join("\n")}
                        onChange={(e) =>
                          update(i, {
                            options: e.target.value
                              .split("\n")
                              .map((s) => s.trim())
                              .filter((s) => s.length > 0),
                          })
                        }
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                  )}
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor={`f-${i}-help`} className="text-xs">
                      Hilfetext (optional, unter dem Feld)
                    </Label>
                    <Input
                      id={`f-${i}-help`}
                      value={f.help ?? ""}
                      onChange={(e) => update(i, { help: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-3">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={f.required}
                    onChange={(e) =>
                      update(i, { required: e.target.checked })
                    }
                    className="h-4 w-4 accent-[hsl(var(--primary))]"
                  />
                  <span>Pflichtfeld</span>
                </label>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => move(i, "up")}
                    disabled={i === 0}
                    aria-label="Nach oben"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => move(i, "down")}
                    disabled={i === fields.length - 1}
                    aria-label="Nach unten"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => entfernen(i)}
                    aria-label="Feld entfernen"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={hinzufuegen}
        className="gap-1.5"
      >
        <Plus className="h-3.5 w-3.5" />
        Feld hinzufügen
      </Button>

      <input type="hidden" name={hiddenName} value={JSON.stringify(fields)} />
    </div>
  );
}
