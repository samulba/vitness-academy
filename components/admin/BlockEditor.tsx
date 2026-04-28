"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SpeichernButton } from "@/components/admin/SpeichernButton";
import {
  QuizOptionenEditor,
  type QuizOptionItem,
} from "@/components/admin/QuizOptionenEditor";
import {
  AkkordeonItemsEditor,
  type AkkordeonItemEntry,
} from "@/components/admin/AkkordeonItemsEditor";
import {
  SzenarioOptionenEditor,
  type SzenarioOptionItem,
} from "@/components/admin/SzenarioOptionenEditor";
import {
  SchritteEditor,
  type SchrittEntry,
} from "@/components/admin/SchritteEditor";

type BlockTyp =
  | "text"
  | "checkliste"
  | "video_url"
  | "hinweis"
  | "aufdeck_karte"
  | "inline_quiz"
  | "akkordeon"
  | "sortieren"
  | "szenario"
  | "schritte";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  // Vorbelegung beim Bearbeiten
  initial?: {
    block_type: BlockTyp;
    content: Record<string, unknown>;
  };
  // "anlegen" oder "bearbeiten"
  modus: "anlegen" | "bearbeiten";
  onAbbrechen?: () => void;
};

export function BlockEditor({ action, initial, modus, onAbbrechen }: Props) {
  const [typ, setTyp] = useState<BlockTyp>(
    (initial?.block_type as BlockTyp) ?? "text",
  );

  const c = initial?.content ?? {};
  const itemsString = Array.isArray((c as { items?: unknown[] }).items)
    ? ((c as { items: string[] }).items ?? []).join("\n")
    : "";
  const initialQuizOptionen = Array.isArray(
    (c as { optionen?: unknown[] }).optionen,
  )
    ? ((c as { optionen: QuizOptionItem[] }).optionen ?? [])
    : [];
  const initialAkkordeonItems = Array.isArray(
    (c as { items?: unknown[] }).items,
  ) && typ === "akkordeon"
    ? ((c as { items: AkkordeonItemEntry[] }).items ?? [])
    : [];
  const initialSortierString = Array.isArray(
    (c as { schritte_korrekt?: unknown[] }).schritte_korrekt,
  )
    ? ((c as { schritte_korrekt: string[] }).schritte_korrekt ?? []).join("\n")
    : "";
  const initialSzenarioOptionen = Array.isArray(
    (c as { optionen?: unknown[] }).optionen,
  ) && typ === "szenario"
    ? ((c as { optionen: SzenarioOptionItem[] }).optionen ?? [])
    : [];
  const initialSchritte = Array.isArray(
    (c as { schritte?: unknown[] }).schritte,
  )
    ? ((c as { schritte: SchrittEntry[] }).schritte ?? [])
    : [];

  return (
    <form action={action} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="block_type">Typ</Label>
        <select
          id="block_type"
          name="block_type"
          value={typ}
          onChange={(e) => setTyp(e.target.value as BlockTyp)}
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="text">Text (Markdown)</option>
          <option value="checkliste">Checkliste</option>
          <option value="hinweis">Hinweis-Box</option>
          <option value="video_url">Video-Link</option>
          <option value="aufdeck_karte">Aufdeck-Karte</option>
          <option value="inline_quiz">Mini-Quiz inline</option>
          <option value="akkordeon">Akkordeon (FAQ)</option>
          <option value="sortieren">Sortier-Aufgabe</option>
          <option value="szenario">Szenario / Entscheidung</option>
          <option value="schritte">Schritt-für-Schritt-Walkthrough</option>
        </select>
      </div>

      {typ === "text" ? (
        <div className="space-y-2">
          <Label htmlFor="markdown">Markdown-Inhalt</Label>
          <textarea
            id="markdown"
            name="markdown"
            rows={10}
            defaultValue={String((c as { markdown?: string }).markdown ?? "")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="## Überschrift&#10;&#10;**Fett** und _kursiv_, Listen mit -, Code mit `…`."
          />
          <p className="text-xs text-muted-foreground">
            Markdown wird mit GitHub-Flavor gerendert.
          </p>
        </div>
      ) : null}

      {typ === "checkliste" ? (
        <div className="space-y-2">
          <Label htmlFor="items">Punkte (eine Zeile pro Punkt)</Label>
          <textarea
            id="items"
            name="items"
            rows={6}
            defaultValue={itemsString}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder={"Blickkontakt aufnehmen\nAktiv begrüßen\nLächeln"}
          />
        </div>
      ) : null}

      {typ === "hinweis" ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="variant">Variante</Label>
            <select
              id="variant"
              name="variant"
              defaultValue={String((c as { variant?: string }).variant ?? "info")}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="info">Info</option>
              <option value="warnung">Warnung</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="markdown">Inhalt (Markdown)</Label>
            <textarea
              id="markdown"
              name="markdown"
              rows={4}
              defaultValue={String((c as { markdown?: string }).markdown ?? "")}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </>
      ) : null}

      {typ === "video_url" ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="url">Video-URL</Label>
            <Input
              id="url"
              name="url"
              type="url"
              required
              defaultValue={String((c as { url?: string }).url ?? "")}
              placeholder="https://www.youtube.com/watch?v=…"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="video_title">Anzeigename</Label>
            <Input
              id="video_title"
              name="video_title"
              defaultValue={String((c as { title?: string }).title ?? "")}
              placeholder="z.B. „Begrüßung Best Practice"
            />
          </div>
        </>
      ) : null}

      {typ === "aufdeck_karte" ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="frage">Frage / Vorderseite</Label>
            <Input
              id="frage"
              name="frage"
              required
              defaultValue={String((c as { frage?: string }).frage ?? "")}
              placeholder="z.B. „Wie reagierst du, wenn das Ladesystem ausfällt?"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="antwort_markdown">Antwort (Markdown)</Label>
            <textarea
              id="antwort_markdown"
              name="antwort_markdown"
              rows={5}
              defaultValue={String(
                (c as { antwort_markdown?: string }).antwort_markdown ?? "",
              )}
              className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Erscheint nach Klick. Listen, **fett**, _kursiv_ erlaubt."
            />
          </div>
        </>
      ) : null}

      {typ === "inline_quiz" ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="quiz_typ">Antwort-Typ</Label>
            <select
              id="quiz_typ"
              name="quiz_typ"
              defaultValue={
                String((c as { typ?: string }).typ ?? "single") === "multiple"
                  ? "multiple"
                  : "single"
              }
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="single">Single Choice (eine richtige Antwort)</option>
              <option value="multiple">Multiple Choice (mehrere möglich)</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="frage">Frage</Label>
            <Input
              id="frage"
              name="frage"
              required
              defaultValue={String((c as { frage?: string }).frage ?? "")}
              placeholder="z.B. „Welche Schritte gehören zum Standard-Check-in?"
            />
          </div>
          <QuizOptionenEditor
            initial={initialQuizOptionen}
            hiddenName="optionen_json"
          />
          <p className="text-xs text-muted-foreground">
            Mindestens eine richtige Antwort markieren. Erklärungen sind
            optional und werden nach dem Prüfen angezeigt.
          </p>
        </>
      ) : null}

      {typ === "akkordeon" ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="einleitung">Einleitung (optional)</Label>
            <textarea
              id="einleitung"
              name="einleitung"
              rows={2}
              defaultValue={String(
                (c as { einleitung?: string | null }).einleitung ?? "",
              )}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Kurzer Vorspann über der Liste (Markdown möglich)."
            />
          </div>
          <AkkordeonItemsEditor
            initial={initialAkkordeonItems}
            hiddenName="items_json"
          />
        </>
      ) : null}

      {typ === "sortieren" ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="aufgabe">Aufgabe / Frage</Label>
            <Input
              id="aufgabe"
              name="aufgabe"
              required
              defaultValue={String((c as { aufgabe?: string }).aufgabe ?? "")}
              placeholder="z.B. „Bringe die Schritte des Check-ins in die richtige Reihenfolge."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="schritte_korrekt">
              Schritte in der korrekten Reihenfolge (eine Zeile pro Schritt)
            </Label>
            <textarea
              id="schritte_korrekt"
              name="schritte_korrekt"
              rows={6}
              defaultValue={initialSortierString}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder={
                "Mitglied begrüßen\nMitgliedskarte einscannen\nAuf grünes Signal warten\nFreundlich verabschieden"
              }
            />
            <p className="text-xs text-muted-foreground">
              Mitarbeiter sehen die Schritte zufällig gemischt und müssen sie
              in diese Reihenfolge bringen.
            </p>
          </div>
        </>
      ) : null}

      {typ === "szenario" ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="situation_markdown">Situation (Markdown)</Label>
            <textarea
              id="situation_markdown"
              name="situation_markdown"
              rows={4}
              required
              defaultValue={String(
                (c as { situation_markdown?: string }).situation_markdown ?? "",
              )}
              className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Beschreibe die Lage. _Mitglied wirkt aufgebracht und beschwert sich über…_"
            />
          </div>
          <SzenarioOptionenEditor
            initial={initialSzenarioOptionen}
            hiddenName="szenario_optionen_json"
          />
          <p className="text-xs text-muted-foreground">
            Pro Option ein Feedback — Mitarbeiter sehen es nach ihrer Wahl.
          </p>
        </>
      ) : null}

      {typ === "schritte" ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="schritte_titel">Walkthrough-Titel</Label>
            <Input
              id="schritte_titel"
              name="schritte_titel"
              required
              defaultValue={String((c as { titel?: string }).titel ?? "")}
              placeholder="z.B. „Standard-Check-in in 4 Schritten"
            />
          </div>
          <SchritteEditor
            initial={initialSchritte}
            hiddenName="schritte_json"
          />
        </>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
        {onAbbrechen ? (
          <Button type="button" variant="ghost" size="sm" onClick={onAbbrechen}>
            Abbrechen
          </Button>
        ) : null}
        <SpeichernButton
          label={modus === "anlegen" ? "Block hinzufügen" : "Block speichern"}
        />
      </div>
    </form>
  );
}
