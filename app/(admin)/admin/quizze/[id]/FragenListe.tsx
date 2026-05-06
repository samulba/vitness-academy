"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Plus, Trash2, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SortableList } from "@/components/admin/SortableList";
import { FrageBearbeitenInline } from "@/components/admin/FrageBearbeitenInline";
import { OptionBearbeitenInline } from "@/components/admin/OptionBearbeitenInline";
import {
  frageAnlegen,
  frageAktualisieren,
  frageLoeschen,
  frageReihenfolgeBulk,
  optionAnlegen,
  optionAktualisieren,
  optionLoeschen,
  optionReihenfolgeBulk,
} from "../actions";

export type Option = {
  id: string;
  label: string;
  is_correct: boolean;
};

export type Frage = {
  id: string;
  prompt: string;
  question_type: "single" | "multiple";
  options: Option[];
};

export function FragenListe({
  quizId,
  fragen,
}: {
  quizId: string;
  fragen: Frage[];
}) {
  const [neuOffen, setNeuOffen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const router = useRouter();

  async function onReorder(neueIds: string[]) {
    setSyncing(true);
    setSyncError(null);
    const res = await frageReihenfolgeBulk(quizId, neueIds);
    setSyncing(false);
    if (!res.ok) {
      setSyncError(res.message ?? "Speichern fehlgeschlagen");
      router.refresh();
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold tracking-tight">
            Fragen ({fragen.length})
            {syncing && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--primary)/0.1)] px-2 py-0.5 text-[10px] font-medium text-[hsl(var(--primary))]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[hsl(var(--primary))]" />
                Speichert…
              </span>
            )}
            {syncError && (
              <span className="rounded-full bg-[hsl(var(--destructive)/0.12)] px-2 py-0.5 text-[10px] font-medium text-[hsl(var(--destructive))]">
                {syncError}
              </span>
            )}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Reihenfolge per Drag-Handle. Klick auf eine Frage öffnet Inline-Edit, Antworten werden direkt darunter gepflegt.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => setNeuOffen(true)}
          className="gap-1.5 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)]"
        >
          <Plus className="h-4 w-4" />
          Neue Frage
        </Button>
      </header>

      {neuOffen && (
        <NeueFrageForm quizId={quizId} onClose={() => setNeuOffen(false)} />
      )}

      {fragen.length === 0 ? (
        !neuOffen && (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
            Noch keine Fragen. Klick auf <span className="font-medium">&bdquo;Neue Frage&ldquo;</span> um zu starten.
          </div>
        )
      ) : (
        <SortableList
          items={fragen}
          onReorder={onReorder}
          renderItem={(f, dragHandle) => (
            <FrageZeile
              quizId={quizId}
              frage={f}
              dragHandle={dragHandle}
              index={fragen.indexOf(f)}
            />
          )}
        />
      )}
    </section>
  );
}

function FrageZeile({
  quizId,
  frage,
  dragHandle,
  index,
}: {
  quizId: string;
  frage: Frage;
  dragHandle: React.ReactNode;
  index: number;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function loeschen() {
    if (!confirm("Frage inkl. Antworten wirklich löschen?")) return;
    startTransition(async () => {
      await frageLoeschen(quizId, frage.id);
      router.refresh();
    });
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-background transition-colors",
        pending && "opacity-60",
      )}
    >
      <div className="flex items-start gap-2 border-b border-border px-3 py-3">
        {dragHandle}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Frage {index + 1} ·{" "}
            {frage.question_type === "multiple"
              ? "Multiple Choice"
              : "Single Choice"}
          </p>
          <p className="mt-0.5 text-sm font-medium leading-snug">
            {frage.prompt}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <FrageBearbeitenInline
            action={frageAktualisieren.bind(null, quizId, frage.id)}
            prompt={frage.prompt}
            question_type={frage.question_type}
          />
          <button
            type="button"
            onClick={loeschen}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-[hsl(var(--destructive)/0.12)] hover:text-[hsl(var(--destructive))]"
            aria-label="Frage löschen"
            title="Frage löschen"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <OptionenListe quizId={quizId} frageId={frage.id} optionen={frage.options} />
    </div>
  );
}

function OptionenListe({
  quizId,
  frageId,
  optionen,
}: {
  quizId: string;
  frageId: string;
  optionen: Option[];
}) {
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const router = useRouter();

  async function onReorder(neueIds: string[]) {
    setSyncing(true);
    setSyncError(null);
    const res = await optionReihenfolgeBulk(frageId, neueIds);
    setSyncing(false);
    if (!res.ok) {
      setSyncError(res.message ?? "Speichern fehlgeschlagen");
      router.refresh();
    }
  }

  return (
    <div className="space-y-2 px-3 py-3">
      {syncing && (
        <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--primary)/0.1)] px-2 py-0.5 text-[10px] font-medium text-[hsl(var(--primary))]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[hsl(var(--primary))]" />
          Speichert…
        </span>
      )}
      {syncError && (
        <span className="rounded-full bg-[hsl(var(--destructive)/0.12)] px-2 py-0.5 text-[10px] font-medium text-[hsl(var(--destructive))]">
          {syncError}
        </span>
      )}

      {optionen.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground">
          Noch keine Antworten — füg unten welche hinzu.
        </p>
      ) : (
        <SortableList
          items={optionen}
          onReorder={onReorder}
          renderItem={(opt, dragHandle) => (
            <OptionZeile
              quizId={quizId}
              option={opt}
              dragHandle={dragHandle}
            />
          )}
        />
      )}

      <NeueOptionForm quizId={quizId} frageId={frageId} />
    </div>
  );
}

function OptionZeile({
  quizId,
  option,
  dragHandle,
}: {
  quizId: string;
  option: Option;
  dragHandle: React.ReactNode;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function loeschen() {
    if (!confirm("Antwort wirklich löschen?")) return;
    startTransition(async () => {
      await optionLoeschen(quizId, option.id);
      router.refresh();
    });
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-md border border-border bg-muted/20 px-2 py-1.5",
        pending && "opacity-60",
      )}
    >
      {dragHandle}
      {option.is_correct ? (
        <Badge variant="success" className="gap-1 shrink-0">
          <CheckCircle2 className="h-3 w-3" />
          Richtig
        </Badge>
      ) : (
        <Badge variant="outline" className="gap-1 shrink-0">
          <XCircle className="h-3 w-3" />
          Falsch
        </Badge>
      )}
      <span className="min-w-0 flex-1 truncate text-sm">{option.label}</span>
      <div className="flex items-center gap-1 opacity-60 transition-opacity group-hover:opacity-100">
        <OptionBearbeitenInline
          action={optionAktualisieren.bind(null, quizId, option.id)}
          label={option.label}
          is_correct={option.is_correct}
        />
        <button
          type="button"
          onClick={loeschen}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-[hsl(var(--destructive)/0.12)] hover:text-[hsl(var(--destructive))]"
          aria-label="Antwort löschen"
          title="Löschen"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function NeueOptionForm({
  quizId,
  frageId,
}: {
  quizId: string;
  frageId: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function anlegen(formData: FormData) {
    startTransition(async () => {
      await optionAnlegen(quizId, frageId, formData);
      router.refresh();
    });
  }

  return (
    <form
      action={anlegen}
      className="flex flex-wrap items-center gap-2 pt-1"
    >
      <Input
        name="label"
        placeholder="Antworttext eingeben…"
        required
        className="h-9 flex-1 min-w-[200px]"
      />
      <label className="flex shrink-0 items-center gap-1 text-xs">
        <input
          type="checkbox"
          name="is_correct"
          className="h-4 w-4 accent-[hsl(var(--primary))]"
        />
        Richtig
      </label>
      <Button
        type="submit"
        size="sm"
        disabled={pending}
        className="gap-1.5"
        variant="outline"
      >
        <Plus className="h-3.5 w-3.5" />
        Antwort
      </Button>
    </form>
  );
}

function NeueFrageForm({
  quizId,
  onClose,
}: {
  quizId: string;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function anlegen(formData: FormData) {
    startTransition(async () => {
      await frageAnlegen(quizId, formData);
      onClose();
      router.refresh();
    });
  }

  return (
    <div className="mb-3 rounded-xl border border-[hsl(var(--primary)/0.4)] bg-[hsl(var(--primary)/0.04)] p-4">
      <form action={anlegen} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="frage-prompt">Frage</Label>
          <Input
            id="frage-prompt"
            name="prompt"
            required
            placeholder="z.B. Was ist bei der Begrüßung besonders wichtig?"
            autoFocus
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="frage-typ">Typ</Label>
          <select
            id="frage-typ"
            name="question_type"
            defaultValue="single"
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="single">Single Choice (eine Antwort)</option>
            <option value="multiple">Multiple Choice (mehrere Antworten)</option>
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={pending}
            className="gap-1.5"
          >
            <X className="h-3.5 w-3.5" />
            Abbrechen
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={pending}
            className="gap-1.5 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)]"
          >
            <Plus className="h-3.5 w-3.5" />
            {pending ? "Anlegen…" : "Frage anlegen"}
          </Button>
        </div>
      </form>
    </div>
  );
}

