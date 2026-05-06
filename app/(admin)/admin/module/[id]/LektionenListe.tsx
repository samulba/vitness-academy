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
import { VorschauButton } from "@/components/admin/VorschauButton";
import {
  lektionAktualisieren,
  lektionAnlegen,
  lektionLoeschen,
  lektionReihenfolgeBulk,
} from "./actions";

export type Lektion = {
  id: string;
  title: string;
  summary: string | null;
};

export function LektionenListe({
  modulId,
  lektionen,
}: {
  modulId: string;
  lektionen: Lektion[];
}) {
  const [neuOffen, setNeuOffen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const router = useRouter();

  async function onReorder(neueIds: string[]) {
    setSyncing(true);
    setSyncError(null);
    const res = await lektionReihenfolgeBulk(modulId, neueIds);
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
            Lektionen
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
            Reihenfolge per Drag-Handle. Klick auf ✏️ für Schnell-Edit, &bdquo;Inhalte&ldquo; für die Block-Verwaltung.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => setNeuOffen(true)}
          className="gap-1.5 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)]"
        >
          <Plus className="h-4 w-4" />
          Neue Lektion
        </Button>
      </header>

      {neuOffen && (
        <NeueLektionForm
          modulId={modulId}
          onClose={() => setNeuOffen(false)}
        />
      )}

      {lektionen.length === 0 ? (
        !neuOffen && (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
            Noch keine Lektionen. Klick auf <span className="font-medium">&bdquo;Neue Lektion&ldquo;</span> um zu starten.
          </div>
        )
      ) : (
        <SortableList
          items={lektionen}
          onReorder={onReorder}
          renderItem={(l, dragHandle) => (
            <LektionZeile modulId={modulId} lektion={l} dragHandle={dragHandle} />
          )}
        />
      )}
    </section>
  );
}

function LektionZeile({
  modulId,
  lektion,
  dragHandle,
}: {
  modulId: string;
  lektion: Lektion;
  dragHandle: React.ReactNode;
}) {
  const [bearbeiten, setBearbeiten] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function speichern(formData: FormData) {
    startTransition(async () => {
      await lektionAktualisieren(modulId, lektion.id, formData);
      setBearbeiten(false);
      router.refresh();
    });
  }

  async function loeschen() {
    if (
      !confirm(
        `Lektion „${lektion.title}" inkl. Inhalts-Blöcken und Fortschritten wirklich löschen?`,
      )
    )
      return;
    startTransition(async () => {
      await lektionLoeschen(modulId, lektion.id);
      router.refresh();
    });
  }

  if (bearbeiten) {
    return (
      <div className="rounded-xl border border-[hsl(var(--primary)/0.4)] bg-[hsl(var(--primary)/0.04)] p-4">
        <form action={speichern} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor={`lekt-title-${lektion.id}`}>Titel</Label>
            <Input
              id={`lekt-title-${lektion.id}`}
              name="title"
              defaultValue={lektion.title}
              required
              maxLength={150}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`lekt-summary-${lektion.id}`}>Kurzbeschreibung</Label>
            <textarea
              id={`lekt-summary-${lektion.id}`}
              name="summary"
              defaultValue={lektion.summary ?? ""}
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
        <p className="truncate text-sm font-medium">{lektion.title}</p>
        {lektion.summary && (
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {lektion.summary}
          </p>
        )}
      </div>
      <div className="flex items-center gap-0.5 opacity-60 transition-opacity group-hover:opacity-100">
        <VorschauButton url={`/lektionen/${lektion.id}`} variant="icon" />
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
          href={`/admin/lektionen/${lektion.id}`}
          className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Inhalts-Blöcke pflegen"
        >
          Inhalte <ArrowRight className="h-3 w-3" />
        </Link>
        <button
          type="button"
          onClick={loeschen}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-[hsl(var(--destructive)/0.12)] hover:text-[hsl(var(--destructive))]"
          aria-label="Lektion löschen"
          title="Löschen"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function NeueLektionForm({
  modulId,
  onClose,
}: {
  modulId: string;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function anlegen(formData: FormData) {
    startTransition(async () => {
      await lektionAnlegen(modulId, formData);
      onClose();
      router.refresh();
    });
  }

  return (
    <div className="mb-3 rounded-xl border border-[hsl(var(--primary)/0.4)] bg-[hsl(var(--primary)/0.04)] p-4">
      <form action={anlegen} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="lekt-neu-title">Titel</Label>
          <Input
            id="lekt-neu-title"
            name="title"
            placeholder="z.B. Begrüßung am Empfang"
            required
            maxLength={150}
            autoFocus
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lekt-neu-summary">
            Kurzbeschreibung
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              (optional)
            </span>
          </Label>
          <textarea
            id="lekt-neu-summary"
            name="summary"
            rows={2}
            placeholder="Optional, taucht in Listen auf."
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
            {pending ? "Anlegen…" : "Lektion anlegen"}
          </Button>
        </div>
      </form>
    </div>
  );
}
