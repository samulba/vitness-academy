"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SortableList } from "@/components/admin/SortableList";
import {
  modulAnlegen,
  modulAktualisieren,
  modulLoeschen,
  modulReihenfolgeBulk,
} from "../actions";

export type Modul = {
  id: string;
  title: string;
  description: string | null;
  lessons: { id: string; title: string }[];
};

export function ModuleListe({
  pfadId,
  module,
}: {
  pfadId: string;
  module: Modul[];
}) {
  const [hinzufuegenOffen, setHinzufuegenOffen] = useState(false);
  const router = useRouter();

  async function onReorder(neueIds: string[]) {
    const res = await modulReihenfolgeBulk(pfadId, neueIds);
    if (!res.ok) {
      // Fehler: Refresh um echten Server-State zurückzubekommen
      router.refresh();
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight">Module</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Strukturieren den Lernpfad. Reihenfolge per Drag-Handle ändern.
            Lektionen werden im Modul gepflegt.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => setHinzufuegenOffen(true)}
          className="gap-1.5 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)]"
        >
          <Plus className="h-4 w-4" />
          Neues Modul
        </Button>
      </header>

      {hinzufuegenOffen && (
        <NeuesModulForm
          pfadId={pfadId}
          onClose={() => setHinzufuegenOffen(false)}
        />
      )}

      {module.length === 0 ? (
        !hinzufuegenOffen && (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
            Noch keine Module. Klick auf <span className="font-medium">&bdquo;Neues Modul&ldquo;</span> um zu starten.
          </div>
        )
      ) : (
        <SortableList
          items={module}
          onReorder={onReorder}
          renderItem={(m, dragHandle) => (
            <ModulZeile pfadId={pfadId} modul={m} dragHandle={dragHandle} />
          )}
        />
      )}
    </section>
  );
}

function ModulZeile({
  pfadId,
  modul,
  dragHandle,
}: {
  pfadId: string;
  modul: Modul;
  dragHandle: React.ReactNode;
}) {
  const [bearbeiten, setBearbeiten] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function speichern(formData: FormData) {
    startTransition(async () => {
      await modulAktualisieren(pfadId, modul.id, formData);
      setBearbeiten(false);
      router.refresh();
    });
  }

  async function loeschen() {
    if (
      !confirm(`Modul „${modul.title}" inkl. aller Lektionen wirklich löschen?`)
    )
      return;
    startTransition(async () => {
      await modulLoeschen(pfadId, modul.id);
      router.refresh();
    });
  }

  if (bearbeiten) {
    return (
      <div className="rounded-xl border border-[hsl(var(--primary)/0.4)] bg-[hsl(var(--primary)/0.04)] p-4">
        <form action={speichern} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor={`modul-title-${modul.id}`}>Titel</Label>
            <Input
              id={`modul-title-${modul.id}`}
              name="title"
              defaultValue={modul.title}
              required
              maxLength={150}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`modul-desc-${modul.id}`}>Beschreibung</Label>
            <textarea
              id={`modul-desc-${modul.id}`}
              name="description"
              defaultValue={modul.description ?? ""}
              rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setBearbeiten(false)}
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
              <Check className="h-3.5 w-3.5" />
              {pending ? "Speichert…" : "Speichern"}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 transition-colors hover:border-[hsl(var(--primary)/0.4)] hover:bg-[hsl(var(--primary)/0.03)]",
        pending && "opacity-60",
      )}
    >
      {dragHandle}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{modul.title}</p>
        {modul.description && (
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {modul.description}
          </p>
        )}
      </div>
      <span className="hidden shrink-0 text-[11px] font-medium text-muted-foreground sm:inline">
        {modul.lessons.length} {modul.lessons.length === 1 ? "Lektion" : "Lektionen"}
      </span>
      <div className="flex items-center gap-0.5 opacity-60 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={() => setBearbeiten(true)}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Schnell-Edit"
          title="Inline bearbeiten"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <Link
          href={`/admin/module/${modul.id}`}
          className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Lektionen verwalten"
        >
          Lektionen <ArrowRight className="h-3 w-3" />
        </Link>
        <button
          type="button"
          onClick={loeschen}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-[hsl(var(--destructive)/0.12)] hover:text-[hsl(var(--destructive))]"
          aria-label="Modul löschen"
          title="Löschen"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function NeuesModulForm({
  pfadId,
  onClose,
}: {
  pfadId: string;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function anlegen(formData: FormData) {
    startTransition(async () => {
      await modulAnlegen(pfadId, formData);
      onClose();
      router.refresh();
    });
  }

  return (
    <div className="mb-3 rounded-xl border border-[hsl(var(--primary)/0.4)] bg-[hsl(var(--primary)/0.04)] p-4">
      <form action={anlegen} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="modul-neu-title">Titel</Label>
          <Input
            id="modul-neu-title"
            name="title"
            placeholder="z.B. Check-in und Check-out"
            required
            maxLength={150}
            autoFocus
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="modul-neu-desc">
            Beschreibung
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              (optional)
            </span>
          </Label>
          <textarea
            id="modul-neu-desc"
            name="description"
            rows={2}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
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
            {pending ? "Anlegen…" : "Modul anlegen"}
          </Button>
        </div>
      </form>
    </div>
  );
}
