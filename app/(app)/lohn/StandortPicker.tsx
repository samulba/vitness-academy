"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SONSTIGES_KEY = "sonstiges";

export type StandortOption = {
  id: string;
  name: string;
};

/**
 * Standort-Auswahl für Schichten:
 *   - Dropdown: alle Studios + "Sonstiges"
 *   - Bei "Sonstiges": Freitext-Feld erscheint
 *
 * Form-Felder die diese Component setzt:
 *   - "wo"      : UUID des Studios oder "sonstiges"
 *   - "bereich" : Freitext (nur wenn "sonstiges" ausgewählt)
 *
 * Default-Auswahl:
 *   - Wenn defaultLocationId gesetzt + ist in standorte → dieses Studio
 *   - Sonst wenn defaultBereich gesetzt → "sonstiges" + Freitext
 *   - Sonst aktiverStandortId
 *   - Sonst erstes Studio
 */
export function StandortPicker({
  standorte,
  defaultLocationId,
  defaultBereich,
  aktiverStandortId,
  size = "default",
}: {
  standorte: StandortOption[];
  defaultLocationId?: string | null;
  defaultBereich?: string | null;
  aktiverStandortId?: string | null;
  size?: "sm" | "default";
}) {
  const initial =
    defaultBereich && !defaultLocationId
      ? SONSTIGES_KEY
      : defaultLocationId && standorte.some((s) => s.id === defaultLocationId)
        ? defaultLocationId
        : aktiverStandortId &&
            standorte.some((s) => s.id === aktiverStandortId)
          ? aktiverStandortId
          : (standorte[0]?.id ?? SONSTIGES_KEY);

  const [wo, setWo] = useState<string>(initial);
  const [bereichText, setBereichText] = useState<string>(defaultBereich ?? "");

  const istSonstiges = wo === SONSTIGES_KEY;
  const labelKlass =
    "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground";
  // Mobile: größer für bessere Touch-Targets, Desktop kompakter
  const inputHeight = size === "sm" ? "h-10 sm:h-9" : "h-11 sm:h-10";

  return (
    <div className="space-y-3">
      <div>
        <Label className={labelKlass}>Wo gearbeitet</Label>
        <input type="hidden" name="wo" value={wo} />
        <Select value={wo} onValueChange={setWo}>
          <SelectTrigger className={`${inputHeight} mt-1 rounded-lg`}>
            <SelectValue placeholder="Wählen …" />
          </SelectTrigger>
          <SelectContent>
            {standorte.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
            <SelectItem value={SONSTIGES_KEY}>
              Sonstiges (Meeting, Homeoffice …)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {istSonstiges && (
        <div>
          <Label htmlFor="bereich" className={labelKlass}>
            Was war das?
          </Label>
          <Input
            id="bereich"
            name="bereich"
            type="text"
            placeholder="z.B. Meeting · Homeoffice · Schulung"
            maxLength={80}
            value={bereichText}
            onChange={(e) => setBereichText(e.target.value)}
            required
            className={`${inputHeight} mt-1 rounded-lg`}
          />
        </div>
      )}
    </div>
  );
}
