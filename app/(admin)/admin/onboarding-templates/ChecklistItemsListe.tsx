"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SortableList } from "@/components/admin/SortableList";
import {
  checklistItemAktualisieren,
  checklistItemAnlegenFuer,
  checklistItemLoeschenFuer,
  checklistItemReihenfolgeBulk,
} from "./actions";

export type ChecklistItem = {
  id: string;
  label: string;
  beschreibung: string | null;
  sort_order: number;
};

/**
 * Generische Liste für Checklist-Items. Wird sowohl auf der
 * Onboarding-Templates-Übersicht (templateId=null = Standard-Items)
 * als auch auf der Template-Detail-Page (templateId=string) eingesetzt.
 */
export function ChecklistItemsListe({
  templateId,
  items,
  titel,
  beschreibung,
}: {
  templateId: string | null;
  items: ChecklistItem[];
  titel: string;
  beschreibung: string;
}) {
  const [neuOffen, setNeuOffen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const router = useRouter();

  async function onReorder(neueIds: string[]) {
    setSyncing(true);
    setSyncError(null);
    const res = await checklistItemReihenfolgeBulk(neueIds);
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
            {titel}
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
          <p className="mt-1 text-xs text-muted-foreground">{beschreibung}</p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => setNeuOffen(true)}
          className="gap-1.5 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)]"
        >
          <Plus className="h-4 w-4" />
          Neues Item
        </Button>
      </header>

      {neuOffen && (
        <NeuesItemForm
          templateId={templateId}
          onClose={() => setNeuOffen(false)}
        />
      )}

      {items.length === 0 ? (
        !neuOffen && (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
            Noch keine Items. Klick auf <span className="font-medium">&bdquo;Neues Item&ldquo;</span> um eines anzulegen.
          </div>
        )
      ) : (
        <SortableList
          items={items}
          onReorder={onReorder}
          renderItem={(item, dragHandle) => (
            <ItemZeile item={item} dragHandle={dragHandle} />
          )}
        />
      )}
    </section>
  );
}

function ItemZeile({
  item,
  dragHandle,
}: {
  item: ChecklistItem;
  dragHandle: React.ReactNode;
}) {
  const [bearbeiten, setBearbeiten] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function speichern(formData: FormData) {
    startTransition(async () => {
      await checklistItemAktualisieren(item.id, formData);
      setBearbeiten(false);
      router.refresh();
    });
  }

  async function loeschen() {
    if (!confirm(`Item „${item.label}" wirklich löschen?`)) return;
    startTransition(async () => {
      await checklistItemLoeschenFuer(item.id);
      router.refresh();
    });
  }

  if (bearbeiten) {
    return (
      <div className="rounded-xl border border-[hsl(var(--primary)/0.4)] bg-[hsl(var(--primary)/0.04)] p-4">
        <form action={speichern} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor={`item-label-${item.id}`}>Label</Label>
            <Input
              id={`item-label-${item.id}`}
              name="label"
              defaultValue={item.label}
              required
              maxLength={120}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`item-desc-${item.id}`}>
              Beschreibung
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Input
              id={`item-desc-${item.id}`}
              name="beschreibung"
              defaultValue={item.beschreibung ?? ""}
              maxLength={300}
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
        "group flex items-start gap-2 rounded-xl border border-border bg-background px-3 py-2.5 transition-colors hover:border-[hsl(var(--primary)/0.4)] hover:bg-[hsl(var(--primary)/0.03)]",
        pending && "opacity-60",
      )}
    >
      {dragHandle}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{item.label}</p>
        {item.beschreibung && (
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
            {item.beschreibung}
          </p>
        )}
      </div>
      <div className="flex items-center gap-0.5 transition-opacity [@media(hover:hover)]:opacity-60 [@media(hover:hover)]:group-hover:opacity-100">
        <button
          type="button"
          onClick={() => setBearbeiten(true)}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Bearbeiten"
          title="Bearbeiten"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={loeschen}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-[hsl(var(--destructive)/0.12)] hover:text-[hsl(var(--destructive))]"
          aria-label="Item löschen"
          title="Löschen"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function NeuesItemForm({
  templateId,
  onClose,
}: {
  templateId: string | null;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function anlegen(formData: FormData) {
    startTransition(async () => {
      await checklistItemAnlegenFuer(templateId, formData);
      onClose();
      router.refresh();
    });
  }

  return (
    <div className="mb-3 rounded-xl border border-[hsl(var(--primary)/0.4)] bg-[hsl(var(--primary)/0.04)] p-4">
      <form action={anlegen} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="item-neu-label">Label</Label>
          <Input
            id="item-neu-label"
            name="label"
            placeholder='z.B. „Schlüssel ausgehändigt"'
            required
            maxLength={120}
            autoFocus
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="item-neu-desc">
            Beschreibung
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              (optional)
            </span>
          </Label>
          <Input
            id="item-neu-desc"
            name="beschreibung"
            placeholder="Detail-Info, was zu prüfen ist"
            maxLength={300}
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
            {pending ? "Anlegen…" : "Item anlegen"}
          </Button>
        </div>
      </form>
    </div>
  );
}
